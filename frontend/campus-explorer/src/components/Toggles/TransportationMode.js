import Form from "react-bootstrap/Form";
import React from "react";

export default function TransportationModeToggle({ states }) {
	return (
		<div className="d-flex justify-content-center align-items-center gap-3 mb-3">
			<span className={`${states.travelMode === "WALKING" ? "text-primary" : "text-muted"} d-flex align-items-center`}>
				Walking
			</span>
				<div className="d-flex align-items-center">
					<Form.Check
						type="switch"
						id="travel-mode-switch"
						checked={states.travelMode === "BICYCLING"}
						onChange={(e) => {
							states.setTravelMode(e.target.checked ? "BICYCLING" : "WALKING");
							states.setDirectionsResponse(null);
						}}
						label=""
						className="m-0"  // Remove any default margin
					/>
				</div>
			<span
				className={`${states.travelMode === "BICYCLING" ? "text-primary" : "text-muted"} d-flex align-items-center`}>
				Biking
			</span>
		</div>
	)
}
