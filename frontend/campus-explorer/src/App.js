import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Panels/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRooms } from './store/queries';
import BottomPanel from "./components/Panels/BottomPanel";
import RightPanel from './components/Panels/RightPanel';
import UBCMap from './components/UBCMap';
import { getFilteredRooms, groupRoomsByBuilding } from './store/helpers';

function App() {

	const [roomData, setRoomData] = useState([]);
	const [selectedRooms, setSelectedRooms] = useState([]);
	const [filters, setFilters] = useState({
		roomType: "Any"
	})

	console.log(selectedRooms)

	const filteredRooms = getFilteredRooms(roomData, filters); 
	const roomsByBuilding = groupRoomsByBuilding(filteredRooms);

	const states = {
		"filters": filters,
		"setFilters": setFilters,
		"filteredRooms": filteredRooms,
		"roomData": roomData,
		"setRoomData": setRoomData,
		"selectedRooms": selectedRooms,
		"setSelectedRooms": setSelectedRooms,
		"roomsByBuilding": roomsByBuilding
	}

	useEffect(() => {
		const fetchRooms = async () => {
			const res = await getRooms();
			setRoomData(res.result);
		}
		fetchRooms();
	}, [])

	return (
		<div className="App vh-100">
			<div className="row h-100 g-0">
				<div className="col-2 border-end">
					<Sidebar states={states} />
				</div>

				<div className="col-8 position-relative h-100">
					<div className="h-100">
						<UBCMap states={states} />
					</div>
					<BottomPanel states={states} />
				</div>

				<div className="col-2">
					<RightPanel states={states} />
				</div>
			</div>
		</div>
	);
}

export default App;
