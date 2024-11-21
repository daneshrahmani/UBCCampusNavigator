import React from "react";
import Form from "react-bootstrap/Form";
import CapacitySlider from "./CapacitySlider";

export default function FilteringTools({ states }) {

    const handleRoomTypeChange = (e) => {
        if (e.target.value != "Any") {
            states.setSelectedRooms(prevSelectedRooms => prevSelectedRooms.filter(room => room.rooms_type === e.target.value));
        }
        states.setFilters(prevFilters => ({...prevFilters, roomType: e.target.value}))
    }


    const { roomData } = states;
    const roomTypesSet = new Set();
    for (let room of roomData) {
        roomTypesSet.add(room.rooms_type)
    }
    const roomTypes = [...roomTypesSet].sort();

    return (
        <div>
            <Form.Select
                value={states.filters.roomType}
                onChange={e => handleRoomTypeChange(e)}
            >
                <option>Any</option>
                {roomTypes.map(type => <option value={type}>{type}</option>)}
            </Form.Select>
            <CapacitySlider states={states} />
        </div>
    )
}