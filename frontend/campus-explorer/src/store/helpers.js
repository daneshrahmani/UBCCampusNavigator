export const groupRoomsByBuilding = (roomData) => {
    const buildingRooms = []
    let prevBuilding = null;
    let buildingIdx = -1;
    for (let room of roomData) {
        if (room.rooms_shortname !== prevBuilding) {
            buildingRooms.push([]);
            buildingIdx += 1;
            prevBuilding = room.rooms_shortname
        }
        buildingRooms[buildingIdx].push(room)

    }
    return buildingRooms
}

export const getFilteredRooms = (roomData, filters) => {
    let filteredRooms = roomData;
    if (filters.roomType !== "Any") {
        filteredRooms = filteredRooms.filter(room => room.rooms_type === filters.roomType);
    }
    return filteredRooms;
}