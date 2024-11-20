import React from "react";

function SelectedRoom({room, style}) {
	return (
		<div className="card mb-2" style={style}>
			<div className="card-body p-1">
				<h6 className="card-title small mb-1">
					<a
						href={`https://learningspaces.ubc.ca/classrooms/${room.rooms_shortname}-${room.rooms_number}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{room.rooms_name.replace("_", " ")}
					</a>
				</h6>
				<p className="card-text small mb-0">
					Full Name: {room.rooms_fullname}
				</p>
				<p className="card-text small mb-0">
					Short Name: {room.rooms_shortname}
				</p>
				<p className="card-text small mb-0">
					Number: {room.rooms_number}
				</p>
				<p className="card-text small mb-0">
					Address: {room.rooms_address}
				</p>
				<p className="card-text small mb-0">
					Capacity: {room.rooms_seats}
				</p>
			</div>
		</div>
	)
}

export default SelectedRoom;
