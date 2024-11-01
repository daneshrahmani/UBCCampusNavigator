import { InsightError } from "../../controller/IInsightFacade"

// For validating that AND, OR & NOT are not empty
export function validateLogicFilters(logicFilter: any): void {
	if (Array.isArray(logicFilter) && logicFilter.length > 0) {
		return;
	} else if (Object.keys(logicFilter).length > 0) {
		return;
	}
	throw new InsightError("AND/OR/NOT cannot be empty");
}

// For validating Comparators
export function validateNonLogicFilters(key: any, val: any): void {
	switch (key) {
		case "NOT": {
			validateLogicFilters(val);
			break;
		}
		case "EQ":
		case "GT":
		case "LT": {
			const [[objectKey], [objectValue]] = [Object.keys(val), Object.values(val)];
			validateNumericComparators(objectKey, objectValue);
			break;
			}
		case "MAX":
		case "MIN":
		case "AVG":
		case "SUM": {
			validateApplyTokens(key, val);
			break;
		}
		case "IS": {
			const stringValue = Object.values(val)[0];
			// Check that IS value is a string type
			if (typeof stringValue !== "string") {
				throw new InsightError("Invalid Value type for IS. Value type must be a string");
			}

			// Check that if wildcards are used, they are not embedded
			if (stringValue.includes("*")) {
				if ((!stringValue.startsWith("*") && !stringValue.endsWith("*")) || stringValue === "***") {
					throw new InsightError("Invalid use of Wildcard. Wildcard cannot be embedded in a word.");
				}
			}

			break;
		}
	}
}

// Validating Keys and Values for EQ, GT, LT
function validateNumericComparators(objectKey: any, objectValue: any): void {
	const stringFieldsSections = [
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
		"type",
		"furniture",
		"href",
	];
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
	const validTokenValues = ["lat", "lon", "seats", "year", "avg", "pass", "fail", "audit"];

	if (!objectKey) {
		throw new InsightError("Missing key for MAX, MIN, AVG, or SUM.");
	}

	// Checking that MAX, MIN, SUM, AVG value column is a numeric type
	if (!validTokenValues.includes(objectValue.split("_")[1])) {
		throw new InsightError("Invalid Value type for MAX, MIN, AVG, or SUM. Value type must be numeric column");
	}
}
