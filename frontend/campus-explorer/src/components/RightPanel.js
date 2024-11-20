import React from 'react';
import ClearSelectedRoomsButton from "./Buttons/ClearSelectedRoomsButton";
import SelectedRoom from "./Cards/SelectedRoom";

function RightPanel({ states }) {
	const { selectedRooms } = states;

	return (
		<div className="p-3 border-start h-100 d-flex flex-column">
			<h5>Room Analysis</h5>

			<div className="mb-4">
				<h6>Summary</h6>
				<p>Selected Rooms: {selectedRooms.length}</p>
			</div>

			<div>
				{selectedRooms.length > 0 ? (
					<div className="room-details">
						{selectedRooms.map((room) => (
							<SelectedRoom
								key={room.rooms_name}
								room={room}
							/>
						))}
					</div>
				) : (
					<p className="text-muted">Select rooms to see analysis</p>
				)}
			</div>

			<div className="mt-auto">
				<ClearSelectedRoomsButton states={states}/>
			</div>
		</div>
	);
}

export default RightPanel;
