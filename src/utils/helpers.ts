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

export function validateQueryStructure(query: unknown): void {
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
	}
}
