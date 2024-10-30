import { InsightError } from "../controller/IInsightFacade";
import JSZip from "jszip";
import { parse } from "parse5";
// import { ChildNode } from "parse5/dist/tree-adapters/default";
// import { relative } from "path";

interface RoomDataObject {
	fullname: string;
	shortname: string;
	number: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	seats: number;
	type: string;
	furniture: string;
	href: string;
}

interface Building {
	fullname: string | undefined;
	shortname: string | undefined;
	address: string | undefined;
	link: string | undefined;
}

interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

export default class Room {
	public readonly fullname: string;
	public readonly shortname: string;
	public readonly number: string | undefined;
	public readonly name: string | undefined;
	public readonly address: string;
	public readonly lat: number;
	public readonly lon: number;
	public readonly seats: number | undefined;
	public readonly type: string | undefined;
	public readonly furniture: string | undefined;
	public readonly href: string | undefined;

	constructor(data: RoomDataObject) {
		this.fullname = data.fullname;
		this.shortname = data.shortname;
		this.number = data.number;
		this.name = data.name;
		this.address = data.address;
		this.lat = data.lat;
		this.lon = data.lon;
		this.seats = data.seats;
		this.type = data.type;
		this.furniture = data.furniture;
		this.href = data.href;
	}
}

function getBuildingsFromIndex(index: string) {
	const buildings = [];
	const nodeQueue = parse(index).childNodes;
	let node = nodeQueue.shift();

	while (node !== undefined) {
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

async function getRoomsFromBuilding(building: string): Promise<RoomDataObject[]> {
	const rooms: RoomDataObject[] = [];
	const nodeQueue = parse(building).childNodes;
	let node = nodeQueue.shift();

	while (node !== undefined) {
		if (node.nodeName === "tbody") {
			for (const tbodyChild of node.childNodes) {
				if (tbodyChild.nodeName === "tr") {
					const room = createEmptyRoom();

					for (const trChild of tbodyChild.childNodes) {
						processRoomCell(trChild, room);
					}

					// Check if we have valid room data
					if (isValidRoom(room)) {
						rooms.push(room as RoomDataObject);
					}
				}
			}
		} else if ("childNodes" in node) {
			nodeQueue.push(...node.childNodes);
		}
		node = nodeQueue.shift();
	}
	return rooms;
}

export async function parseRoomsData(data: JSZip): Promise<Room[]> {
	const rooms: Room[] = [];

	const index = await data.file("campus/index.htm")?.async("text");

	if (!index) {
		throw new InsightError("Invalid rooms dataset");
	}

	const buildings = getBuildingsFromIndex(index);

	const buildingPromises = buildings.map(async (building) => processBuilding(building, data, rooms));

	await Promise.all(buildingPromises);

	if (rooms.length === 0) {
		throw new InsightError("No valid rooms");
	}

	return rooms;
}

function processRoomCell(trChild: any, room: Partial<RoomDataObject>): void {
	if (trChild.nodeName === "td") {
		for (const attrs of trChild.attrs) {
			if (attrs.name === "class") {
				const tdClasses = attrs.value.split(" ");
				if (tdClasses.includes("views-field")) {
					if (tdClasses.includes("views-field-field-room-number")) {
						for (const tdChild of trChild.childNodes) {
							processRoomNumberCell(tdChild, room);
						}
					} else if (tdClasses.includes("views-field-field-room-capacity")) {
						room.seats = parseInt(getTextContent(trChild).trim(), 10);
					} else if (tdClasses.includes("views-field-field-room-type")) {
						room.type = getTextContent(trChild).trim();
					} else if (tdClasses.includes("views-field-field-room-furniture")) {
						room.furniture = getTextContent(trChild).trim();
					}
				}
			}
		}
	}
}

function processRoomNumberCell(tdChild: any, room: Partial<RoomDataObject>): void {
	if (tdChild.nodeName === "a") {
		for (const aAttrs of tdChild.attrs) {
			if (aAttrs.name === "href") {
				room.href = aAttrs.value;
			}
		}
		room.number = getTextContent(tdChild).trim();
	}
}

function createEmptyRoom(): Partial<RoomDataObject> {
	return {
		fullname: "",
		shortname: "",
		number: "",
		name: "",
		address: "",
		lat: 0,
		lon: 0,
		seats: 0,
		type: "",
		furniture: "",
		href: "",
	};
}

function isValidRoom(room: Partial<RoomDataObject>): boolean {
	return !!(room.number && room.seats && !isNaN(room.seats) && room.type && room.furniture);
}

function getTextContent(node: any): string {
	if (node.nodeName === "#text") {
		return node.value || "";
	}
	let text = "";
	if (node.childNodes) {
		for (const child of node.childNodes) {
			text += getTextContent(child);
		}
	}
	return text;
}

async function processBuilding(building: Building, data: JSZip, rooms: Room[]): Promise<void> {
	if (!building.link || !building.address) {
		return;
	}

	const { link, address } = building;

	try {
		const buildingFile = await data.file(link.replace(".", "campus"))?.async("text");
		if (!buildingFile) {
			return;
		}

		const geoLocation = await getGeolocation(address);
		if (!geoLocation.lat || !geoLocation.lon) {
			return;
		}

		const buildingRooms = await getRoomsFromBuilding(buildingFile);
		addRoomsToList(buildingRooms, building, geoLocation, rooms);
	} catch {
		return;
	}
}

function addRoomsToList(
	buildingRooms: RoomDataObject[],
	building: Building,
	geoLocation: GeoResponse,
	rooms: Room[]
): void {
	for (const roomData of buildingRooms) {
		try {
			const fullRoomData: RoomDataObject = {
				...roomData,
				fullname: building.fullname || "",
				shortname: building.shortname || "",
				address: building.address || "",
				name: `${building.shortname}_${roomData.number}`,
				lat: geoLocation.lat!,
				lon: geoLocation.lon!,
			};
			rooms.push(new Room(fullRoomData));
		} catch {
			// do nothing
		}
	}
}

async function getGeolocation(address: string): Promise<GeoResponse> {
	try {
		const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team040/${encodeURIComponent(address)}`;
		const res = await fetch(url);
		if (!res.ok) {
			new Error(`HTTP error! status: ${res.status}`);
		}
		return await res.json();
	} catch (err) {
		return { error: String(err) };
	}
}
