import { InsightError } from "../controller/IInsightFacade";
import JSZip from "jszip";
import { parse } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { relative } from "path";

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

interface Building {
	fullname: string | undefined;
	shortname: string | undefined;
	address: string | undefined;
	link: string | undefined;
}

export default class Room {
	public readonly fullname: string;
	public readonly shortname: string;
	public readonly number: string;
	public readonly name: string;
	public readonly address: string;
	public readonly lat: number;
	public readonly lon: number;
	public readonly seats: number;
	public readonly type: string;
	public readonly furniture: string;
	public readonly href: string;

	constructor(data: SectionDataObject) {
		this.fullname = "";
		this.shortname = "";
		this.number = "";
		this.name = "";
		this.address = "";
		this.lat = 0;
		this.lon = 0;
		this.seats = 0;
		this.type = "";
		this.furniture = "";
		this.href = "";
	}
}

function getBuildingsFromIndex(index: string) {
	const buildings = [];
	const nodeQueue = parse(index).childNodes;
	let node = nodeQueue.shift();

	while (node != undefined) {
		if (node.nodeName === "tbody") {
			for (const tbodyChild of node.childNodes) {
				if (tbodyChild.nodeName === "tr") {
					const building: Building = { fullname: undefined, shortname: undefined, address: undefined, link: undefined };
					for (const trChild of tbodyChild.childNodes) {
						if (trChild.nodeName === "td") {
							for (const attrs of trChild.attrs) {
								if (attrs.name === "class") {
									const tdClasses = attrs.value.split(" ");
									if (tdClasses.includes("views-field") && tdClasses.includes("views-field-field-building-address")) {
										for (const tdChild of trChild.childNodes) {
											if (tdChild.nodeName === "#text" && "value" in tdChild) {
												building.address = tdChild.value.trim();
											}
										}
									} else if (
										tdClasses.includes("views-field") &&
										tdClasses.includes("views-field-field-building-code")
									) {
										if ("value" in trChild.childNodes[0]) {
											building.shortname = trChild.childNodes[0].value.trim();
										}
									} else if (tdClasses.includes("views-field") && tdClasses.includes("views-field-title")) {
										for (const tdChild of trChild.childNodes) {
											if (tdChild.nodeName === "a") {
												for (const attrs of tdChild.attrs) {
													if (attrs.name === "href") {
														building.link = attrs.value;
													}
												}
												if ("value" in tdChild.childNodes[0]) {
													building.fullname = tdChild.childNodes[0].value;
												}
											}
										}
									}
								}
							}
						}
					}
					if (building.address && building.fullname && building.shortname && building.link) {
						buildings.push(building);
					}
				}
			}
		} else if ("childNodes" in node) {
			nodeQueue.push(...node.childNodes);
		}
		node = nodeQueue.shift();
	}
	return buildings;
}

export async function parseRoomsData(data: JSZip) {
	const rooms: Room[] = [];
	const roomAdds: (Promise<string> | undefined)[] = [];

	const index = await data.file("campus/index.htm")?.async("text");

	if (index === null || index === undefined) {
		throw new InsightError("Invalid rooms datastet");
	}

	const buildings: Building[] = getBuildingsFromIndex(index);

	for (const building of buildings) {
		// TODO make GET request with building.address to get lat and lon
		if (building.link) {
			roomAdds.push(
				data
					.file(building.link.replace(".", "campus"))
					?.async("text")
					.then((html) => {
						const buildingInfo = parse(html);
						// TODO find and parse the room table to create rooms
						return "nice";
					})
			);
		}
	}

	// Wait for all sections to be added to sections array
	await Promise.all(roomAdds);

	// Throw error is dataset contains no valid sections
	if (rooms.length === 0) {
		throw new InsightError("No valid rooms");
	}
	return rooms;
}
