import React, { useCallback } from 'react';
import Form from "react-bootstrap/Form";

export default function TransportationModeToggle({ states }) {
	const handleModeChange = useCallback(async (e) => {
		const newMode = e.target.checked ? "BICYCLING" : "WALKING";
		states.setTravelMode(newMode);

		const promises = states.directionsResponses.map(async (response) => {
			// Using the react-google-maps/api breaks clear directions. Maybe change later to use that
			const directionsService = new window.google.maps.DirectionsService();

			try {
				//This snippet from ChatGPT
				const result = await directionsService.route({
					origin: { lat: response.pair[0].rooms_lat, lng: response.pair[0].rooms_lon },
					destination: { lat: response.pair[1].rooms_lat, lng: response.pair[1].rooms_lon },
					travelMode: newMode,
				});

				if (result && result.routes && result.routes[0] && result.routes[0].legs[0]) {
					const leg = result.routes[0].legs[0];
					return {
						...result,
						duration: leg.duration.text,
						distance: leg.distance.text,
						start: leg.start_address,
						end: leg.end_address,
						pair: response.pair,
						color: response.color,
					};
				}
			} catch (error) {
				console.error("Error updating route:", error);
			}

			return null;
		});

		const newResponses = await Promise.all(promises);
		const validResponses = newResponses.filter((response) => response !== null);

		states.setDirectionsResponses(validResponses);

	}, [states]);

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
					onChange={handleModeChange}
					label=""
					className="m-0"
				/>
			</div>

			<span className={`${states.travelMode === "BICYCLING" ? "text-primary" : "text-muted"} d-flex align-items-center`}>
        Biking
      </span>
		</div>
	);
}
