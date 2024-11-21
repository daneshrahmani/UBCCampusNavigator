import React from 'react';
import ClearSelectedRoomsButton from "../Buttons/ClearSelectedRoomsButton";
import DistanceTable from '../DistanceTable';

function RightPanel({ states }) {
	const { selectedRooms } = states;

	return (
		<div className="p-3 border-start h-100 d-flex flex-column">
			<h5>Room Analysis</h5>

			<div className="mb-4">
				<h6>Summary</h6>
				<p>Selected Rooms: {selectedRooms.length}</p>
			</div>

			{
				selectedRooms.length >= 2 &&
				<div className="my-auto">
					<DistanceTable states={states} />
				</div>
			}

			<div className="mt-auto">
				<ClearSelectedRoomsButton states={states}/>
			</div>
		</div>
	);
}

export default RightPanel;
