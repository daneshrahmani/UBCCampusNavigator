import Accordion from 'react-bootstrap/Accordion';
import "../../styling/sidebar.css"
import ubcLogo from "../../Utils/ubc-logo.png"


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

    return (
		<div className="sidebar-container">
			<div className="sidebar-header d-flex justify-content-between align-items-center p-3">
				<div className="sidebar-logo-title">
					<img
						alt="UBC Logo"
						src={ubcLogo}
						width="42"
						height="55"
						className="d-inline-block align-top"
					/>
					<span className="sidebar-title ms-2">UBC Campus Explorer</span>
				</div>
			</div>
			<Accordion>
				{states.roomsByBuilding.map((building, idx) =>
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

function SidebarBuilding({name, idx, rooms, states}) {
	return (
		<Accordion.Item eventKey={idx.toString()}>
			<Accordion.Header>{`${name} (${rooms.length})`}</Accordion.Header>
			<Accordion.Body>
				{rooms.map(room => <SidebarRoom room={room} states={states}/>)}
			</Accordion.Body>
		</Accordion.Item>
	)
}

function SidebarRoom({room, states}) {
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
