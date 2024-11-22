import { useState, useRef } from 'react';

export function useMapControl() {
	const mapRef = useRef(null);
	const [selectedBuilding, setSelectedBuilding] = useState(null);

	const handleMapLoad = (map) => {
		mapRef.current = map;
	};

	const handleMarkerClick = (building) => {
		setSelectedBuilding(building.shortname);
		if (mapRef.current) {
			mapRef.current.panTo({ lat: building.lat, lng: building.lon });
		}
	};

	const handleMapClick = () => {
		setSelectedBuilding(null);
	};

	return {
		mapRef,
		selectedBuilding,
		handleMapLoad,
		handleMarkerClick,
		handleMapClick
	};
}
