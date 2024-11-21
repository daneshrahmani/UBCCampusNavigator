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
    filteredRooms = filteredRooms.filter(room => room.rooms_seats >= filters.capacityRange[0] && room.rooms_seats <= filters.capacityRange[1])
    return filteredRooms;
}

export const getMaxRoomCapacity = (roomData) => {
    let maxCapacity = 0;
    for (let room of roomData) {
        if (room.rooms_seats > maxCapacity) {
            maxCapacity = room.rooms_seats
        }
    }
    return maxCapacity
}