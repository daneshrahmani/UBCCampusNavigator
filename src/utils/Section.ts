import { InsightError } from "../controller/IInsightFacade";

interface SectionDataObject {
	id: number;
	Course: string;
	Title: string;
	Professor: string;
	Subject: string;
	Year: string;
	Avg: number;
	Pass: number;
	Fail: number;
	Audit: number;
	[key: string]: any;
}

export default class Section {
	public readonly uuid: string; // unique id of section
	public readonly id: string; // course id
	public readonly title: string; // name of course
	public readonly instructor: string; // prof
	public readonly dept: string; // dept
	public readonly year: number;
	public readonly avg: number;
	public readonly pass: number;
	public readonly fail: number;
	public readonly audit: number;

	constructor(data: SectionDataObject) {
		this.uuid = data.id.toString();
		this.id = data.Course;
		this.title = data.Title;
		this.instructor = data.Professor;
		this.dept = data.Subject;
		if (data["Section"] === "overall") {
			this.year = 1900;
		} else {
			this.year = Number(data.Year);
		}
		this.avg = data.Avg;
		this.pass = data.Pass;
		this.fail = data.Fail;
		this.audit = data.Audit;

		Object.values(this).forEach((val) => {
			if (val === undefined || Number.isNaN(val)) {
				throw new InsightError("Invalid Section");
			}
		});
	}
}
