import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { deleteRoute, deleteRouteAsync, getRoutesAsync } from '../../redux/patroslSlice'
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import LineString from 'ol/geom/LineString';


function RoutesTable() {
  const routes = useSelector((state) => state.patrols)
  const [checkRouteId, setCheckRouteId] = useState('')
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(async () => {
    dispatch(getRoutesAsync())
  }, [dispatch])

  const handleDelete = (routeName) => {
    setOpen(false)
    dispatch(deleteRoute(routeName));
    dispatch(deleteRouteAsync(routeName));
    removeLinePath();
  }

  const handleEditRoute = (routeName) => {
    // getting specific route plan by id
    let route = routes[0].RoutePlans.filter(routePlan => routePlan.Name === routeName)
    // console.log(route);
    navigate(`/edit-route/:route`, { state: { route: route[0] } })
    removeLinePath();
  }

  const handleShowRoute = (routeName) => {

    let route = routes[0].RoutePlans.filter(routePlan => routePlan.Name === routeName)
    route = route[0];
    // console.log('id of route by click ', id);

    if (typeof route === 'undefined') {
      console.log('route is undefinded');
      return;
    }

    // getting coordinates to draw new map
    var coordinatesLineString = new Array();

    // gooing over our jason file to get the coordinates points
    for (let i = 0; i < route.CheckPoints.length; i++) {
      const item = route.CheckPoints[i];
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);

      // transforming the coordinates to specific format
      var pointTransform = fromLonLat([lon, lat], "EPSG:4326");
      coordinatesLineString.push(pointTransform);
    }

    if (checkRouteId !== routeName) {
      // calling the function that adds layer of drawing on our existing map
      drawPolygonOnMap(coordinatesLineString, route.Name);
    } else {
      // if the route alredy drawn --> we remove it
      removeLinePath()
      setCheckRouteId('')
    }
  }

  //function to draw Route on MAP 
  function drawPolygonOnMap(coordinates, routeName) {
    setCheckRouteId(routeName)
    removeLinePath();
    // getting the Specific layer from all the Layer in our map
    let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');

    if (typeof _vector === 'undefined') {
      return;
    }
    // getting our source of vector
    let source = _vector.getSource();

    //linestring 
    var lineString = new LineString(coordinates);

    //polygon
    //var plygon = new PolygonGeom([coordinates])

    // creating new feature for map
    // adding line based on our coordinates
    var feature = new Feature({
      geometry: lineString,
    });

    // giving ID to our feature
    feature.Name = routeName;

    //console.log(feature);
    source.addFeature(feature);
    //console.log(_vector.getSource().getFeatures().length);
  }

  // removing the route layer
  function removeLinePath() {

    let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
    if (typeof _vector === 'undefined') {
      return;
    }
    let source = _vector.getSource();
    source.clear();
  }

  return (
    <div className='RoutesTable'>
      <Box width={950} sx={{ padding: 5 }}>
        <TableContainer>
          <Table size='medium' sx={{ maxWidth: 605, padding: 5 }}>
            <TableHead>
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
                    <TableCell onClick={() => { handleShowRoute(route.Name); }} >{route.Name}</TableCell>
                    <Stack spacing={1} direction='row' justifyContent='center'>
                      <Button variant='outlined' onClick={() => { handleEditRoute(route.Name); }}>Edit Route</Button>
                      <Button variant='outlined' onClick={() => { setOpen(true) }}>Delete</Button>
                    </Stack>

                    <Dialog
                      open={open}
                      onClose={() => { setOpen(false) }}
                      aria-describedby='alert-delete'
                    >
                      <DialogContent>
                        <DialogContentText id="alert-delete">
                          Are you sure you want to delete this Route?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => { handleDelete(route.Name) }}>Yes</Button>
                        <Button onClick={() => { setOpen(false) }}>Cancel</Button>
                      </DialogActions>
                    </Dialog>
                  </TableRow>
                )
              })
              }
            </TableBody>
          </Table>
        </TableContainer>
        <div className="RoutesTable__options">
          <Button onClick={() => { removeLinePath(); navigate('/patrol-route') }} variant='contained'>Add Route</Button>
        </div>
      </Box>
    </div>
  )
}

export default RoutesTable