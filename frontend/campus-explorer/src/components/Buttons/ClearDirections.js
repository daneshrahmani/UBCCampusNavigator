import Button from 'react-bootstrap/Button';
import React from "react";

export default function ClearDirections({ states }) {

	return (
		<Button
			className="mb-1"
			variant="outline-secondary"
			size="sm"
			onClick={() => states.setDirectionsResponse(null)}
		>
			Clear Directions
		</Button>
	);
}
