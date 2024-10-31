import {InsightError} from "../../controller/IInsightFacade";
import {validateLogicFilters, validateNonLogicFilters} from "./filterComparatorValidation";

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

const validApplyTokens = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

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
		return datasetId;
	}
}

// Validate the options field of the query and return the dataset id
function validateOptions(query: any, datasetId: any, transformationsColumns: any): string | null {
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
			const expectedNumKeyParts = 2;
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
		validateNonLogicFilters(applyToken, rule[key][applyToken]);
		if (!validApplyTokens.includes(applyToken)) {
			throw new InsightError("Invalid APPLYTOKEN");
		}
		const dataKey = rule[key][applyToken];

		const dataKeyParts = dataKey.split("_");
		const expectedNumKeyParts = 2;
		if (dataKeyParts.length !== expectedNumKeyParts) {
			throw new InsightError("Invalid data reference");
		}
		if (datasetId === null) {
			datasetId = dataKeyParts[0];
		} else if (datasetId !== dataKeyParts[0]) {
			throw new InsightError("Query references multiple datasets");
		}
	}
	return datasetId;
}
