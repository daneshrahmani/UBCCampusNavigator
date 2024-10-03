import Section from "../utils/Section";
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

		// RegExp from ChatGPT
		const validIDRegExp = /^(?!.*_)(?=.*\S).+$/;

		if (!validIDRegExp.test(id)) {
			throw new InsightError("Invalid ID");
		}

		// To be removed in a later checkpoint
		if (kind != InsightDatasetKind.Sections) {
			throw new InsightError("Unsupported DatasetKind (for now");
		}

		let data: JSZip;

		const sections: Section[] = [];

		try {
			data = await JSZip.loadAsync(content, { base64: true });
			for (const file of Object.values(data.files)) {
				if (!file.dir) {
					const courseData = await file.async("text");
					for (const sectionData of JSON.parse(courseData).result) {
						const section = new Section(sectionData);
						sections.push(section);
					}
				}
			}
			//console.log(sections);
			if (sections.length === 0) {
				throw new InsightError("something");
			}
		} catch (err) {
			//console.log(err)
			throw new InsightError("Invalid base64 string");
		}

		//console.log(sections);

		// if (sections.length === 0) {
		// 	throw new InsightError("Dataset contains no valid sections");
		// }

		console.log(sections);

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
