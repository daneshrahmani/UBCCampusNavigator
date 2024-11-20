export const getRooms = async () => {

    const query = `
    {
          "WHERE": {},
          "OPTIONS": {
              "COLUMNS": [
                  "rooms_fullname",
                  "rooms_shortname",
                  "rooms_number",
                  "rooms_name",
                  "rooms_address",
                  "rooms_lat",
                  "rooms_lon",
                  "rooms_seats",
                  "rooms_type",
                  "rooms_furniture",
                  "rooms_href"
              ],
              "ORDER": {
				"dir": "UP",
				"keys": [
					"rooms_shortname",
					"rooms_number"
				]
			  }
          }
      }
    `
  
    const res = await fetch("http://localhost:4321/query", {
      method: "POST",
      body: query,
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    return res.json();
}