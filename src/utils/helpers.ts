import { InsightError, InsightDatasetKind, InsightResult } from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import * as path from "path";
import Section from "./Section";
import InsightFacade, { DATA_DIR } from "../controller/InsightFacade";
import Room from "./Room";

export function validateId(id: string): void {
	// RegExp from ChatGPT
	const validIDRegExp = /^(?!.*_)(?=.*\S).+$/;

	if (!validIDRegExp.test(id)) {
		throw new InsightError("Invalid ID");
	}
}

export async function addToDisk(id: string, data: Section[] | Room[], kind: InsightDatasetKind): Promise<void> {
	const datasetFilePath = path.join(DATA_DIR, id);
	if (await fs.pathExists(datasetFilePath)) {
		throw new InsightError(`Dataset ${id} already exists in disk memory`);
	}

	await fs.writeJson(datasetFilePath, {
		data: data,
		kind: kind,
	});
}

export async function getAddedDatasetIDs(): Promise<string[]> {
	return fs.readdir(DATA_DIR);
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
		let datasetId = null;
		const vtResults = validateTransformations(query, datasetId);
		datasetId = vtResults[0];
		const transformationsColumns = vtResults[1];
		datasetId = validateOptions(query, datasetId, transformationsColumns);
		if (datasetId === null) {
			throw new InsightError("bad");
		}
		validateWhereClause(query.WHERE, datasetId);
		// TODO create and call validateTransformations (optional to have a transformations clause)
		return datasetId;
	}
}

const validApplyTokens = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

function validateApplyClause(query: any, applyColumns: string[], datasetId: string | null): string | null {
	for (const rule of query.TRANSFORMATIONS.APPLY) {
		if (Object.keys(rule).length !== 1) {
			throw new InsightError("Invalid APPLYRULE");
		}
		const key = Object.keys(rule)[0];
		applyColumns.push(key);
		if (Object.keys(rule[key]).length !== 1) {
			throw new InsightError("Invalid APPLYRULE");
		}
		const applyToken = Object.keys(rule[key])[0];
		if (!validApplyTokens.includes(applyToken)) {
			throw new InsightError("Invalid APPLYTOKEN");
		}
		const dataKey = rule[key][applyToken];

		const dataKeyParts = dataKey.split("_");
		const expectedNumKeyParts = 2
		if (dataKeyParts.length !== expectedNumKeyParts) {
			throw new InsightError("Invalid data reference");
		}
		if (datasetId === null) {
			datasetId = dataKeyParts[0];
		} else if (datasetId !== dataKeyParts[0]) {
			throw new InsightError("Query references multiple datasets");
		}
	}
	return datasetId
}

function validateTransformations(query: any, datasetId: string | null): any {
	const groupColumns: string[] = [];
	const applyColumns: string[] = [];
	if (query.TRANSFORMATIONS) {
		
		datasetId = validateApplyClause(query, applyColumns, datasetId);

		if (query.TRANSFORMATIONS.GROUP.length === 0) {
			throw new InsightError("GROUP must be a non-empty array");
		}
		for (const dataKey of query.TRANSFORMATIONS.GROUP) {
			const dataKeyParts = dataKey.split("_");
			const expectedNumKeyParts = 2
			if (dataKeyParts.length !== expectedNumKeyParts) {
				throw new InsightError("Invalid data reference");
			}
			if (datasetId === null) {
				datasetId = dataKeyParts[0];
			} else if (datasetId !== dataKeyParts[0]) {
				throw new InsightError("Query references multiple datasets");
			}
			groupColumns.push(dataKey);
		}
	}
	return [datasetId, [...groupColumns, ...applyColumns]];
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

export function transformResults(results: any) {
	console.log(results);
}

export function sortedResults(results: InsightResult[], query: any): InsightResult[] {
	// TODO change up to accomodate OPTIONS.SORT as per spec
	const MAX_ORDER_KEYS = 2;

	if (typeof query.OPTIONS.ORDER === "string") {
		return simpleSort(results, query.OPTIONS.ORDER);
	} else if (
		"dir" in query.OPTIONS.ORDER &&
		"keys" in query.OPTIONS.ORDER &&
		Object.keys(query.OPTIONS.ORDER).length === MAX_ORDER_KEYS
	) {
		return complexSort(results, query.OPTIONS.ORDER);
	} else {
		throw new InsightError("Invalid sorting clause");
	}
}

function simpleSort(results: InsightResult[], orderingKey: string): InsightResult[] {
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

function complexSort(results: InsightResult[], order: any): InsightResult[] {
	if (order.dir !== "DOWN" && order.dir !== "UP") {
		throw new InsightError("Invalid ORDER direction");
	}

	let flipSortDirection = 1;
	if (order.dir === "DOWN") {
		flipSortDirection = -1;
	}

	results.sort((a: any, b: any) => {
		for (const key of order.keys) {
			if (a[key] < b[key]) {
				return -1 * flipSortDirection;
			} else if (a[key] > b[key]) {
				return flipSortDirection;
			}
		}
		return 0;
	});

	return results;
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
// TODO: maybe separate these out between room fields and section fields
const validFields = [
	"avg",
	"pass",
	"fail",
	"audit",
	"year",
	"dept",
	"id",
	"instructor",
	"title",
	"uuid",
	"fullname",
	"shortname",
	"number",
	"name",
	"address",
	"lat",
	"lon",
	"seats",
	"type",
	"furniture",
	"href",
];

// Validate the options field of the query and return the dataset id
function validateOptions(query: any, datasetId: any, transformationsColumns: any) {
	const queryColumns = query.OPTIONS.COLUMNS;

	if (transformationsColumns.length !== 0) {
		for (const column of queryColumns) {
			if (!transformationsColumns.includes(column)) {
				throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
			}
		}
	} else {
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
		if (query.OPTIONS.ORDER) {
			if (typeof query.OPTIONS.ORDER === "string" && !queryColumns.includes(query.OPTIONS.ORDER)) {
				throw new InsightError("Order key does not exist in the columns being queried");
			}
		}
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
	const [[objectKey], [objectValue]] = [Object.keys(val), Object.values(val)];

	switch (key) {
		case "NOT":
			validateLogicFilters(val);
			break;
		case "EQ":
		case "GT":
		case "LT": {
			validateNumericComparators(objectKey, objectValue);
			break;
		}
		case "MAX":
		case "MIN":
		case "AVG":
		case "SUM":
			validateApplyTokens(objectKey, objectValue);
			break;
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

// Validating Keys and Values for EQ, GT, LT
function validateNumericComparators(objectKey: any, objectValue: any): void {
	const stringFieldsSections = ["dept", "id", "instructor", "title", "uuid",
	"fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
	// Checking that Key exists and is not a string type
	if (!objectKey) {
		throw new InsightError("Missing key for EQ, GT, or LT");
	}
	const field = objectKey.split("_");
	if (field.length > 1 && stringFieldsSections.includes(field[1])) {
		throw new InsightError("Invalid Key type for EQ, GT, or LT");
	}

	// Checking that Value is a number
	if (typeof objectValue !== "number") {
		throw new InsightError("Invalid Value type for EQ, GT, LT. Value type must be a number");
	}
}

function validateApplyTokens(objectKey: any, objectValue: any): void {
	const validTokenValues = ["lat", "lon", "seats", "year", "avg", "pass", "fail", "audit"]

	if (!objectKey) {
		throw new InsightError("Missing key for EQ, GT, or LT");
	}

	// Checking that MAX, MIN, SUM, AVG value column is a numeric type
	if (!validTokenValues.includes(objectValue.split("_")[1])) {
		throw new InsightError("Invalid Value type for MAX, MIN, AVG, SUM. Value type must be numeric column")
	}
}
