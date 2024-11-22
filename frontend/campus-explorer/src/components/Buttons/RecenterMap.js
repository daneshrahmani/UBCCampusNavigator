import React from 'react';
import { UBC_CENTER } from '../../constants/mapConstants';

// Help from ChatGPT
const controlStyle = {
	backgroundColor: 'white',
	border: '1px solid #dadce0',
	borderRadius: '2px',
	boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
	cursor: 'pointer',
	margin: '10px',
	padding: '0 17px',
	height: '40px',
	fontSize: '18px',
	lineHeight: '40px',
	textAlign: 'center',
	color: 'rgb(86, 86, 86)',
	fontFamily: 'Roboto, Arial, sans-serif',
	userSelect: 'none'
};

export default function RecenterMap({ map }) {
	const handleClick = () => {
		map?.panTo(UBC_CENTER);
		map?.setZoom(15);
	};

	return (
		<div>
			<button
				type="button"
				style={controlStyle}
				onClick={handleClick}
			>
				Center UBC
			</button>
		</div>
	);
}
