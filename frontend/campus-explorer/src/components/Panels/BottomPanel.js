import React from 'react';
import SelectedRoom from '../Cards/SelectedRoom'

function BottomPanel({ states }) {
	const { selectedRooms } = states;

	return (
		<div className="position-absolute bottom-0 start-0 w-100 bg-white border-top p-3">
			<div className="container-fluid">
				<div className="d-flex gap-2 overflow-auto">
					{selectedRooms.map((room) => (
						<SelectedRoom
							key={room.rooms_name}
							room={room}
							style={{minWidth: '150px'}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default BottomPanel;
