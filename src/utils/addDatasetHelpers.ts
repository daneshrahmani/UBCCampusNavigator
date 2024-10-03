import { InsightError, InsightDatasetKind } from "../controller/IInsightFacade";

export function addDatasetParameterValidity(id: string, kind: InsightDatasetKind): void {
	// RegExp from ChatGPT
	const validIDRegExp = /^(?!.*_)(?=.*\S).+$/;

	if (!validIDRegExp.test(id)) {
		throw new InsightError("Invalid ID");
	}

	// To be removed in a later checkpoint
	if (kind !== InsightDatasetKind.Sections) {
		throw new InsightError("Unsupported DatasetKind (for now");
	}
}
