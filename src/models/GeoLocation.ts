import * as http from "http";

export interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

// Makes an API GET Request to retrieve a given Building's geolocation data
// This data will be applied to each resultant Room object from the given building
export async function getGeolocation(address: string): Promise<GeoResponse> {
	return new Promise((resolve) => {
		const EXPECTED_RESPONSE_CODE = 200;
		const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team040/${encodeURIComponent(address)}`;

		http
			.get(url, (res) => {
				let data = "";

				if (res.statusCode !== EXPECTED_RESPONSE_CODE) {
					resolve({ error: `HTTP error, status: ${res.statusCode}` });
					return;
				}

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					try {
						const geolocationData = JSON.parse(data) as GeoResponse;
						resolve(geolocationData);
					} catch (err) {
						resolve({ error: String(err) });
					}
				});
			})
			.on("error", (err) => {
				resolve({ error: String(err) });
			});
	});
}
