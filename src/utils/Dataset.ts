import Section from "./Section";

export default class Dataset {
	public readonly id: string;
	public readonly sections: Section[];

	constructor(id: string, sections: Section[]) {
		this.id = id;
		this.sections = sections;
	}

	public getNumRows(): number {
		return this.sections.length;
	}
}
