import React, { useState } from 'react';
import Table from 'react-bootstrap/Table'
import Form from "react-bootstrap/Form";
import GetDirections from "./Buttons/GetDirections";
import { getDistance } from "../Utils/RoomSelectedDistance";

export default function DistanceTable({ states }) {
    const { selectedRooms } = states;
	const [checkedIndex, setCheckedIndex] = useState(null);
	const [selectedPair, setSelectedPair] = useState(null);

	const handleCheckboxChange = (pair, index) => {
		setSelectedPair(selectedPair === pair ? null : pair);
		setCheckedIndex(checkedIndex === index ? null : index);
	};

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
						<th></th>
						<th>Rooms</th>
						<th>Distance (m)</th>
					</tr>
				</thead>
				<tbody>
					{pairs.map((pair, index)=> (
						<tr key={index}>
							<td>
								<Form.Check
									type="checkbox"
									checked={checkedIndex === index}
									onChange={() => handleCheckboxChange(pair, index)}
									disabled={checkedIndex !== null && checkedIndex !== index}
								/>
							</td>
							<td>{`${pair[0].rooms_name.replace("_", " ")} - ${pair[1].rooms_name.replace("_", " ")}`}</td>
							<td>{getDistance(pair[0], pair[1])}</td>
						</tr>
					))}
				</tbody>
			</Table>

			<GetDirections pair={selectedPair}/>
		</div>
	)
}
