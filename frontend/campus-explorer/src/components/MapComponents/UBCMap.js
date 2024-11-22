import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import BuildingInfoBox from "./BuildingInfoBox";
import BuildingMarker from "./BuildingMarker";
import RecenterMap from "../Buttons/RecenterMap";
import { useBuildingInfo } from "../../Hooks/BuildingInfo";
import { useMapControl } from "../../Hooks/MapControl";
import { MAP_STYLES, MAP_OPTIONS, UBC_CENTER } from "../../constants/mapConstants";

const UBCMap = ({ states }) => {
	const buildingInfo = useBuildingInfo(states.roomsByBuilding);
	const {
		mapRef,
		selectedBuilding,
		handleMapLoad,
		handleMarkerClick,
		handleMapClick
	} = useMapControl();

	return (
		<div style={MAP_STYLES}>
			<LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCZb61HwSZY7b6X558GbsxCxI9-8P-_8Is"}>
				<GoogleMap
					mapContainerStyle={MAP_STYLES}
					zoom={15}
					center={UBC_CENTER}
					options={MAP_OPTIONS}
					onClick={handleMapClick}
					onLoad={handleMapLoad}
				>
					{buildingInfo.map(building => (
						<BuildingMarker
							key={building.shortname}
							building={building}
							onClick={handleMarkerClick}
						/>
					))}

					{buildingInfo.map(building =>
						building.shortname === selectedBuilding ? (
							<BuildingInfoBox
								key={`info-${building.shortname}`}
								building={building}
							/>
						) : null
					)}

					{
						states.directionsPair && !states.directionsResponse &&
						<DirectionsService
							options={{
								origin: { lat: states.directionsPair[0].rooms_lat, lng: states.directionsPair[0].rooms_lon },
								destination: { lat: states.directionsPair[1].rooms_lat, lng: states.directionsPair[1].rooms_lon },
								travelMode: states.travelMode
							}}
							callback={res => {
								states.setDirectionsResponse(res)
							}}
						/>
					}

					{states.directionsResponse &&
						<DirectionsRenderer
							directions={states.directionsResponse}
							options={{ suppressMarkers: true }}
						/>
					}

					{/*Help from ChatGPT*/}
					<div style={{
						position: 'absolute',
						top: '0',
						right: '40px'  // Space for the fullscreen button
					}}>
						<RecenterMap map={mapRef?.current} />
					</div>
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default UBCMap;
