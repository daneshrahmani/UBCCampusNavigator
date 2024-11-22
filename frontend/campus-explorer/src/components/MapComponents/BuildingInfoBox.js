import React from 'react';
import { InfoBox } from '@react-google-maps/api';

export default function BuildingInfoBox({ building }) {
	return (
		<InfoBox
			position={{ lat: building.lat, lng: building.lon }}
			options={{ closeBoxURL: "" }}
		>
			<div className="card">
				<p>{`${building.fullname} (${building.shortname})`}</p>
				<p>{building.address}</p>
				<p>Rooms Matching Filters: {building.roomCount}</p>
			</div>
		</InfoBox>
	);
}
