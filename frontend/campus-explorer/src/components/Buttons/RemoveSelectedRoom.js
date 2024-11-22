import Button from "react-bootstrap/Button";
import React from "react";


export default function RemoveSelectedRoom({ room, onRemove }) {
	return (
		<Button
			variant="outline-danger"
			size="sm"
			onClick={() => onRemove(room)}
			style={{
				position: 'absolute',
				top: '2px',
				right: '2px',
				padding: '0px 6px',
				fontSize: '0.8rem',
				minWidth: 'auto'
			}}
		>
			×
		</Button>
	)
}
