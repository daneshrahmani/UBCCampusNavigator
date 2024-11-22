export function useBuildingInfo(roomsByBuilding) {
	return roomsByBuilding.map(building => ({
		fullname: building[0].rooms_fullname,
		shortname: building[0].rooms_shortname,
		address: building[0].rooms_address,
		roomCount: building.length,
		lat: building[0].rooms_lat,
		lon: building[0].rooms_lon
	}));
}
