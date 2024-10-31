import Section, { parseSectionsData } from "../utils/Section";
import {
	addToDisk,
	getAddedDatasetIDs,
	sectionSatisfies,
	selectColumns,
	sortedResults,
	transformResults,
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
import Room, { parseRoomsData } from "../utils/Room";

export const DATA_DIR = path.join(__dirname, "..", "..", "data");

const maximumResultLength = 5000;

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
		await this.initialize();
		validateId(id);

		let data: JSZip;

		try {
			data = await JSZip.loadAsync(content, { base64: true });
		} catch (err) {
			throw new InsightError(`Invalid base64 string: ${err instanceof Error ? err.message : String(err)}`);
		}

		let entries: Section[] | Room[];

		if (kind === InsightDatasetKind.Sections) {
			entries = await parseSectionsData(data);
		} else if (kind === InsightDatasetKind.Rooms) {
			entries = await parseRoomsData(data);
		} else {
			throw new InsightError("Invalid InsightDatasetKind");
		}

		await addToDisk(id, entries, kind);
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
		const datasetId = validateQueryStructure(query);
		const queryObj = query as {
			WHERE: any;
			OPTIONS: { COLUMNS: string[]; ORDER?: string };
			TRANSFORMATIONS?: { GROUP: string[]; APPLY: any[] };
		};
		try {
			const content = await fs.readJSON(path.join(DATA_DIR, datasetId));
			const filteredEntries = content.data.filter((section: any) => sectionSatisfies(queryObj.WHERE, section));

			let results;

			if (queryObj.TRANSFORMATIONS) {
				results = transformResults(queryObj, filteredEntries);
			} else {
				const columns = queryObj.OPTIONS.COLUMNS;
				results = filteredEntries.map((section: any) => selectColumns(section, columns));
			}

			if (results.length > maximumResultLength) {
				throw new ResultTooLargeError("Query is returning more than 5000 items");
			}

			// Sort results if needed
			if (queryObj.OPTIONS.ORDER) {
				return sortedResults(results, queryObj);
			}

			return results;
		} catch (err) {
			if (err instanceof ResultTooLargeError) {
				throw err;
			}
			throw new InsightError(`Error: ${err}`);
		}
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		// TODO: Remove this once you implement the methods!
		await this.initialize();
		const datasetFiles = await fs.readdir(DATA_DIR);

		const datasetPromises = [];
		for (const fileName of datasetFiles) {
			datasetPromises.push(
				fs.readJSON(path.join(DATA_DIR, fileName)).then((content) => {
					const kind = content.kind === "sections" ? InsightDatasetKind.Sections : InsightDatasetKind.Rooms;
					return new Dataset(fileName, kind, content.data.length);
				})
			);
		}
		return Promise.all(datasetPromises);
	}
}
