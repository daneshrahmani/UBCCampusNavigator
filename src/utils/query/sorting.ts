import {InsightError, InsightResult} from "../../controller/IInsightFacade";

export function sortedResults(results: InsightResult[], query: any): InsightResult[] {
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
