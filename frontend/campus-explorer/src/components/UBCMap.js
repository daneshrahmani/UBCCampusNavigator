import { GoogleMap, InfoBox, LoadScript, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';

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
			fullname: building[0].rooms_fullname,
			shortname: building[0].rooms_shortname,
			address: building[0].rooms_address,
			roomCount: building.length,
			lat: building[0].rooms_lat,
			lon: building[0].rooms_lon
		})
	}

	// ubc coordinates for centring
	const [center, setCenter] = useState({
		lat: 49.26596405700797,
		lng: -123.25266284768082
	})

	const [selectedBuilding, setSelectedBuilding] = useState(null)

	const mapStyles = {
		height: "89%",
		width: "100%"
	};

	return (
		<div style={mapStyles}>
			<LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
				<GoogleMap
					mapContainerStyle={mapStyles}
					zoom={15.8}
					center={center}
					options={mapOptions}
					onClick={() => setSelectedBuilding(null)}
				>
					{buildingInfo.map(b => (
						<Marker
							position={{ lat: b.lat, lng: b.lon }}
							label={b.shortname}
							icon={null}
							onClick={() => {
								setCenter({lat: b.lat, lng: b.lon})
								setSelectedBuilding(b.shortname)
							}}
						/>
					))}
					{buildingInfo.map(b => {
						if (b.shortname === selectedBuilding) {
							return (
								<InfoBox
									position={{ lat: b.lat, lng: b.lon }}
									options={{closeBoxURL: ""}}
								>
									<div className="card">
										<p>{`${b.fullname} (${b.shortname})`}</p>
										<p>{b.address}</p>
										<p>Rooms Matching Filters: {b.roomCount}</p>
									</div>
								</InfoBox>
							)
						}
					})}
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default UBCMap;
