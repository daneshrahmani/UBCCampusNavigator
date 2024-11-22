import Button from 'react-bootstrap/Button';

function ClearSelectedRoomsButton({ states }) {
	const handleClear = () => {
		states.setSelectedRooms([])
	}

	return (
		<Button
			variant="outline-danger"
			onClick={handleClear}
		>
			Clear Selected Rooms
		</Button>
	)
}

export default ClearSelectedRoomsButton;
