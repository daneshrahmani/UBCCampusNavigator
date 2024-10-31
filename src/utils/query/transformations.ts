import Decimal from "decimal.js";

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

function applyAggregation(group: any[], fn: string, field: string, result: any, column: string): void {
	if (fn === "MIN") {
		let min = Infinity;
		for (const entry of group) {
			if (entry[field] < min) {
				min = entry[field];
			}
		}
		result[column] = min;
	} else if (fn === "MAX") {
		let max = -Infinity;
		for (const entry of group) {
			if (entry[field] > max) {
				max = entry[field];
			}
		}
		result[column] = max;
	} else if (fn === "SUM") {
		let sum = 0;
		for (const entry of group) {
			sum += entry[field];
		}
		result[column] = Number(sum.toFixed(ROUND_TO));
	} else if (fn === "AVG") {
		let total = new Decimal(0);
		for (const entry of group) {
			total = total.add(new Decimal(entry[field]));
		}
		const avg = total.toNumber() / group.length;
		result[column] = Number(avg.toFixed(ROUND_TO));
	} else if (fn === "COUNT") {
		result[column] = group.length;
	}
}
