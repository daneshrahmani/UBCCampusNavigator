import React, { useState } from 'react';
import Table from 'react-bootstrap/Table'
import GetDirections from "./Buttons/GetDirections";
import { getDistance } from "../Utils/RoomSelectedDistance";
import Button from 'react-bootstrap/esm/Button';
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
				<div key={`default-radio`} className="mb-3">
					<Form.Check // prettier-ignore
						type="radio"
						label="Walking"
						checked={states.travelMode === "WALKING"}
						onClick={() => {
							states.setTravelMode("WALKING")
							states.setDirectionsResponse(null)
						}}
					/>
					<Form.Check
						type="radio"
						label="Bicycling"
						checked={states.travelMode === "BICYCLING"}
						onClick={() => {
							states.setTravelMode("BICYCLING")
							states.setDirectionsResponse(null)
						}}
					/>
				</div>
			</Form>
			<Button
				className="mb-1"
				variant="outline-secondary"
				size="sm"
				onClick={() => states.setDirectionsResponse(null)}
			>
				Clear Directions
			</Button>
		</div>
	)
}
