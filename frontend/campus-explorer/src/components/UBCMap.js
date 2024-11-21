import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import React from 'react';

const mapOptions = {
	styles: [
		{
			featureType: "all",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
	],
};

// NOTE: If we want to use the ubc wayfinding and maps api with leaflet and react-leflet only minimal changes are needed
const UBCMap = ({ states }) => {

	const { roomsByBuilding } = states;
	const buildingInfo = []

	for (let building of roomsByBuilding) {
		buildingInfo.push({
			shortname: building[0].rooms_shortname,
			lat: building[0].rooms_lat,
			lon: building[0].rooms_lon
		})
	}

	console.log(buildingInfo)


	// ubc coordinates for centring
	const center = {
		lat: 49.26596405700797,
		lng: -123.25266284768082
	};

	const mapStyles = {
		height: "89%",
		width: "100%"
	};

	return (
		<div style={mapStyles}>
			<LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
				<GoogleMap
					mapContainerStyle={mapStyles}
					zoom={16}
					center={center}
					options={mapOptions}
				>
					{buildingInfo.map(b => <Marker position={{ lat: b.lat, lng: b.lon }} label={b.shortname} icon={null} />)}
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default UBCMap;
