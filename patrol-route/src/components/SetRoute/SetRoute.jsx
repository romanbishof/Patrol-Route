import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Slider, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import { v4 as uuidv4 } from 'uuid'
import { fromLonLat } from 'ol/proj'
import { Overlay } from 'ol'


function SetRoute() {

    // const patrols = useSelector((state) => state.patrols)
    const [routeName, setRouteName] = useState('')
    const [routePoint, setRoutePoints] = useState([])
    const [waitforSeconds, setWaitforSeconds] = useState('')
    const [date, setDate] = useState('')
    const [pointNumber, setPointNumber] = useState(1)
    const [interval, setInterval] = useState(10)
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
                    point.Devices[0] = ''
                } else {
                    point.Devices[0] = e.target.value
                }

            }
        })
    }

    const handleXenonChange = (e, Id) => {
        routePoint.forEach(point => {
            if (point.Id === Id) {
                if (e.target.value === 'No Xenon') {
                    point.Devices[1] = ''
                } else {
                    point.Devices[1] = e.target.value
                }
            }
        })
    }

    const handleIntervalTime = (e) => {
        console.log(e.target.value);
        setInterval(e.target.value)
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


        // get coordinates of the map by click
        window.map.on("singleclick", (e) => {
  
            let template = {
                Id: uuidv4(),
                Name: `Point No. ${pointNumber}`,
                Latitude: e.coordinate[1].toString(),
                Longitude: e.coordinate[0].toString(),
                WaitforSeconds: interval,
                Devices: []
            }
            // updating state of component
            setRoutePoints(oldpoints => [...oldpoints, template])
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
                                                    <FormControl required={true} fullWidth>
                                                        <InputLabel id='CameraLabelId'>Camera</InputLabel>
                                                        <Select
                                                            labelId='CameLabelId'
                                                            label='Camera'
                                                            defaultValue=''
                                                            onChange={(e) => { handleCameraChange(e, route.Id) }}
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
                                                            defaultValue=''
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
                    <Button variant='contained' onClick={() => { navigate('/') }}>Back</Button>
                </Stack>

            </Box>
            <div id='popup'></div>
        </div>
    )
}

export default SetRoute