import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useSearchParams } from "react-router-dom";
import "./App.css";
import EditRoute from "./components/EditRoute/EditRoute";
import OSM_Map from "./components/Map/OSM_Map";
// import RouteOptions from './components/RouteOptions/RouteOptions';
import RoutesTable from "./components/Routes/RoutesTable";
import SetRoute from "./components/SetRoute/SetRoute";
import { getDevicesAsync, setColorTheme } from "./redux/patroslSlice";

function App() {
  // const state = useSelector((state) => state.patrols)
  const dispatch = useDispatch();
  const [colorParams] = useSearchParams();
  useEffect(async () => {
    dispatch(getDevicesAsync());

    switch (colorParams.get("color")) {
      case "yellow": {
        dispatch(setColorTheme("#faba01"));
        // setColor("#faba01");
        break;
      }
      case "red": {
        dispatch(setColorTheme("#a80000"));
        // setColor("#a80000");
        break;
      }
      case "green": {
        dispatch(setColorTheme("#668d11"));
        // setColor("#668d11");
        break;
      }
      case "blue": {
        dispatch(setColorTheme("#115F8D"));
        // setColor("#115F8D");
        break;
      }
      case "purple": {
        dispatch(setColorTheme("#9a3797"));
        // setColor("#9a3797");
        break;
      }
      case "KarmaGreen": {
        dispatch(setColorTheme("#009652"));
        // setColor("#009652");
        break;
      }
      case "GrayTint": {
        dispatch(setColorTheme("#d1d6da"));
        // setColor("#d1d6da");
        break;
      }
      case "orange":
      default:
        dispatch(setColorTheme("#d85728"));
        // setColor("#d85728");
        break;
    }
  }, []);

  return (
    <div className="App">
      <div className="App__wrapper">
        <div className="App__wrapper-left">
          <Routes>
            <Route path="/" element={<RoutesTable />}></Route>
            <Route path="/patrol-route" element={<SetRoute />}></Route>
            {/* <Route path='/edit-route/:route' element={<EditRoute />}></Route> */}
            <Route path="/edit-route" element={<EditRoute />}></Route>
          </Routes>
        </div>
        <div className="App__wrapper-right">
          <OSM_Map />
        </div>
      </div>
    </div>
  );
}

export default App;
