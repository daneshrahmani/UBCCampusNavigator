import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Panels/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRooms } from './store/queries';
import BottomPanel from "./components/Panels/BottomPanel";
import RightPanel from './components/Panels/RightPanel';
import UBCMap from './components/UBCMap';
import { getFilteredRooms, getMaxRoomCapacity, groupRoomsByBuilding } from './store/helpers';

function App() {

	const [roomData, setRoomData] = useState([]);

	const [filters, setFilters] = useState({
		roomType: "Any",
		capacityRange: [0, 0]
	})

	const filteredRooms = getFilteredRooms(roomData, filters); 
	const roomsByBuilding = groupRoomsByBuilding(filteredRooms);

	const [selectedRooms, setSelectedRooms] = useState([]);	
	const [maxRoomCapacity, setMaxRoomCapacity] = useState(0);

	const states = {
		"filters": filters,
		"setFilters": setFilters,
		"filteredRooms": filteredRooms,
		"roomData": roomData,
		"setRoomData": setRoomData,
		"selectedRooms": selectedRooms,
		"setSelectedRooms": setSelectedRooms,
		"roomsByBuilding": roomsByBuilding,
		"maxRoomCapacity": maxRoomCapacity
	}

	useEffect(() => {
		const fetchRooms = async () => {
			const res = await getRooms();
			setRoomData(res.result);
			let maxCapacity = getMaxRoomCapacity(res.result)
			maxCapacity = Math.ceil(maxCapacity / 100) * 100
			setMaxRoomCapacity(maxCapacity)
			setFilters({
				roomType: "Any",
				capacityRange: [0, maxCapacity]
			})
		}
		fetchRooms();
	}, [])

	return (
		<div className="App vh-100">
			<div className="row h-100 g-0">
				<div className="col-2 border-end">
					<Sidebar states={states} />
				</div>

				<div className="col-7 position-relative h-100">
					<div className="h-100">
						<UBCMap states={states} />
					</div>
					<BottomPanel states={states} />
				</div>

				<div className="col-3">
					<RightPanel states={states} />
				</div>
			</div>
		</div>
	);
}

export default App;
