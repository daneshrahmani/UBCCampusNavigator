import Button from 'react-bootstrap/Button';

export default function ClearFiltersButton({ states }) {
	const handleClearFilters = () => {
		states.setFilters({
			roomType: "Any",
			capacityRange: [0, states.maxRoomCapacity]
		});
	}

	return (
		<Button
			variant="outline-secondary"
			size="sm"
			onClick={handleClearFilters}
		>
			Clear Filters
		</Button>
	);
}
