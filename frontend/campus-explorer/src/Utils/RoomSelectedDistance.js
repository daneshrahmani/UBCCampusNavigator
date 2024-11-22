const degToRad = (deg) => deg * (Math.PI / 180);

export const getDistance = (room1, room2) => {
	const lat1 = degToRad(room1.rooms_lat);
	const lat2 = degToRad(room2.rooms_lat);
	const lon1 = degToRad(room1.rooms_lon);
	const lon2 = degToRad(room2.rooms_lon);

	const dlat = lat2 - lat1;
	const dlon = lon2 - lon1;

	const a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const earthRadius = 6371000; // meters

	const distance = Math.round(earthRadius * c);

	return distance.toString();
}
