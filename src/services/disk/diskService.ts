import Section from "../../models/Section";
import Room from "../../models/Room";
import {InsightDatasetKind, InsightError} from "../../controller/IInsightFacade";
import {DATA_DIR} from "../../controller/InsightFacade";
import * as fs from "fs-extra";
import * as path from "path";

export async function addToDisk(id: string, data: Section[] | Room[], kind: InsightDatasetKind): Promise<void> {
	const datasetFilePath = path.join(DATA_DIR, id);
	if (await fs.pathExists(datasetFilePath)) {
		throw new InsightError(`Dataset ${id} already exists in disk memory`);
	}

	await fs.writeJson(datasetFilePath, {
		data: data,
		kind: kind,
	});
}

export async function getAddedDatasetIDs(): Promise<string[]> {
	return fs.readdir(DATA_DIR);
}
