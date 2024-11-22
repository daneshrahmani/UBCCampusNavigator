import React from 'react';
import { Marker } from '@react-google-maps/api';

export default function BuildingMarker({ building, onClick }) {
	return (
		<Marker
			key={building.shortname}
			position={{ lat: building.lat, lng: building.lon }}
			label={building.shortname}
			icon={null}
			onClick={() => onClick(building)}
		/>
	);
}
