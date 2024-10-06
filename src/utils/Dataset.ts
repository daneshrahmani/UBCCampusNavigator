import Section from "./Section";

export default class Dataset {
	private readonly id: string;
	private readonly sections: Section[];

	constructor(id: string, sections: Section[]) {
		this.id = id;
		this.sections = sections;
	}

	public getNumRows(): number {
		return this.sections.length;
	}
}
