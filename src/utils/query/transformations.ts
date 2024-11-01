import Decimal from "decimal.js";
import { InsightError } from "../../controller/IInsightFacade";

const ROUND_TO = 2;

export function transformResults(queryObj: any, filteredSects: any): any {
	const groupingFields = getGroupingFields(queryObj.TRANSFORMATIONS);
	const groups = groupData(filteredSects, groupingFields);

	const results = [];
	for (const group of groups.values()) {
		const result: any = {};
		for (const column of queryObj.OPTIONS.COLUMNS) {
			if (queryObj.TRANSFORMATIONS.GROUP.includes(column)) {
				const attribute = column.split("_")[1];
				result[column] = group[0][attribute];
			} else {
				for (const applyRule of queryObj.TRANSFORMATIONS.APPLY) {
					const ruleName = Object.keys(applyRule)[0];
					if (ruleName === column) {
						const fn = Object.keys(applyRule[ruleName])[0];
						const datasetField: any = Object.values(applyRule[ruleName])[0];
						const field = datasetField.split("_")[1];
						applyAggregation(group, fn, field, result, column);
					}
				}
			}
		}
		results.push(result);
	}
	return results;
}

function getGroupingFields(transformations: any): string[] {
	return transformations.GROUP.map((datasetAttribute: string) =>
		datasetAttribute.split("_")[1]
	);
}

function groupData(filteredSects: any[], groupingFields: string[]): Map<string, any[]> {
	const groups = new Map();
	for (const entry of filteredSects) {
		const hashedEntry = hashEntry(entry, groupingFields);
		if (groups.has(hashedEntry)) {
			const groupEntries = groups.get(hashedEntry);
			groupEntries.push(entry);
			groups.set(hashedEntry, groupEntries);
		} else {
			groups.set(hashedEntry, [entry]);
		}
	}
	return groups;
}

function hashEntry(entry: any, groupingFields: string[]): string {
	let entryHash = "";
	for (const field of groupingFields) {
		entryHash += `~${entry[field]}`;
	}
	return entryHash;
}

function getMin(group: any, field: any): number {
	let min = Infinity;
	for (const entry of group) {
		if (entry[field] < min) {
			min = entry[field];
		}
	}
	return min
}

function getMax(group: any, field: any): number {
	let max = -Infinity;
		for (const entry of group) {
			if (entry[field] > max) {
				max = entry[field];
			}
		}
	return max
}

function getSum(group: any, field: any): number {
	let sum = 0;
		for (const entry of group) {
			sum += entry[field];
		}
	return Number(sum.toFixed(ROUND_TO))
}

function getAvg(group: any, field: any): number {
	let total = new Decimal(0);
		for (const entry of group) {
			total = total.add(new Decimal(entry[field]));
		}
		const avg = total.toNumber() / group.length;
	return Number(avg.toFixed(ROUND_TO));
}

function getCount(group: any, field: any):number {
	const uniqueItems = new Set()
		for (const entry of group) {
			uniqueItems.add(entry[field])
		}
	return uniqueItems.size
}

function applyAggregation(group: any[], fn: string, field: string, result: any, column: string): void {
	if (!(field in group[0])) {
		throw new InsightError("Field does not exist in dataset")
	}
	if (fn === "MIN") {
		result[column] = getMin(group, field);
	} else if (fn === "MAX") {
		result[column] = getMax(group, field);
	} else if (fn === "SUM") {
		result[column] = getSum(group, field);
	} else if (fn === "AVG") {
		result[column] = getAvg(group, field);
	} else if (fn === "COUNT") {
		result[column] = getCount(group, field);
	}
}
