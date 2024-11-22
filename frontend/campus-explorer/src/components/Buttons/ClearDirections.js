import Button from 'react-bootstrap/Button';
import React from "react";

export default function ClearDirections({ states }) {
	const clearDirections = () => {
		states.setDirectionsResponses([]);
		states.setDirectionsPair(null);
	};

	return (
		<Button
			className="mb-1"
			variant="outline-secondary"
			size="sm"
			onClick={clearDirections}
		>
			Clear Directions
		</Button>
	);
}
