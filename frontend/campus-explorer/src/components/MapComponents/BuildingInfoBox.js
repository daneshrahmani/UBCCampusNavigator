import React from 'react';
import { InfoBox } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';
import '../../styling/BuildingInfoBox.css';

export default function BuildingInfoBox({ building }) {
	console.log(building, "aaaa")
	console.log(building.shortname.toLowerCase())
	console.log(building.fullname)
	const formattedFullName = building.fullname
		.replace(/\s+/g, '-')
		.replace(/\./g, '')
		.toLowerCase();
	const buildingUrl = `https://learningspaces.ubc.ca/buildings/${formattedFullName}-${building.shortname.toLowerCase()}`;
	return (
		<InfoBox
			position={{ lat: building.lat, lng: building.lon }}
			options={{ closeBoxURL: "" }}

		>
			<div className="building-info-box">
				<div className="building-info-header">
					<FaMapMarkerAlt className="building-info-icon" />
					<h4 className="building-title">
						<a href={buildingUrl} target="_blank" rel="noopener noreferrer" className="building-title-link">
							{building.fullname}
						</a>
					</h4>
				</div>
				<p className="building-address">{building.address}</p>
				<p className="rooms-count">Rooms Matching Filters: <strong>{building.roomCount}</strong></p>
			</div>
		</InfoBox>
	);
}
