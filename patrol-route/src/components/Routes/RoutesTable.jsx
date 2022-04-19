import { Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, InputLabel, MenuItem, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { deleteRoute, deleteRouteAsync, getDevicesAsync, getRoutesAsync, updateRoute, updateRouteAsync } from '../../redux/patroslSlice'
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import LineString from 'ol/geom/LineString';
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon';
import { Point } from 'ol/geom'
import arrowImage from '../../images/arrow.png'
import arrowImg from '../../images/arrow2.png'
import markerImg from '../../images/marker.png'
import Stroke from 'ol/style/Stroke'
import EditIcon from '@mui/icons-material/Edit';
import './RoutesTable.css'
import LogWindow from '../logWindow/LogWindow'

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

  const handleRouteActive = (e, _routeId) => {

    // console.log(_routeId);
    routes.forEach(obj => {
      if ('Jetty' in obj) {
        let newRoutePlan
        obj.RoutePlans.forEach(routePlan => {
          // routePlan.Id === _routeId
          // ? {...routePlan, IsActive: e.target.checked} : {...routePlan}
          if (routePlan.Id === _routeId) {
            newRoutePlan = { ...routePlan, IsActive: e.target.checked }
          }

        })

        dispatch(updateRoute(newRoutePlan));
        dispatch(updateRouteAsync(newRoutePlan));
      }
    })
    // dispatch(updateRoute(newRoutePlan))
  }

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
      // addMarker([lon,lat])
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
          color: '#A349A4',
          width: 3
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
          src: arrowImg,
          color: '#A349A4',
          anchor: [0.75, 0.5],
          scale: 0.1,
          offset: [40, -15],
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

  const addMarker = (coordinates) => {
    let vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
    let vectorSource = vector.getSource();
    // adding new feature to specific coordinates
    coordinates.forEach(point => {
      var marker = new Feature(new Point(point));
      var zIndex = 1;
      marker.setStyle(new Style({
        image: new Icon(({
          anchor: [0.5, 36],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          opacity: 1,
          // size: [20,20],
          scale: 0.1,
          anchorOrigin: 'bottom-right',
          offset: [0, 0],
          src: markerImg,
          zIndex: zIndex,
        })),
        zIndex: zIndex
      }));
      vectorSource.addFeature(marker);
    })
  }

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
    addMarker(coordinates)
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
        <div className='RoutesTable__title'>
          <Typography variant='h3'>
            Patrol route Table
          </Typography>

          <div id='RoutesTable__AddButton' className="RoutesTable__button">
            <Button onClick={() => { removeLinePath(); navigate('/patrol-route') }} variant='contained'>Add Route</Button>
          </div>
        </div>

        <TableContainer>
          <Table stickyHeader className='RoutesTable__table'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50px', fontSize: '17px', fontWeight: 'bold' }}>Id</TableCell>
                <TableCell sx={{ width: '100px', fontSize: '17px', fontWeight: 'bold' }}>Route Name</TableCell>
                <TableCell sx={{ width: '100px', fontSize: '17px', fontWeight: 'bold' }}>Start time</TableCell>
                <TableCell sx={{ width: '100px', fontSize: '17px', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                {/* <TableCell>Security Level</TableCell> */}
                <TableCell sx={{ width: '100px', fontSize: '17px', fontWeight: 'bold' }}>Active Route</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                routes[0].RoutePlans.map((route, index) => {

                  return (
                    <TableRow className='RoutesTable__tableList' key={index} hover={true}>
                      <TableCell sx={{ width: '50px', fontSize: '17px' }}>{index + 1}.</TableCell>
                      <TableCell sx={{ cursor: 'pointer', width: '100px', fontSize: '17px' }} onClick={() => { handleShowRoute(route.Id); }} >{route.Name}</TableCell>
                      <TableCell sx={{ cursor: 'pointer', width: '100px', fontSize: '15px' }}>{route.StartAt}</TableCell>

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
                      <TableCell>
                        <Switch
                          id={`RoutesTable_switch_${index}`}
                          checked={route.IsActive}
                          onChange={(e) => { handleRouteActive(e, route.Id) }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
        <div className="RoutesTable__logWindow">
          <LogWindow />
        </div>


      </ThemeProvider>
    </div>
  )
}

export default RoutesTable