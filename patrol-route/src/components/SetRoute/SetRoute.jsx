import { Box, Button, Card, CardContent, CardHeader, createTheme, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Popover, Select, Slider, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import { v4 as uuidv4 } from 'uuid'
import Overlay from 'ol/Overlay';
import { unByKey } from 'ol/Observable';
import moment from 'moment'
import { Vector } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import Stroke from 'ol/style/Stroke'
import { fromLonLat } from 'ol/proj'
import markerImg from './marker.png'

function SetRoute() {

    // const patrols = useSelector((state) => state.patrols)
    const [routeName, setRouteName] = useState('')
    const [routePoint, setRoutePoints] = useState([])
    const [date, setDate] = useState('')
    const [pointNumber, setPointNumber] = useState(1)
    const [interval, setInterval] = useState(10)
    const [errorInterval, setErrorInterval] = useState(false)
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const submit = open ? 'simple-popover' : undefined

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const popup = useRef();
    const theme = createTheme({
        palette: {
            primary: {
                main: '#d85728',
            }
        }
    })

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

    // const intervalError = reg.test(interval)

    const hendleSaveRoute = (e) => {
        e.preventDefault();

        setAnchorEl(e.target.querySelector('button:first-of-type'))
        if (routePoint.length >= 1) {


            // send route to service
            let newRoute = {
                Id: uuidv4(),
                Name: routeName,
                OrgId: 8,
                StartAt: date,
                CheckPoints: routePoint
            }
            setPointNumber(1)

            dispatch(setRoutePlans(newRoute))
            dispatch(postRoutesAsync(newRoute))
            // remove the option to draw on the map

            // navigate to our home table page
            navigate('/')
        } else {
            setOpen(true)
            setTimeout(() => {
                setOpen(false)
            }, 1900);
        }
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
        let reg = /^[1-9]+[0-9]*$/

        // valiation to enter only numbers
        if (reg.test(e.target.value)) {
            setErrorInterval(!errorInterval)
            setInterval(e.target.value)
        }
        else {
            setErrorInterval(!errorInterval)
        }



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
        setPointNumber(pointNumber + 1)

        clearPopupOverLay()

    }

    const clearPopupOverLay = () => {
        const _overlay = window.map.getOverlayById('popupMenu')
        window.map.removeOverlay(_overlay)
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


    useEffect(() => {

        let elem = document.createElement('img');
        elem.src = markerImg
        elem.style.maxHeight = '50px'
        elem.style.maxWidth = '50px'
        elem.id = pointNumber


        let markerOverlay = new Overlay({
            element: elem,
            positioning: 'bottom-center',
            id: 'markerOverlay',
            offset: [-1.33, 5],
            stopEvent: false
        })

        let key = window.map.on('click', (e) => {

            let _vector = window.map.getAllLayers().find(i => i.id === 'PolygonLayer')
            // let source = _vector.getSource();

            markerOverlay.setPosition(e.coordinate)
            window.map.addOverlay(markerOverlay)

        })

        return () => {
            const _overlay = window.map.getOverlayById('markerOverlay')
            window.map.removeOverlay(_overlay)
            unByKey(key)
        }

    }, [])


    return (
        <ThemeProvider theme={theme}>
            <div className='setRoute'>

                <Box
                    component='form'
                    onSubmit={hendleSaveRoute}
                    autoComplete='off'
                    sx={{

                        overflow: 'hidden',
                        padding: 5,
                        width: '100%'
                    }}
                >
                    <FormControlLabel label='Route Name' labelPlacement='top' control={<TextField required={true} id='RouteName' placeholder='Enter Route name...' onChange={(e) => setRouteName(e.target.value)} />} />
                    <FormControlLabel label='Choose starting Date' labelPlacement='top' control={<input type="datetime-local" required={true} onChange={(e) => { setDate(moment(e.target.value).format('DD-MM-YYYY HH:MM')) }} />} />

                    <TableContainer >
                        <Table size='medium' sx={{ maxWidth: 750, padding: 5, fontSize: 15 }}>
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

                                        let _defaultCameraValue = !route.Devices.some(elem => rawCamera.includes(elem)) ? 'No Camera' : route.Devices.filter(elem => rawCamera.includes(elem))
                                        let _defaultXenonValue = !route.Devices.some(elem => rawXenon.includes(elem)) ? 'No Xenon' : route.Devices.filter(elem => rawXenon.includes(elem))

                                        return (
                                            <TableRow key={index} >
                                                <TableCell>{route.Name}</TableCell>
                                                <TableCell>{route.Latitude}</TableCell>
                                                <TableCell>{route.Longitude}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        required={true}
                                                        defaultValue={route.WaitforSeconds}
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
                        <Button aria-describedby={submit} type='submit' variant='contained'>Save Route</Button>
                        <Popover
                            id={submit}
                            open={open}
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                        >
                            <Typography sx={{ p: 2 }}>Please select at least one point</Typography>
                        </Popover>
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
                                    size='small'
                                    value={interval}
                                    label='Seconds'
                                    onChange={handleIntervalTime}
                                    helperText='Enter only Numbers'
                                />
                                <Button variant='contained' onClick={handleSaveTemplate}>Save / Close</Button>
                            </Stack>

                        </CardContent>
                    </Paper>

                </div>

            </div>
        </ThemeProvider>
    )
}

export default SetRoute