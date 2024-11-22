import React from 'react';
import ClearSelectedRoomsButton from "../Buttons/ClearSelectedRoomsButton";
import DistanceTable from '../Tables/DistanceTable';
import FilteringTools from '../Filters/FilteringTools';

function RightPanel({ states }) {
	const { selectedRooms } = states;

	return (
		<div className="p-3 border-start h-100 d-flex flex-column">
			<div className="card mb-2">
				<h5>Room Analysis</h5>
				<div>
					<h6>Summary</h6>
					<p>Selected Rooms: {selectedRooms.length}</p>
				</div>
			</div>

			<div>
				<FilteringTools states={states} />
			</div>

			{
				selectedRooms.length >= 2 &&
				<div className="card mt-2">
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
