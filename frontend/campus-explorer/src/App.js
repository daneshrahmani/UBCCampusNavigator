import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Panels/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRooms } from './store/queries';
import BottomPanel from "./components/Panels/BottomPanel";
import RightPanel from './components/Panels/RightPanel';
import UBCMap from './components/UBCMap';

function App() {

  const [roomData, setRoomData] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([])

  console.log(selectedRooms)

  const states = {
    "roomData": roomData,
    "setRoomData": setRoomData,
    "selectedRooms": selectedRooms,
    "setSelectedRooms": setSelectedRooms
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
						<UBCMap />
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
