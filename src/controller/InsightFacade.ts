import Section from "../utils/Section";
import {
	addDatasetParameterValidity,
	addToDisk,
	getAddedDatasetIDs,
	sectionSatisfies,
	validateId,
	validateQueryStructure,
} from "../utils/helpers";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import JSZip from "jszip";
import * as path from "path";
import * as fs from "fs-extra";
import { Dataset } from "../utils/Dataset";

export const DATA_DIR = path.join(__dirname, "..", "..", "data");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public async initialize(): Promise<void> {
		await fs.ensureDir(DATA_DIR);
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: Remove this once you implement the methods!
		await this.initialize();
		addDatasetParameterValidity(id, kind);

		let data: JSZip;

		try {
			data = await JSZip.loadAsync(content, { base64: true });
		} catch (err) {
			throw new InsightError(`Invalid base64 string: ${err instanceof Error ? err.message : String(err)}`);
		}

		const sections: Section[] = [];
		const sectionAdds: Promise<void>[] = [];

		data.forEach((relativePath, file) => {
			if (/courses\/.*/.test(relativePath)) {
				sectionAdds.push(
					file.async("text").then((value) => {
						try {
							for (const sectionData of JSON.parse(value).result) {
								sections.push(new Section(sectionData));
							}
						} catch {
							// if parsing file text as JSON or Section is invalid, continue
						}
					})
				);
			}
		});

		// Wait for all sections to be added to sections array
		await Promise.all(sectionAdds);

		// Throw error is dataset contains no valid sections
		if (sections.length === 0) {
			throw new InsightError("No valid sections");
		}

		await addToDisk(id, sections);
		return await getAddedDatasetIDs();
	}

	public async removeDataset(id: string): Promise<string> {
		// TODO: Remove this once you implement the methods!

		validateId(id);

		const addedIds = await getAddedDatasetIDs();
		if (!addedIds.includes(id)) {
			throw new NotFoundError(`Dataset ${id} not found`);
		}

		return fs.remove(path.join(DATA_DIR, id)).then(() => id);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// TODO: Remove this once you implement the methods!
		const datasetId = validateQueryStructure(query);
		const maximumResultLength = 5000;
		const queryObj = query as { WHERE: any; OPTIONS: { COLUMNS: string[]; ORDER?: string } };
		try {
			const content = await fs.readJSON(path.join(DATA_DIR, datasetId));
			const filteredSects = content.sections.filter((section: any) => sectionSatisfies(queryObj.WHERE, section));

			const columns = queryObj.OPTIONS.COLUMNS;
			const results = filteredSects.map((section: any) => {
				const result: InsightResult = {};
				for (const column of columns) {
					// Array destructuring from ChatGPT
					const [, field] = column.split("_");
					result[column] = section[field];
				}
				return result;
			});

			if (results.length > maximumResultLength) {
				throw new ResultTooLargeError("Query is returning more than 5000 items");
			}

			return results;
		} catch (err) {
			if (err instanceof ResultTooLargeError) {
				throw err;
			}
			throw new InsightError(`Error: ${err}`);
		}

		throw new Error(`InsightFacadeImpl::performQuery() is unimplemented! - query=${query};`);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		// TODO: Remove this once you implement the methods!
		await this.initialize();
		const datasetFiles = await fs.readdir(DATA_DIR);

		const datasetPromises = [];
		for (const fileName of datasetFiles) {
			datasetPromises.push(
				fs.readJSON(path.join(DATA_DIR, fileName)).then((content) => {
					return new Dataset(fileName, InsightDatasetKind.Sections, content.sections.length);
				})
			);
		}
		return Promise.all(datasetPromises);
	}
}
