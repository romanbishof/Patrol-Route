import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateRoute, updateRouteAsync } from '../../redux/patroslSlice';

function EditRoute() {

    // const routes = useSelector((state) => state.patrols[0])
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const route = location.state.route

    const handleCameraChange = (e, id) => {
        route.CheckPoints.forEach(point => {
            if (point.Id === id) {
                if (e.target.value === 'No Camera') {
                    point.Devices[0] = ''
                } else {
                    point.Devices[0] = e.target.value
                }
            }
        })
    }

    const handleXenonChange = (e, id) => {
        route.forEach(point => {
            if (point.Id === id) {
                if (e.target.value === 'No Xenon') {
                    point.Devices[1] = ''
                } else {
                    point.Devices[1] = e.target.value
                }
            }
        })
    }

    const handleSaveChange = () => {

        dispatch(updateRoute(route));
        dispatch(updateRouteAsync(route));
        removeRouteFromMap()
        navigate('/');

    }

    const drawPolygonOnMap = (coordinates, routeName) => {
        let lineString = new LineString(coordinates)
        let feature = new Feature({
            geometry: lineString,
        })
        feature.Name = routeName
        let vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer');
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

                                return (
                                    <TableRow key={rout.Id}>
                                        <TableCell>{rout.Name}</TableCell>
                                        <TableCell>{rout.Latitude}</TableCell>
                                        <TableCell>{rout.Longitude}</TableCell>
                                        <TableCell>{rout.WaitforSeconds}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth>
                                                <InputLabel id='CameraLabelId'>Camera</InputLabel>
                                                <Select
                                                    labelId='CameLabelId'
                                                    label='Camera'
                                                    defaultValue=''
                                                    onChange={(e) => { handleCameraChange(e, rout.Id) }}
                                                >
                                                    <MenuItem value='No Camera'>No Camera</MenuItem>
                                                    <MenuItem value='c968288d-5f85-40b7-8b38-5ae9a3fc5670'>APA-MEO-001 46.3</MenuItem>
                                                    <MenuItem value='d0fbdcd9-1886-4d78-8e14-f3b7a6eb57db'>APA-WT1-SEO 46.4</MenuItem>
                                                    <MenuItem value='c34129c4-fbcd-4644-b225-43f2be700224'>APA-WT2-SEO 46.5</MenuItem>

                                                </Select>
                                            </FormControl>
                                            <FormControl fullWidth>
                                                <InputLabel id='XenonLabelId'>Xenon</InputLabel>
                                                <Select
                                                    labelId='XenonLabelId'
                                                    label='Xenon'
                                                    defaultValue=''
                                                    onChange={(e) => { handleXenonChange(e, route.Id) }}
                                                >
                                                    <MenuItem value='No Xenon'>No Xenon</MenuItem>
                                                    <MenuItem value='38242558-4403-4cf9-8d38-bf209880836f'>APA-XEN-001</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack direction='row' spacing={5}>
                    <Button variant='contained' onClick={handleSaveChange}>Save</Button>
                    <Button variant='contained' onClick={() => { navigate('/'); removeRouteFromMap() }}>Back/ Cancle</Button>
                </Stack>
            </Box>
        </div>
    )
}

export default EditRoute