import React, { useState } from 'react';
import Table from 'react-bootstrap/Table'
import ClearDirections from "../Buttons/ClearDirections";
import GetDirections from "../Buttons/GetDirections";
import TransportationModeToggle from "../Toggles/TransportationMode";
import { getDistance } from "../../Utils/RoomSelectedDistance";
import Form from "react-bootstrap/Form"

export default function DistanceTable({ states }) {
	const { selectedRooms } = states;

	const pairs = [];

	for (let i = 0; i < selectedRooms.length; i++) {
		for (let j = i + 1; j < selectedRooms.length; j++) {
			pairs.push([selectedRooms[i], selectedRooms[j]]);
		}
	}

	return (
		<div>
			<Table striped border hover>
				<thead>
					<tr>
						<th>Rooms</th>
						<th>Distance (m)</th>
					</tr>
				</thead>
				<tbody>
					{pairs.map((pair, index) => (
						<tr key={index}>
							<td>{`${pair[0].rooms_name.replace("_", " ")} - ${pair[1].rooms_name.replace("_", " ")}`}</td>
							<td>{getDistance(pair[0], pair[1])}</td>
							<td><GetDirections pair={pair} states={states} /></td>
						</tr>
					))}
				</tbody>
			</Table>
			<Form>
				<TransportationModeToggle states={states}/>
			</Form>
			<ClearDirections states={states} />
		</div>
	)
}
