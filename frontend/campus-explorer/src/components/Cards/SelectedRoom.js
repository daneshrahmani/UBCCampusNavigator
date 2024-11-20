import React from "react";

function SelectedRoom({room}) {
	return (
		<div className="card mb-2">
			<div className="card-body p-2">
				<h6 className="card-title">
					<a
						href={`https://learningspaces.ubc.ca/classrooms/${room.rooms_shortname}-${room.rooms_number}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{room.rooms_name.replace("_", " ")}
					</a>
				</h6>
				<p className="card-text mb-1">
					Capacity: {room.rooms_seats}
				</p>
				<p className="card-text mb-1">
					Type: {room.rooms_type}
				</p>
			</div>
		</div>
	)
}

export default SelectedRoom;
