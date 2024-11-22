import { GoogleMap, LoadScript } from '@react-google-maps/api';
import React from 'react';
import BuildingInfoBox from "./MapComponents/BuildingInfoBox";
import BuildingMarker from "./MapComponents/BuildingMarker";
import RecenterMap from "./Buttons/RecenterMap";
import { useBuildingInfo } from "./Hooks/BuildingInfo";
import { useMapControl } from "./Hooks/MapControl";
import { MAP_STYLES, MAP_OPTIONS, UBC_CENTER } from "../constants/mapConstants";

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
			<LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
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

					{/*Help from ChatGPT*/}
					<div style={{
						position: 'absolute',
						top: '0',
						right: '40px'  // Space for the fullscreen button
					}}>
						<RecenterMap map={mapRef?.current}/>
					</div>
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default UBCMap;
