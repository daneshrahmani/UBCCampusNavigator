import { InsightError } from "../controller/IInsightFacade";
import JSZip from "jszip";
import { parse } from "parse5";
import * as http from "http";

interface RoomDataObject {
	fullname: string;
	shortname: string;
	number: string | undefined;
	name: string | undefined;
	address: string;
	lat: number | undefined;
	lon: number | undefined;
	seats: number | undefined;
	type: string | undefined;
	furniture: string | undefined;
	href: string | undefined;
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
	public readonly lat: number | undefined;
	public readonly lon: number | undefined;
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

//////////////////////////////////////////////////////////////////////////////////
// PROCESSING FOR BUILDINGS
//////////////////////////////////////////////////////////////////////////////////

// From an index.html Building table, processes the table rows and returns an array of
// Valid Buildings
function getBuildingsFromIndex(index: string): Building[] {
	const buildings: Building[] = [];
	const nodeQueue = parse(index).childNodes;
	let node = nodeQueue.shift();

	while (node !== undefined) {
		if (node.nodeName === "tbody") {
			for (const tbodyChild of node.childNodes) {
				if (tbodyChild.nodeName === "tr") {
					const building = createEmptyBuilding();

					for (const trChild of tbodyChild.childNodes) {
						processBuildingRow(trChild, building);
					}

					if (isValidBuilding(building)) {
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

// Processes a row (IE. a Building) from the index.html Building table
function processBuildingRow(trChild: any, building: Building): void {
	if (trChild.nodeName === "td") {
		for (const attrs of trChild.attrs) {
			if (attrs.name === "class") {
				const tdClasses = attrs.value.split(" ");
				if (tdClasses.includes("views-field")) {
					if (tdClasses.includes("views-field-field-building-address")) {
						for (const tdChild of trChild.childNodes) {
							if (tdChild.nodeName === "#text" && "value" in tdChild) {
								building.address = tdChild.value.trim();
							}
						}
					} else if (tdClasses.includes("views-field-field-building-code")) {
						if ("value" in trChild.childNodes[0]) {
							building.shortname = trChild.childNodes[0].value.trim();
						}
					} else if (tdClasses.includes("views-field-title")) {
						processBuildingTitle(trChild, building);
					}
				}
			}
		}
	}
}

// Processes the Title Column of a Building, to retrieve Building fullname and hyperlink
function processBuildingTitle(trChild: any, building: Building): void {
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

// Creates an empty Building Object
function createEmptyBuilding(): Building {
	return {
		fullname: undefined,
		shortname: undefined,
		address: undefined,
		link: undefined,
	};
}

// Checks that all required Building Fields exist
function isValidBuilding(building: Building): boolean {
	return !!(building.address && building.fullname && building.shortname && building.link);
}

//////////////////////////////////////////////////////////////////////////////////
// PROCESSING FOR ROOMS
//////////////////////////////////////////////////////////////////////////////////

// Extracts rooms data from a Building's html room table
// Returns an array of Room Objects
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

// Extracts Building array from the index html file Building table
// Then for each Building, extracts Room data from each Building's Room table
export async function parseRoomsData(data: JSZip): Promise<Room[]> {
	const rooms: Room[] = [];

	const index = await data.file("index.htm")?.async("text");

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

// Processes a row from a Building's Rooms table
// Each row corresponds to a given Room
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

// Processes the Number column of a given Room row, to extract Room number and the Room hyperlink
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

// Creates an empty Room object
function createEmptyRoom(): Partial<RoomDataObject> {
	return {
		fullname: "",
		shortname: "",
		number: undefined,
		name: undefined,
		address: "",
		lat: 0,
		lon: 0,
		seats: undefined,
		type: undefined,
		furniture: undefined,
		href: undefined,
	};
}

// Checks that a Room has all required attributes
function isValidRoom(room: Partial<RoomDataObject>): boolean {
	return !!(room.number && room.seats && room.type && room.furniture);
}

// Returns a given nodes column data as text
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
		const buildingFile = await data.file(link.substring(2))?.async("text");
		if (!buildingFile) {
			return;
		}

		const geoLocation = await getGeolocation(address);
		if (!geoLocation.lat || !geoLocation.lon) {
			return;
		}

		const buildingRooms = await getRoomsFromBuilding(buildingFile);
		if (buildingRooms.length === 0) {
			return;
		}
		addRoomsToList(buildingRooms, building, geoLocation, rooms);
	} catch {
		return;
	}
}

// Creates an array of Room Objets for a given Building
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
				lat: geoLocation.lat || undefined,
				lon: geoLocation.lon || undefined,
			};
			rooms.push(new Room(fullRoomData));
		} catch {
			// do nothing
		}
	}
}

// Makes an API GET Request to retrieve a given Building's geolocation data
// This data will be applied to each resultant Room object from the given building
async function getGeolocation(address: string): Promise<GeoResponse> {
	return new Promise((resolve) => {
		const EXPECTED_RESPONSE_CODE = 200;
		const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team040/${encodeURIComponent(address)}`;

		http
			.get(url, (res) => {
				let data = "";

				if (res.statusCode !== EXPECTED_RESPONSE_CODE) {
					resolve({ error: `HTTP error, status: ${res.statusCode}` });
					return;
				}

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					try {
						const geolocationData = JSON.parse(data) as GeoResponse;
						resolve(geolocationData);
					} catch (err) {
						resolve({ error: String(err) });
					}
				});
			})
			.on("error", (err) => {
				resolve({ error: String(err) });
			});
	});
}
