import React from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css";

export default function CapacitySlider({states}) {
    
    const handleChange = e => {
        states.setFilters(prevFilters => ({...prevFilters, capacityRange: e}))
        states.setSelectedRooms(prevRooms => prevRooms.filter(room => room.rooms_seats >= e[0] && room.rooms_seats <= e[1]))
    }

    console.log(states.filters.capacityRange)

    return (
        <div>
            <Slider
                range
                max={states.maxRoomCapacity}
                value={states.filters.capacityRange}
                onChange={handleChange}
            />
        </div>
    )
}