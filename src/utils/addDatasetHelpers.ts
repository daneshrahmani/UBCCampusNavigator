import { InsightError, InsightDatasetKind } from "../controller/IInsightFacade";
import Dataset from "./Dataset";
import * as fs from 'fs-extra';
import * as path from 'path';

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

export async function addToDisk(dataDirectory: string, dataset: Dataset): Promise<void> {
	// TODO: Import fs library and implement adding to disk at PROJECT_DIR/data
	const datasetFilePath = path.join(dataDirectory, `${dataset.id}.json`)
	await fs.writeJson(datasetFilePath, {
		sections: dataset.sections,
	})
}
