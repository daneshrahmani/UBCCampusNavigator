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