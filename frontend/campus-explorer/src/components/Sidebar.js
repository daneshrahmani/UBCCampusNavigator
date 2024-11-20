import Accordion from 'react-bootstrap/Accordion';
import "../styling/sidebar.css"

const toggleRoomSelection = (room, selectedRooms, setSelectedRooms) => {
    if (selectedRooms.map(room => room.rooms_name).includes(room.rooms_name)) {
        setSelectedRooms(prevRooms => prevRooms.filter(prevRoom => prevRoom.rooms_name !== room.rooms_name))
    }
    else {
        if (selectedRooms.length < 5) {
            setSelectedRooms(prevRooms => [...prevRooms, room]);
        }
    }
}

function Sidebar({ states }) {

    const buildingRooms = []
    let prevBuilding = null;
    let buildingIdx = -1;
    for (let room of states.roomData) {
        if (room.rooms_shortname !== prevBuilding) {
            buildingRooms.push([]);
            buildingIdx += 1;
            prevBuilding = room.rooms_shortname
        }
        buildingRooms[buildingIdx].push(room)

    }

	return (
		<div className="sidebar-container">
			<Accordion defaultActiveKey="0">
				{buildingRooms.map((building, idx) =>
					SidebarBuilding({
						name: building[0].rooms_shortname,
						idx: idx.toString(),
						rooms: building,
						states: states
					})
				)}
			</Accordion>
		</div>
	);
}

function SidebarBuilding({ name, idx, rooms, states }) {
    return (
        <Accordion.Item eventKey={idx.toString()}>
            <Accordion.Header>{`${name} (${rooms.length})`}</Accordion.Header>
            <Accordion.Body>
                {rooms.map(room => <SidebarRoom room={room} states={states} />)}
            </Accordion.Body>
        </Accordion.Item>
    )
}

function SidebarRoom({ room, states }) {
    return (
        <div className="text-start">
            <label>
                <input
                    type="checkbox"
                    checked={states.selectedRooms.map(room => room.rooms_name).includes(room.rooms_name)}
                    onChange={() => toggleRoomSelection(room, states.selectedRooms, states.setSelectedRooms)}
                />
                {` ${room.rooms_number}`}
            </label>
        </div>
    )
}

export default Sidebar;
