import { Route, Routes,  } from 'react-router-dom';
import './App.css';
import EditRoute from './components/EditRoute/EditRoute';
import OSM_Map from './components/Map/OSM_Map';
// import RouteOptions from './components/RouteOptions/RouteOptions';
import RoutesTable from './components/Routes/RoutesTable';
import SetRoute from './components/SetRoute/SetRoute';

function App() {
  return (
    <div className="App">

      <div className="App__wrapper">
        <Routes>
          <Route path='/' element={<RoutesTable/>}></Route>
          <Route path='/patrol-route' element={<SetRoute/>}></Route>
          <Route path='/edit-route' element={<EditRoute />}></Route>
        </Routes>
        <OSM_Map/>
      </div>
      
      
    </div>
  );
}

export default App;
