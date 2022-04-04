import { Box, Button, createTheme, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider } from '@mui/material'
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateRoute, updateRouteAsync } from '../../redux/patroslSlice';
import arrowImage from './arrow.png'

function EditRoute() {

    // const routes = useSelector((state) => state.patrols[0])
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const route = location.state.route
    

    const theme = createTheme({
        palette: {
          primary: {
            main: '#d85728',
          }
        }
      })

    const rawCamera = [
        'c968288d-5f85-40b7-8b38-5ae9a3fc5670',
        'd0fbdcd9-1886-4d78-8e14-f3b7a6eb57db',
        'c34129c4-fbcd-4644-b225-43f2be700224'
    ]
    const rawXenon = [
        '38242558-4403-4cf9-8d38-bf209880836f'
    ]

    const handleCameraChange = (e, id) => {
        route.CheckPoints.forEach(point => {
            if (point.Id === id) {
                if (e.target.value !== 'No Camera' && !point.Devices.includes(e.target.value)) {
                    let _obj = point.Devices.filter(elem => !rawCamera.includes(elem))
                    point.Devices = _obj
                    point.Devices.push(e.target.value)
                }

                if (e.target.value === 'No Camera') {
                    let _obj = point.Devices.filter(elem => !rawCamera.includes(elem))
                    point.Devices = _obj
                }
            }
        })
    }

    const handleXenonChange = (e, id) => {
        route.CheckPoints.forEach(point => {
            if (point.Id === id) {
                if (e.target.value !== 'No Xenon' && !point.Devices.includes(e.target.value)) {
                    point.Devices.push(e.target.value)
                }
                if (e.target.value === 'No Xenon') {
                    let obj = point.Devices.filter(elem => !rawXenon.includes(elem))
                    point.Devices = obj
                }
            }
        })
    }

    const handleWaitforSeconds = (e, id) => {
        let reg = /^[1-9]+[0-9]*$/

        route.CheckPoints.forEach(point => {
            if (point.Id === id && reg.test(e.target.value)) {
                point.WaitforSeconds = e.target.value
            }
        })
    }

    const handleSaveChange = () => {

        dispatch(updateRoute(route));
        dispatch(updateRouteAsync(route));
        removeRouteFromMap()
        navigate('/');

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

    const drawPolygonOnMap = (coordinates, routeName) => {
        let lineString = new LineString(coordinates)
        let feature = new Feature({
            geometry: lineString,
        })
        feature.Name = routeName
        let vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
        vector.setStyle(styleFunction(feature))
        let source = vector.getSource();
        source.addFeature(feature)
    }

    const removeRouteFromMap = () => {
        let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
        if (typeof _vector === 'undefined') {
            return;
        }
        let source = _vector.getSource();
        source.clear();
    }

    useEffect(() => {
        // let vector = route
        let coordinates = route.CheckPoints.map(point => {
            let coor = [parseFloat(point.Longitude), parseFloat(point.Latitude)]
            let coordinate = fromLonLat([coor[0], coor[1]], "EPSG:4326")
            return coordinate
        })

        drawPolygonOnMap(coordinates, route.Name)

    }, [])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <Box sx={{ padding: 5 }}
                    width={950}
                >

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Route Point</TableCell>
                                    <TableCell>Longitude</TableCell>
                                    <TableCell>Latitude</TableCell>
                                    <TableCell>Interval Time</TableCell>
                                    <TableCell>Devices</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {route.CheckPoints.map((rout) => {

                                    let _defaultCameraValue = !rout.Devices.length ? 'No Camera' : rout.Devices.filter(elem => rawCamera.includes(elem))
                                    let _defaultXenonValue = !rout.Devices.length ? 'No Xenon' : rout.Devices.filter(elem => rawXenon.includes(elem))

                                    return (
                                        <TableRow key={rout.Id}>
                                            <TableCell>{rout.Name}</TableCell>
                                            <TableCell>{rout.Latitude}</TableCell>
                                            <TableCell>{rout.Longitude}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    defaultValue={rout.WaitforSeconds}
                                                    label='Seconds'
                                                    onChange={(e) => { handleWaitforSeconds(e, rout.Id) }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={2}>
                                                    <FormControl fullWidth>
                                                        <InputLabel id='TableCameraLabelId'>Camera</InputLabel>
                                                        <Select
                                                            labelId='TableCameLabelId'
                                                            label='TableCamera'
                                                            defaultValue={_defaultCameraValue}
                                                            onChange={(e) => { handleCameraChange(e, rout.Id) }}
                                                        >
                                                            <MenuItem value='No Camera'>No Camera</MenuItem>
                                                            <MenuItem value='c968288d-5f85-40b7-8b38-5ae9a3fc5670'>APA-MEO-001 46.3</MenuItem>
                                                            <MenuItem value='d0fbdcd9-1886-4d78-8e14-f3b7a6eb57db'>APA-WT1-SEO 46.4</MenuItem>
                                                            <MenuItem value='c34129c4-fbcd-4644-b225-43f2be700224'>APA-WT2-SEO 46.5</MenuItem>

                                                        </Select>
                                                    </FormControl>
                                                    <FormControl fullWidth>
                                                        <InputLabel id='TableXenonLabelId'>Xenon</InputLabel>
                                                        <Select
                                                            labelId='TableXenonLabelId'
                                                            label='TableXenon'
                                                            defaultValue={_defaultXenonValue}
                                                            onChange={(e) => { handleXenonChange(e, rout.Id) }}
                                                        >
                                                            <MenuItem value='No Xenon'>No Xenon</MenuItem>
                                                            <MenuItem value='38242558-4403-4cf9-8d38-bf209880836f'>APA-XEN-001</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Stack direction='row' spacing={5}>
                        <Button variant='contained' onClick={handleSaveChange}>Save</Button>
                        <Button variant='contained' onClick={() => { navigate('/'); removeRouteFromMap() }}>Back/ Cancel</Button>
                    </Stack>
                </Box>
            </ThemeProvider>
        </div>
    )
}

export default EditRoute