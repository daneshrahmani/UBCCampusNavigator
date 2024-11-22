import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import React from 'react';
import BuildingInfoBox from "./BuildingInfoBox";
import BuildingMarker from "./BuildingMarker";
import RecenterMap from "../Buttons/RecenterMap";
import { useBuildingInfo } from "../../Hooks/BuildingInfo";
import { useMapControl } from "../../Hooks/MapControl";
import { MAP_STYLES, MAP_OPTIONS, UBC_CENTER } from "../../constants/mapConstants";

// Colours from ChatGPT
const routeColors = ['#2196F3', '#FF5722', '#4CAF50', '#9C27B0', '#FF9800'];

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
							states={states}
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

					{states.directionsPair &&
						<DirectionsService
							options={{
								origin: {
									lat: states.directionsPair[0].rooms_lat,
									lng: states.directionsPair[0].rooms_lon
								},
								destination: {
									lat: states.directionsPair[1].rooms_lat,
									lng: states.directionsPair[1].rooms_lon
								},
								travelMode: states.travelMode
							}}
							// Help from ChatGPT
							callback={res => {
								if (res && res.routes && res.routes[0] && res.routes[0].legs[0]) {
									const leg = res.routes[0].legs[0];
									const newResponse = {
										...res,
										duration: leg.duration.text,
										distance: leg.distance.text,
										start: leg.start_address,
										end: leg.end_address,
										pair: states.directionsPair,
										color: routeColors[states.directionsResponses.length % routeColors.length]
									};
									states.setDirectionsResponses([...states.directionsResponses, newResponse]);
									states.setDirectionsPair(null);
								}
							}}
						/>
					}

					{states.directionsResponses.map((response, index) => (
						<DirectionsRenderer
							key={`direction-${index}`}
							directions={response}
							options={{
								suppressMarkers: true,
								polylineOptions: {
									strokeColor: response.color,
									strokeWeight: 4
								}
							}}
						/>
					))}

					{states.directionsResponses.map((response, index) => (
						<div
							key={`overlay-${index}`}
							// Styling from ChatGPT
							style={{
								position: 'absolute',
								backgroundColor: 'white',
								padding: '8px 12px',
								borderRadius: '4px',
								boxShadow: '0 2px 6px rgba(0,0,0,.3)',
								margin: '10px',
								top: `${10 + (index * 60)}px`,
								left: '50%',
								transform: 'translateX(-50%)',
								zIndex: 1000,
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								borderLeft: `4px solid ${response.color}`
							}}
						>
							{response.pair[0].rooms_name.replace("_", " ") + " to " + response.pair[1].rooms_name.replace("_", " ")}
							<span className="text-muted">·</span>
							{states.travelMode === "WALKING" ? "🚶‍♂️‍➡️" : "🚴‍♂️"}
							<span>{response.duration}</span>
							<span className="text-muted">·</span>
							<span>{response.distance}</span>
						</div>
					))}
					<RecenterMap map={mapRef?.current}/>
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default UBCMap;
