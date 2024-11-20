import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRooms } from './store/queries';
import RoomComparator from './components/RoomCompartor';

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
    <div className="App">
      <div className="row">
        <div className="col-2" style={{}}>
          <Sidebar states={states} />
        </div>
        <div className="col-10">
          <RoomComparator states={states} />
        </div>
      </div>
    </div>
  );
}

export default App;
