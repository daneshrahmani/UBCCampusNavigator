import {InsightError, InsightResult} from "../../controller/IInsightFacade";
import { parseMComparison, parseSComparison } from "./parsing";

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

export function selectColumns(section: any, columns: any): any {
	const result: InsightResult = {};
	for (const column of columns) {
		// Array destructuring from ChatGPT
		const [, field] = column.split("_");
		if (!(field in section)) {
			throw new InsightError("Field not in dataset")
		}
		result[column] = section[field];
	}
	return result;
}
