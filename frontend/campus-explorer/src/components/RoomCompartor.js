export default function RoomComparator({ states }) {
	return (
		<div className="position-absolute bottom-0 w-100 pb-4">
			<div className="d-flex flex-row flex-wrap gap-3 justify-content-start px-4">
				{states.selectedRooms.map((room, index) => (
					<RoomCard key={index} room={room} />
				))}
			</div>
		</div>
	)
}

function RoomCard({ room }) {
	return (
		<div className="card" style={{ width: '16rem' }}>
			<div className="card-body">
				<a href={room.rooms_href} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
					<h5 className="card-title">{room.rooms_name.replace("_", " ")}</h5>
				</a>
				<p className="card-text mb-1"><b>Capacity:</b> {room.rooms_seats}</p>
				<p className="card-text mb-1"><b>Room Type:</b> {room.rooms_type}</p>
				<p className="card-text mb-1"><b>Furniture:</b> {room.rooms_furniture}</p>
			</div>
		</div>
	)
}
