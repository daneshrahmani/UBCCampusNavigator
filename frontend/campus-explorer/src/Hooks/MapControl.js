import { useState, useRef } from 'react';

export function useMapControl(states) {
	const mapRef = useRef(null);

	const handleMapLoad = (map) => {
		mapRef.current = map;
	};

	const handleMarkerClick = (building) => {
		states.setSelectedBuilding(building.shortname);
		if (mapRef.current) {
			mapRef.current.panTo({ lat: building.lat, lng: building.lon });
		}
	};

	const handleMapClick = () => {
		states.setSelectedBuilding(null);
	};

	const selectedBuilding = states.selectedBuilding;

	return {
		mapRef,
		selectedBuilding,
		handleMapLoad,
		handleMarkerClick,
		handleMapClick
	};
}
