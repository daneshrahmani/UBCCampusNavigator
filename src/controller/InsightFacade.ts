import Section from "../utils/Section";
import { addDatasetParameterValidity } from "../utils/addDatasetHelpers";
import { IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult } from "./IInsightFacade";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: Remove this once you implement the methods!
		addDatasetParameterValidity(id, kind);

		let data: JSZip;

		try {
			data = await JSZip.loadAsync(content, { base64: true });
		} catch (err) {
			throw new InsightError("Invalid base64 string");
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
						} catch (e) {
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

		return new Promise((resolve, reject) => {
			resolve(["nice"]);
		});
	}

	public async removeDataset(id: string): Promise<string> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::removeDataset() is unimplemented! - id=${id};`);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::performQuery() is unimplemented! - query=${query};`);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::listDatasets is unimplemented!`);
	}
}
