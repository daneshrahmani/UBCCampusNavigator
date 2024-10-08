import { InsightError, InsightDatasetKind } from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import * as path from "path";
import Section from "./Section";
import { DATA_DIR } from "../controller/InsightFacade";

export function validateId(id: string): void {
	// RegExp from ChatGPT
	const validIDRegExp = /^(?!.*_)(?=.*\S).+$/;

	if (!validIDRegExp.test(id)) {
		throw new InsightError("Invalid ID");
	}
}

export function addDatasetParameterValidity(id: string, kind: InsightDatasetKind): void {
	validateId(id);

	// To be removed in a later checkpoint
	if (kind !== InsightDatasetKind.Sections) {
		throw new InsightError("Unsupported DatasetKind (for now");
	}
}

export async function addToDisk(id: string, sections: Section[]): Promise<void> {
	const datasetFilePath = path.join(DATA_DIR, id);
	if (await fs.pathExists(datasetFilePath)) {
		throw new InsightError(`Dataset ${id} already exists in disk memory`);
	}

	await fs.writeJson(datasetFilePath, {
		sections: sections,
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
		return datasetId
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
			return pattern.test(sfield);
		} else if (key === "NOT") {
			return !sectionSatisfies(val, section);
		} else {
			throw new InsightError("Invalid key");
		}
	}
}

function parseMComparison(mComparison: object) {
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
		const pattern = RegExp(sComparisonEntries[0][1]);
		return [sfield, pattern];
	}
}

const validFilters = ["NOT", "AND", "OR", "LT", "GT", "EQ", "IS"];
const validFields = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];

// Validate the options field of the query and return the dataset id
function validateOptions(query: any) {
	let datasetId = null;
	const queryColumns = query.OPTIONS.COLUMNS;
	for (const column of queryColumns) {
		const parsedColumn = column.split("_");
		if (parsedColumn.length !== 2) {
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
	return datasetId;
}

function validateWhereClause(whereClause: any, datasetId: string) {
	const whereClauseEntries = Object.entries(whereClause);
	if (whereClauseEntries.length === 0) {
		return;
	} else if (whereClauseEntries.length > 1) {
		throw new InsightError("Invalid Query");
	} else {
		const key = whereClauseEntries[0][0];
		const val = whereClauseEntries[0][1];
		if (validFilters.includes(key)) {
			validateWhereClause(val, datasetId);
		} else {
			// Expect key to be of the form "sections_avg for example
			const parsedKey = key.split("_");
			if (parsedKey.length !== 2) {
				throw new InsightError("Invalid query");
			}
			if (parsedKey[0] !== datasetId) {
				throw new InsightError("Query references multiple datasets");
			}
			if (!(validFields.includes(parsedKey[1]))) {
				throw new InsightError("Where clause contains invalid field");
			}
		}
	}
}
