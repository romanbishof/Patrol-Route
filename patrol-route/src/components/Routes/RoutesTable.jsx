import { Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { deleteRoute, deleteRouteAsync, getDevicesAsync, getRoutesAsync } from '../../redux/patroslSlice'
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import LineString from 'ol/geom/LineString';
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon';
import { Point } from 'ol/geom'
import arrowImage from './arrow.png'
import Stroke from 'ol/style/Stroke'
import EditIcon from '@mui/icons-material/Edit';
import './RoutesTable.css'

function RoutesTable() {
  const routes = useSelector((state) => state.patrols)
  const [checkRouteId, setCheckRouteId] = useState('')
  const [routeId, setRouteId] = useState('')
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(async () => {
    dispatch(getRoutesAsync())
  }, [dispatch])

  const theme = createTheme({
    palette: {
      primary: {
        main: '#d85728',
      }
    }
  })

  const handleDelete = () => {
    setOpen(false)
    dispatch(deleteRoute(routeId));
    dispatch(deleteRouteAsync(routeId));
    removeLinePath();
  }

  const handleEditRoute = (routeId) => {
    // getting specific route plan by id
    let route = routes[0].RoutePlans.filter(routePlan => routePlan.Id === routeId)
    // console.log(route);
    navigate(`/edit-route/:route`, { state: { route: route[0] } })
    removeLinePath();
  }

  const handleShowRoute = (routeId) => {

    let route = routes[0].RoutePlans.filter(routePlan => routePlan.Id === routeId)
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

    if (checkRouteId !== routeId) {
      // calling the function that adds layer of drawing on our existing map
      drawPolygonOnMap(coordinatesLineString, route.Id);
    } else {
      // if the route alredy drawn --> we remove it
      removeLinePath()
      setCheckRouteId('')
    }
  }

  const styleFunction = (feature) => {


    var geometry = feature.getGeometry();

    let styles = [
      new Style({
        // linestring
        stroke: new Stroke({
          color: '#fc8100',
          width: 2
        })
      })
    ]

    // iterate over each segment to add arrow at the end
    geometry.forEachSegment((start, end) => {
      let dx = end[0] - start[0]
      let dy = end[1] - start[1]
      let rotation = Math.atan2(dy, dx)

      // arrow
      styles.push(new Style({
        geometry: new Point(end),
        image: new Icon({
          src: arrowImage,
          color: '#fc8100',
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation
        })
      }))
    })

    return styles;
  }

  // const handleSecurityLevel = (e) => {
  //   console.log(e.target.value);
  // }

  //function to draw Route on MAP 
  function drawPolygonOnMap(coordinates, routeId) {
    setCheckRouteId(routeId)
    removeLinePath();
    // getting the Specific layer from all the Layer in our map
    let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');

    if (typeof _vector === 'undefined') {
      return;
    }
    // getting our source of vector
    let source = _vector.getSource();

    //linestring 
    let lineString = new LineString(coordinates);

    //polygon
    //var plygon = new PolygonGeom([coordinates])

    // creating new feature for map
    // adding line based on our coordinates
    var feature = new Feature({
      geometry: lineString,
    });


    _vector.setStyle(styleFunction(feature))

    // giving ID to our feature
    feature.Id = routeId;

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
      <ThemeProvider theme={theme}>

        <TableContainer>
          <Table stickyHeader className='RoutesTable__table'>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell >Route Name</TableCell>
                <TableCell align='center' >Actions</TableCell>
                {/* <TableCell>Security Level</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                routes[0].RoutePlans.map((route, index) => {

                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ cursor: 'pointer' }} onClick={() => { handleShowRoute(route.Id); }} >{route.Name}</TableCell>
                      <TableCell>
                        <Stack spacing={3} direction='row' justifyContent='center'>
                          <EditIcon sx={{ cursor: 'pointer' }} onClick={() => { handleEditRoute(route.Id); }} />
                          <Button variant='contained' color='primary' size='small' onClick={() => { setOpen(true); setRouteId(route.Id) }}>Remove</Button>
                        </Stack>
                      </TableCell>
                      <Dialog
                        open={open}
                        onClose={() => { setOpen(false); }}
                        aria-describedby='alert-delete'
                      >
                        <DialogContent>
                          <DialogContentText id="alert-delete">
                            Are you sure you want to delete this Route?
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleDelete}>Yes</Button>
                          <Button onClick={() => { setOpen(false) }}>Cancel</Button>
                        </DialogActions>
                      </Dialog>
                      {/* <TableCell>
                          <FormControl fullWidth>
                            <InputLabel id='TableSecurityLevelId'>Security Level</InputLabel>
                            <Select
                              labelId='TableSecurityLevelId'
                              label='TableSecurityLevel'
                              defaultValue={180}
                              onChange={handleSecurityLevel}>
                              <MenuItem value={180}>L1</MenuItem>
                              <MenuItem value={120}>L2</MenuItem>
                              <MenuItem value={60}>L3</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell> */}
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
        <div className="RoutesTable__button">
          <Button onClick={() => { removeLinePath(); navigate('/patrol-route') }} variant='contained'>Add Route</Button>
        </div>

      </ThemeProvider>
    </div>
  )
}

export default RoutesTable