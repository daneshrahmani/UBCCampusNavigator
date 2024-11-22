import React, { useState } from 'react';
import { Marker } from '@react-google-maps/api';

export default function BuildingMarker({ building, onClick, states }) {

	const [isHovered, setIsHovered] = useState(false);
	const isSelected = states.selectedBuilding === building.shortname;

	// Custom Icon from ChatGPT
	const customIcon = {
		path: 'M -2,-1 2,-1 2,1 -2,1 z',
		fillColor: isSelected ? '#FF0000' : '#4B9CD3',
		fillOpacity: isHovered ? 1 : 0.8,
		scale: 10,
		strokeColor: isSelected ? '#8B0000' : '#002145',
		strokeWeight: isHovered || isSelected ? 2 : 1,
	};

	return (
		<Marker
			key={building.shortname}
			position={{ lat: building.lat, lng: building.lon }}
			label={{
				text: building.shortname,
				color: isSelected ? '#FFFFFF' : '#002145',
				fontSize: '12px',
				fontWeight: 'bold'
			}}
			icon={customIcon}
			onClick={() => onClick(building, states)}
			onMouseOver={() => setIsHovered(true)}
			onMouseOut={() => setIsHovered(false)}
		/>
	);
}
