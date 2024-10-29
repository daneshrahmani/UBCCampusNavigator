import { InsightError, InsightDatasetKind, InsightResult } from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import * as path from "path";
import Section from "./Section";
import { DATA_DIR } from "../controller/InsightFacade";
import Room from "./Room";

export function validateId(id: string): void {
	// RegExp from ChatGPT
	const validIDRegExp = /^(?!.*_)(?=.*\S).+$/;

	if (!validIDRegExp.test(id)) {
		throw new InsightError("Invalid ID");
	}
}

export async function addToDisk(id: string, data: Section[] | Room[]): Promise<void> {
	const datasetFilePath = path.join(DATA_DIR, id);
	if (await fs.pathExists(datasetFilePath)) {
		throw new InsightError(`Dataset ${id} already exists in disk memory`);
	}

	await fs.writeJson(datasetFilePath, {
		data: data,
	});
}

export async function getAddedDatasetIDs(): Promise<string[]> {
	return await fs.readdir(DATA_DIR);
}

export function validateQueryStructure(query: unknown): string {
	if (
		!(
			typeof query === "object" &&
			!Array.isArray(query) &&
			query !== null &&
			"WHERE" in query &&
			!Array.isArray(query.WHERE) &&
			"OPTIONS" in query &&
			typeof query.OPTIONS === "object" &&
			!Array.isArray(query.OPTIONS) &&
			query.OPTIONS !== null &&
			"COLUMNS" in query.OPTIONS &&
			query.OPTIONS.COLUMNS !== null &&
			Array.isArray(query.OPTIONS.COLUMNS) &&
			query.OPTIONS.COLUMNS.length >= 1
		)
	) {
		throw new InsightError("Invalid Query Structure");
	} else {
		const datasetId = validateOptions(query);
		validateWhereClause(query.WHERE, datasetId);
		return datasetId;
	}
}

export function sectionSatisfies(whereClause: any, section: any): boolean {
	const whereClauseEntries = Object.entries(whereClause);
	if (whereClauseEntries.length === 0) {
		return true;
	} else if (whereClauseEntries.length > 1) {
		throw new InsightError("Invalid Query");
	} else {
		const key = whereClauseEntries[0][0];
		const val: any = whereClauseEntries[0][1];
		if (key === "AND") {
			return val.every((subClause: any) => sectionSatisfies(subClause, section));
		} else if (key === "OR") {
			return val.some((subClause: any) => sectionSatisfies(subClause, section));
		} else if (key === "LT") {
			const [mfield, number] = parseMComparison(val);
			return section[mfield] < number;
		} else if (key === "GT") {
			const [mfield, number] = parseMComparison(val);
			return section[mfield] > number;
		} else if (key === "EQ") {
			const [mfield, number] = parseMComparison(val);
			return section[mfield] === number;
		} else if (key === "IS") {
			const [sfield, pattern] = parseSComparison(val);
			return pattern.test(section[sfield]);
		} else if (key === "NOT") {
			return !sectionSatisfies(val, section);
		} else {
			throw new InsightError("Invalid key");
		}
	}
}

export function sortedResults(results: InsightResult[], query: any): InsightResult[] {
	const orderingKey = query.OPTIONS.ORDER;
	return results.sort((a: any, b: any) => {
		if (a[orderingKey] < b[orderingKey]) {
			return -1;
		}
		if (a[orderingKey] > b[orderingKey]) {
			return 1;
		}
		return 0;
	});
}

function parseMComparison(mComparison: object): [string, number] {
	const mComparisonEntries = Object.entries(mComparison);
	if (mComparisonEntries.length !== 1) {
		throw new InsightError("Invalid query");
	} else {
		const mkey = mComparisonEntries[0][0];
		const mfield = mkey.split("_")[1];
		const number = Number(mComparisonEntries[0][1]);
		return [mfield, number];
	}
}

function parseSComparison(sComparison: object): [string, RegExp] {
	const sComparisonEntries = Object.entries(sComparison);
	if (sComparisonEntries.length !== 1) {
		throw new InsightError("Invalid query");
	} else {
		const skey = sComparisonEntries[0][0];
		const sfield = skey.split("_")[1];
		const pattern = RegExp("^" + sComparisonEntries[0][1].replace(/\*/g, ".*") + "$");
		return [sfield, pattern];
	}
}

const validFilters = ["NOT", "AND", "OR", "LT", "GT", "EQ", "IS"];
const validFields = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];

// Validate the options field of the query and return the dataset id
function validateOptions(query: any): string {
	let datasetId = null;
	const queryColumns = query.OPTIONS.COLUMNS;
	const maxLength = 2;
	for (const column of queryColumns) {
		const parsedColumn = column.split("_");
		if (parsedColumn.length !== maxLength) {
			throw new InsightError("Invalid column selection");
		}

		if (datasetId === null) {
			datasetId = parsedColumn[0];
		} else if (datasetId !== parsedColumn[0]) {
			throw new InsightError("Query references multiple datasets");
		}

		if (!validFields.includes(parsedColumn[1])) {
			throw new InsightError("Invalid column selection");
		}
	}
	if (query.OPTIONS.ORDER && !queryColumns.includes(query.OPTIONS.ORDER)) {
		throw new InsightError("Order key does not exist in the columns being queried");
	}
	return datasetId;
}

function validateWhereClause(whereClause: any, datasetId: string): void {
	const whereClauseEntries = Object.entries(whereClause);
	if (whereClauseEntries.length === 0) {
		return;
	} else if (whereClauseEntries.length > 1) {
		throw new InsightError("Invalid Query");
	} else {
		const key = whereClauseEntries[0][0];
		const val: any = whereClauseEntries[0][1];
		if (validFilters.includes(key)) {
			if (key === "AND" || key === "OR") {
				validateLogicFilters(val);
				for (const subclause of val) {
					validateWhereClause(subclause, datasetId);
				}
			} else {
				validateNonLogicFilters(key, val);
				validateWhereClause(val, datasetId);
			}
		} else {
			// Expect key to be of the form "sections_avg" for example
			const maxLength = 2;
			const parsedKey = key.split("_");
			if (parsedKey.length !== maxLength) {
				throw new InsightError("Invalid query");
			}
			if (parsedKey[0] !== datasetId) {
				throw new InsightError("Query references multiple datasets");
			}
			if (!validFields.includes(parsedKey[1])) {
				throw new InsightError("Where clause contains invalid field");
			}
		}
	}
}

// For validating that AND, OR & NOT are not empty
function validateLogicFilters(logicFilter: any): void {
	if (Array.isArray(logicFilter) && logicFilter.length > 0) {
		return;
	} else if (Object.keys(logicFilter).length > 0) {
		return;
	}
	throw new InsightError("AND/OR/NOT cannot be empty");
}

function validateNonLogicFilters(key: any, val: any): void {
	const stringFields = ["dept", "id", "instructor", "title", "uuid"];
	const [[objectKey], [objectValue]] = [Object.keys(val), Object.values(val)];

	switch (key) {
		case "NOT":
			validateLogicFilters(val);
			break;
		case "EQ":
		case "GT":
		case "LT": {
			// Checking that Key exists and is not a string type
			if (!objectKey) {
				throw new InsightError("Missing key for EQ, GT, or LT");
			}
			const field = objectKey.split("_");
			if (field.length > 1 && stringFields.includes(field[1])) {
				throw new InsightError("Invalid Key type for EQ, GT, or LT");
			}

			// Checking that Value is of type Number
			if (typeof objectValue !== "number") {
				throw new InsightError("Invalid Value type for EQ, GT or LT. Value type must be a number");
			}

			break;
		}
		case "IS": {
			// Check that IS value is a string type
			if (typeof objectValue !== "string") {
				throw new InsightError("Invalid Value type for IS. Value type must be a string");
			}

			// Check that if wildcards are used, they are not embedded
			if (objectValue.includes("*")) {
				if ((!objectValue.startsWith("*") && !objectValue.endsWith("*")) || objectValue === "***") {
					throw new InsightError("Invalid use of Wildcard. Wildcard cannot be embedded in a word.");
				}
			}

			break;
		}
	}
}
