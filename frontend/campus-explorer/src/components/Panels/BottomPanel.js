import React from 'react';
import SelectedRoom from '../Cards/SelectedRoom';

function BottomPanel({ states }) {
	const { selectedRooms, setSelectedRooms } = states;

	const handleRemoveRoom = (roomToRemove) => {
		setSelectedRooms(selectedRooms.filter(room => room.rooms_name !== roomToRemove.rooms_name));
	};

	return (
		<div className="position-absolute bottom-0 start-0 w-100 bg-white border-top p-2" style={{ minHeight: '21%' }}>
			<div className="container-fluid">
				<div className="d-flex gap-2 justify-content-center">
					{selectedRooms.length === 0 ? (
						<div className="d-flex align-items-center">
							<span>Selected rooms will appear here...</span>
						</div>
					) : (
						selectedRooms.map((room) => (
							<SelectedRoom
								key={room.rooms_name}
								room={room}
								style={{
									width: '19.5%',
								}}
								onRemove={handleRemoveRoom}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default BottomPanel;
