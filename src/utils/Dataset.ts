import { InsightDataset, InsightDatasetKind } from "../controller/IInsightFacade";

export class Dataset implements InsightDataset {
	public readonly id: string;
	// public readonly sections: Section[];
	public readonly kind: InsightDatasetKind;
	public readonly numRows: number;

	constructor(id: string, kind: InsightDatasetKind, numRows: number) {
		this.id = id;
		this.kind = kind;
		this.numRows = numRows;
	}
}
