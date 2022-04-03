import { Box, Button, Card, CardContent, CardHeader, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Slider, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import { v4 as uuidv4 } from 'uuid'
import { fromLonLat } from 'ol/proj'
import Overlay from 'ol/Overlay';
import {unByKey} from 'ol/Observable';
import moment from 'moment'

function SetRoute() {

    // const patrols = useSelector((state) => state.patrols)
    const [routeName, setRouteName] = useState('')
    const [routePoint, setRoutePoints] = useState([])
    const [date, setDate] = useState('')
    const [pointNumber, setPointNumber] = useState(1)
    const [interval, setInterval] = useState(10)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useRef();

    const [camera, setCamera] = useState('No Camera')
    const [xenon, setXenon] = useState('No Xenon')
    const [devices, setDevices] = useState([])
    const [coordinates, setCoordinates] = useState()
    const rawCamera = [
        'c968288d-5f85-40b7-8b38-5ae9a3fc5670',
        'd0fbdcd9-1886-4d78-8e14-f3b7a6eb57db',
        'c34129c4-fbcd-4644-b225-43f2be700224'
    ]
    const rawXenon = [
        '38242558-4403-4cf9-8d38-bf209880836f'
    ]

    const hendleSaveRoute = (e) => {
        e.preventDefault();

        // send route to service
        let newRoute = {
            Id: uuidv4(),
            Name: routeName,
            OrgId: 8,
            StartAt: date,
            CheckPoints: routePoint
        }

        dispatch(setRoutePlans(newRoute))
        dispatch(postRoutesAsync(newRoute))
        // remove the option to draw on the map
        
        // navigate to our home table page
        navigate('/')

    }

    const handleCameraChange = (e, Id) => {

        routePoint.forEach(point => {
            if (point.Id === Id) {

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

    const handleXenonChange = (e, Id) => {
        routePoint.forEach(point => {
            if (point.Id === Id) {

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

    const handleIntervalTime = (e) => {
        setInterval(e.target.value)
    }
    const handleSaveTemplate = () => {

        if (camera !== 'No Camera') {
            devices.push(camera)
        }

        if (xenon !== 'No Xenon') {
            devices.push(xenon)
        }

        let templatePoint = {
            Id: uuidv4(),
            Name: `Point No. ${pointNumber}`,
            Latitude: coordinates[1].toString(),
            Longitude: coordinates[0].toString(),
            WaitforSeconds: interval,
            Devices: devices
        }

        setRoutePoints(oldpoints => [...oldpoints, templatePoint])
        setCamera('No Camera');
        setXenon('No Xenon');
        setInterval(10)
        setDevices([])

        clearPopupOverLay()
        
    }

    const clearPopupOverLay = () => {
        const _overlays = window.map.getOverlays()
        _overlays.clear()
    }
    
    useEffect(() => {

        const overlay = new Overlay({
            element: popup.current,
            autoPan: true,
            id: 'popupMenu'
        })

        // get coordinates of the map by click
        let key = window.map.on("click", (e) => {

            overlay.setPosition(e.coordinate);
            window.map.addOverlay(overlay)
            setCoordinates(e.coordinate)
        })
        // unmounting component by key that the event returns --> unsubscribe
        return () => {
            unByKey(key)
        }

    }, [])


    return (

        <div className='setRoute'>
            <Box className='x'
                width={800}
                component='form'
                onSubmit={hendleSaveRoute}
                autoComplete='off'
            >
                <FormControlLabel label='Route Name' labelPlacement='top' control={<TextField required={true} id='RouteName' label placeholder='Enter Route name...' onChange={(e) => setRouteName(e.target.value)} />} />
                <FormControlLabel label='Choose starting Date' labelPlacement='top' control={<input type="datetime-local" required={true} onChange={(e) => { setDate(moment(e.target.value).format('DD-MM-YYYY HH:MM')) }} />} />

                <TableContainer >
                    <Table sx={{ maxWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Point Number</TableCell>
                                <TableCell>Laitude</TableCell>
                                <TableCell>Longitde</TableCell>
                                <TableCell>Interval time (sec)</TableCell>
                                <TableCell>Devices</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                routePoint.map((route, index) => {

                                    let _defaultCameraValue = !route.Devices.length ? 'No Camera' : route.Devices.filter(elem => rawCamera.includes(elem))
                                    let _defaultXenonValue = !route.Devices.length ? 'No Xenon' : route.Devices.filter(elem => rawXenon.includes(elem))
                                    return (
                                        <TableRow key={index} >
                                            <TableCell>{route.Name}</TableCell>
                                            <TableCell>{route.Latitude}</TableCell>
                                            <TableCell>{route.Longitude}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    required={true}
                                                    defaultValue={interval}
                                                    label='Seconds'
                                                    onChange={handleIntervalTime}
                                                />
                                            </TableCell>
                                            <TableCell width={220}>
                                                <Stack spacing={1} >
                                                    <FormControl fullWidth>
                                                        <InputLabel id='TableCameraLabelId'>Camera</InputLabel>
                                                        <Select
                                                            labelId='TableCameLabelId'
                                                            label='TableCamera'
                                                            defaultValue={_defaultCameraValue}
                                                            onChange={(e) => { handleCameraChange(e, route.Id) }}
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
                                                            onChange={(e) => { handleXenonChange(e, route.Id) }}
                                                        >
                                                            <MenuItem value='No Xenon'>No Xenon</MenuItem>
                                                            <MenuItem value='38242558-4403-4cf9-8d38-bf209880836f'>APA-XEN-001</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }

                        </TableBody>
                    </Table>

                </TableContainer>
                <Stack direction='row' spacing={3} >
                    <Button type='submit' variant='contained'>Save Route</Button>
                    <Button variant='contained' onClick={() => { navigate('/'); clearPopupOverLay(); }}>Back</Button>
                </Stack>

            </Box>
            <div ref={popup} id='popup'>

                <Paper elevation={6}
                    component='form'>

                    <CardHeader title='Choose Devices' />
                    <CardContent>
                        <Stack spacing={2} direction={'column'}>
                            <FormControl required={true} fullWidth>
                                <InputLabel id='CameraLabelId'>Camera</InputLabel>
                                <Select
                                    labelId='CameLabelId'
                                    label='Camera'
                                    value={camera}
                                    onChange={(e) => { setCamera(e.target.value) }}
                                >
                                    <MenuItem value='No Camera'>No Camera</MenuItem>
                                    <MenuItem value='c968288d-5f85-40b7-8b38-5ae9a3fc5670'>APA-MEO-001 46.3</MenuItem>
                                    <MenuItem value='d0fbdcd9-1886-4d78-8e14-f3b7a6eb57db'>APA-WT1-SEO 46.4</MenuItem>
                                    <MenuItem value='c34129c4-fbcd-4644-b225-43f2be700224'>APA-WT2-SEO 46.5</MenuItem>

                                </Select>
                            </FormControl>
                            <FormControl required={true} fullWidth>
                                <InputLabel id='XenonLabelId'>Xenon</InputLabel>
                                <Select
                                    labelId='XenonLabelId'
                                    label='Xenon'
                                    value={xenon}
                                    onChange={(e) => { setXenon(e.target.value) }}
                                >
                                    <MenuItem value='No Xenon'>No Xenon</MenuItem>
                                    <MenuItem value='38242558-4403-4cf9-8d38-bf209880836f'>APA-XEN-001</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                required={true}
                                value={interval}
                                label='Seconds'
                                onChange={handleIntervalTime}
                            />

                            <Button variant='contained' onClick={handleSaveTemplate}>Save / Close</Button>
                        </Stack>

                    </CardContent>
                </Paper>

            </div>
        </div>
    )
}

export default SetRoute