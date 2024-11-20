import { GoogleMap, LoadScript } from '@react-google-maps/api';
import React from 'react';

// NOTE: If we want to use the ubc wayfinding and maps api with leaflet and react-leflet only minimal changes are needed
const UBCMap = () => {
	// ubc coordinates for centring
	const center = {
		lat: 49.2606,
		lng: -123.2460
	};

	const mapStyles = {
		height: "800px",
		width: "100%"
	};

	return (
		<div style={{ height: '100%', width: '100%' }}>
			<LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCZb61HwSZY7b6X558GbsxCxI9-8P-_8Is"}>
				<GoogleMap
					mapContainerStyle={mapStyles}
					zoom={16}
					center={center}
				>
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default UBCMap;
