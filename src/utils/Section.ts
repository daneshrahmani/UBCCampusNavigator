import { InsightError } from "../controller/IInsightFacade";

type SectionDataObject = {
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
};

export default class Section {
	private readonly uuid: string; // unique id of section
	private readonly id: string; // course id
	private readonly title: string; // name of course
	private readonly instructor: string; // prof
	private readonly dept: string; // dept
	private readonly year: number;
	private readonly average: number;
	private readonly pass: number;
	private readonly fail: number;
	private readonly audit: number;

	constructor(data: SectionDataObject) {
		this.uuid = data.id.toString();
		this.id = data.Course;
		this.title = data.Title;
		this.instructor = data.Professor;
		this.dept = data.Subject;
		this.year = Number(data.Year);
		this.average = data.Avg;
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
