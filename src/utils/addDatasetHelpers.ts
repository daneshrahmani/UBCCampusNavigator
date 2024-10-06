import { InsightError, InsightDatasetKind } from "../controller/IInsightFacade";
import Dataset from "./Dataset";

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

export async function addToDisk(id: string, dataset: Dataset): Promise<void> {
	// TODO: Import fs library and implement adding to disk at PROJECT_DIR/data
	return;
}
