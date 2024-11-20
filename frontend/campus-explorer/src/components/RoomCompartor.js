export default function RoomComparator({ states }) {
    return (
        <div className="d-flex flex-row fixed-bottom justify-content-center">
            {states.selectedRooms.map(room => <RoomCard room={room}/>)}
        </div>
    )
}

function RoomCard({room}) {
    return (
        <div class="card m-2" style={{width: 18 + 'rem'}}>
            <div class="card-body">
                <a href={room.rooms_href} target="_blank">
                    <h5>{room.rooms_name.replace("_", " ")}</h5>
                </a>
                <p><b>Capacity:</b> {room.rooms_seats}</p>
                <p><b>Room Type:</b> {room.rooms_type}</p>
                <p><b>Furniture:</b> {room.rooms_furniture}</p>
            </div>
        </div>
    )
}