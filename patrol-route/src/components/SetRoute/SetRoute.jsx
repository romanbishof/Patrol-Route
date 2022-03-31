import { Box, Button, Card, CardContent, CardHeader, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Slider, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import { v4 as uuidv4 } from 'uuid'
import { fromLonLat } from 'ol/proj'
import Overlay from 'ol/Overlay';


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
        // window.map.removeInteraction(draw)

        // navigate to our home table page
        navigate('/')

    }

    const handleCameraChange = (e, Id) => {

        routePoint.forEach(point => {
            if (point.Id === Id) {
                if (e.target.value === 'No Camera') {
                    // point.Devices[0] = ''
                    console.log('user dident select camera');
                } else {
                    point.Devices[0] = e.target.value
                }

            }
        })
    }

    const handleXenonChange = (e, Id) => {
        routePoint.forEach(point => {
            if (point.Id === Id) {

                // if (e.target.value === 'No Xenon') {
                //     // point.Devices[1] = ''
                //     console.log('user dident select xenon');
                // } else if( point.lenght === 0){
                //     point.Devices.push(e.target.value)
                //     // point.Devices[1] = e.target.value
                //     console.log(point.Devices);
                // }else{
                //     const index = point.Devices.indexOf(e.target.value)
                //     console.log(index);
                //     if (index > -1) {
                //         console.log('thers is xenon need to remove it');
                //         point.Devices.splice(index,1)
                //     }else{
                //         console.log('');
                //     }
                // }
                // console.log(point.Devices.length);
                if (point.Devices.length > 0) {
                    console.log("there is some thing in array");
                    console.log(point.Devices.includes(e.target.value));
                }
                if (e.target.value !== 'No Xenon' && !point.Devices.includes(e.target.value)) {
                    point.Devices.push(e.target.value)
                }
                if (e.target.value === 'No Xenon') {
                    let obj = point.Devices.filter(elem => !rawXenon.includes(elem))
                    point.Devices=obj
                }
                console.log(point.Devices);

            }
        })
    }

    const handleIntervalTime = (e) => {
        console.log(e.target.value);
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
        setDevices([])

        clearPopupOverLay()
        // const _overlays = window.map.getOverlays()
        // // _overlays.forEach((item)=> console.log(item))
        // _overlays.removeAt(0)
    }

    const clearPopupOverLay = () => {
        const _overlays = window.map.getOverlays()
        _overlays.removeAt(0)
    }

    const handleCamera = (e) => {
        // if (e.target.value === 'No Camera') {
        //     console.log('user dident choose camera');
        // } else {
        //     setCamera(e.target.value)
        // }
        let newDevice = devices
        if (devices.length !== 0 && devices.includes(e.target.value)) {
            const index = newDevice.indexOf(e.target.value)
            if (index > -1) {
                newDevice.splice(index, 1, e.target.value)
                setDevices(newDevice)
                console.log(devices);
            }
        } else {
            setCamera(e.target.value)
            setDevices(item => [...item, camera])
        }


    }

    const handleXenon = (e) => {
        if (e.target.value === 'No Xenon') {
            console.log('user dident choose xenon');
        } else {
            setXenon(e.target.value)
            console.log(xenon);
        }



    }

    useEffect(() => {
        // adding option to draw on the map
        // window.map.addInteraction(
        //     draw = new Draw({
        //         type: "LineString",
        //         source: new VectorSource(),

        //     })
        // )
        // window.map.addInteraction(draw)

        const overlay = new Overlay({
            element: popup.current,
            autoPan: true,
            id: 'popupMenu'
        })
        // get coordinates of the map by click
        window.map.on("click", (e) => {

            overlay.setPosition(e.coordinate);
            window.map.addOverlay(overlay)
            setCoordinates(e.coordinate)
            // let template = {
            //     Id: uuidv4(),
            //     Name: `Point No. ${pointNumber}`,
            //     Latitude: e.coordinate[1].toString(),
            //     Longitude: e.coordinate[0].toString(),
            //     WaitforSeconds: interval,
            //     Devices: []
            // }
            // // updating state of component
            // setRoutePoints(oldpoints => [...oldpoints, template])
        })

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
                <FormControlLabel label='Choose starting Date' labelPlacement='top' control={<input type="datetime-local" required={true} onChange={(e) => { setDate(e.target.value) }} />} />

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