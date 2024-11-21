import React from 'react';
import Table from 'react-bootstrap/Table'

const degToRad = (deg) => {
    return deg * (Math.PI / 180);
}

// With help from ChatGPT
const getDistance = (room1, room2) => {
    const lat1 = degToRad(room1.rooms_lat);
    const lat2 = degToRad(room2.rooms_lat);
    const lon1 = degToRad(room1.rooms_lon);
    const lon2 = degToRad(room2.rooms_lon);

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const earthRadius = 6371000;

    const distance = Math.round(earthRadius * c);
    
    return distance.toString();
}

export default function DistanceTable({ states }) {
    const { selectedRooms } = states;
    
    const pairs = [];

    for (let i = 0; i < selectedRooms.length; i++) {
        for (let j = i + 1; j < selectedRooms.length; j++) {
            pairs.push([selectedRooms[i], selectedRooms[j]]);
        }
    }

    return (
        <Table striped border hover>
            <thead>
                <tr>
                    <th>Rooms</th>
                    <th>Distance (m)</th>
                </tr>
            </thead>
            <tbody>
                {pairs.map(pair=> (
                    <tr>
                        <td>{`${pair[0].rooms_name.replace("_", " ")} - ${pair[1].rooms_name.replace("_", " ")}`}</td>
                        <td>{getDistance(pair[0], pair[1])}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}