import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { deleteRoute, deleteRouteAsync, getRoutesAsync } from '../../redux/patroslSlice'
//import ol from 'ol'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature';
import PolygonGeom from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';
import * as olStyle from 'ol/style';
import Tile from 'ol/layer/Tile';
import View from 'ol/View';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import { add } from 'ol/coordinate';
import LineString from 'ol/geom/LineString';

function RoutesTable() {
  const routes = useSelector((state) => state.patrols)
  const [watchRoute, setWatchRoute] = useState(false)
  const [routePlan, setRoutePlan] = useState('')

  //map = routes[1].map;
  const dispatch = useDispatch();
  useEffect(async () => {
    dispatch(getRoutesAsync())
  }, [dispatch])

  const handleDelete = (id) => {
    console.log(id);

    dispatch(deleteRoute(id));
    dispatch(deleteRouteAsync(id))
  }

  const handleEditRoute = (id) => {
    // getting specific route plan by id
    let data = routes[0].RoutePlans.filter(routePlan => routePlan.Id === id)
    console.log(data);
  }

  const handleShowRoute = (id) => {
    setWatchRoute(!watchRoute)
    let route = routes[0].RoutePlans.filter(routePlan => routePlan.Id === id)
    route = route[0];

    if (typeof route === 'undefined') {
      console.log('route is undefinded');
      return;
    }

    // getting coordinates to draw new map
    var coordinatesPolygon = new Array();
    // gooing over our jason file to get the coordinates points
    for (let i = 0; i < route.CheckPoints.length; i++) {
      const item = route.CheckPoints[i];
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      // transforming the coordinates to specific format
      var pointTransform = fromLonLat([lon, lat], "EPSG:4326");
      coordinatesPolygon.push(pointTransform);
    }

    drawPolygonOnMap(coordinatesPolygon, route.Id);

    setRoutePlan(route);
  }

function drawPolygonOnMap(coordinates, routeId) {

  let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
  if (typeof _vector === 'undefined') {
    return;
  }

  let source = _vector.getSource();
  //linestring 
  var lineString = new LineString(coordinates);  
  //polygon
  //var plygon = new PolygonGeom([coordinates])
  var feature = new Feature({
    geometry: lineString,
  });

  feature.Id = routeId;

  //console.log(feature);
  source.addFeature(feature);
  //console.log(_vector.getSource().getFeatures().length);
}

function removeLinePath() {
  
  let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
  if (typeof _vector === 'undefined') {
    return;
  }
  let source = _vector.getSource();
  source.clear();
}

return (
  watchRoute ?
    <div>
      <h3> Route {routePlan.Id}</h3>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Point Number</TableCell>
              <TableCell>Laitude</TableCell>
              <TableCell>Longitde</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              //console.log(routePlan);
              routePlan.CheckPoints.map((routePoint, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{index}</TableCell>
                    <TableCell>{routePoint.Latitude}</TableCell>
                    <TableCell>{routePoint.Longitude}</TableCell>
                    <TableCell>{routePoint.WaitforSeconds}</TableCell>
                    <TableCell>
                      <button>delete</button>
                    </TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
      <button onClick={() => { setWatchRoute(!watchRoute); removeLinePath(); }}> back</button>
    </div>
    :
    <div className='RoutesTable'>

      <TableContainer>
        <Table sx={{ maxWidth: 605 }}>
          <TableHead>
            <TableCell>Routes</TableCell>
            <TableRow>
              <TableCell>Route number</TableCell>
              <TableCell>Route Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes[0].RoutePlans.map((route, index) => {

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell onClick={() => handleShowRoute(route.Id)} >{route.Id}</TableCell>
                  <button onClick={() => { handleEditRoute(route.Id) }}>Edit Route</button>
                  <button onClick={() => { handleDelete(route.Id) }}>Delete Route</button>
                </TableRow>
              )


            })}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="RoutesTable__options">
        <Link to='/patrol-route'>
          <button>Add Route</button>
        </Link>

      </div>

    </div>
)
}

export default RoutesTable