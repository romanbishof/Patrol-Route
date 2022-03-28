import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Draw from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import {v4 as uuidv4} from 'uuid'
import { LineString } from 'ol/geom'
import { Feature } from 'ol'
import { fromLonLat } from 'ol/proj'

function SetRoute() {

    const patrols = useSelector((state) => state.patrols)
    const [routeName, setRouteName] = useState('')
    const [routePoint, setRoutePoints] = useState([])
    const [waitforSeconds, setWaitforSeconds] = useState('')
    // const [camera, setCamera] = useState(false)
    // const [xenon, setXenon] = useState(false)
    const [ date, setDate ] = useState('')
    const [pointNumber, setPointNumber] = useState(1)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const hendleSaveRoute = (e) => {
        e.preventDefault();
        // send route to service
        let newRoute = {
            Id: uuidv4(),
            Name:routeName,
            OrgId: '',
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
            if(point.Id === Id){
                point.Devices[0] = e.target.value
            }
        })
    }

    const handleXenonChange = (e, Id) => {
        routePoint.forEach(point => {
            if(point.Id === Id){
                point.Devices[1] = e.target.checked ? 'e47f1d52-b035-45dd-b35b-c55511d80f9f': ''
            }
        })
    }

    useEffect(()=>{
        // adding option to draw on the map
        // window.map.addInteraction(
        //     draw = new Draw({
        //         type: "LineString",
        //         source: new VectorSource(),
                
        //     })
        // )
        // window.map.addInteraction(draw)



        // get coordinates of the map by click
        window.map.on("click", (e) => {

            let template = {
                Id: uuidv4(),
                Name: `Point No. ${pointNumber}`,
                Latitude: e.coordinate[1].toString(),
                Longitude: e.coordinate[0].toString(),
                WaitforSeconds: waitforSeconds,
                Devices: []
            }
            
            // updating state of component
            setRoutePoints(oldpoints => [... oldpoints, template])
        })

    }, [])

  return (

    <div>
        <Box 
            component='form'
            onSubmit={hendleSaveRoute}
            autoComplete='off'
            >
            <FormControlLabel label='Route Name' labelPlacement='top' control={<TextField required={true} id='RouteName' label placeholder='Enter Route name...' onChange={(e) => setRouteName(e.target.value)}/>}/>
            <FormControlLabel label='Choose starting Date' labelPlacement='top' control={<input type="datetime-local" required={true} onChange={(e) => {setDate(e.target.value)}}/>}/>

            <h2>enter points</h2>
            <TableContainer >
                <Table sx={{maxWidth: 1250}}>
                    <TableHead>
                        <TableRow sx={{width: 900}}>
                            <TableCell>Point Number</TableCell>
                            <TableCell>Laitude</TableCell>
                            <TableCell>Longitde</TableCell>
                            <TableCell>Interval time</TableCell>
                            <TableCell>Devices</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        routePoint.map((route, index) => {
                            
                            return(
                                <TableRow key={index}>
                                    <TableCell>{route.Name}</TableCell>
                                    <TableCell>{route.Latitude}</TableCell>
                                    <TableCell>{route.Longitude}</TableCell>
                                    <TableCell>{route.WaitforSeconds}</TableCell>
                                    <TableCell>
                                        <FormControl fullWidth>
                                            <InputLabel id='CameraLabelId'>Camera</InputLabel>
                                            <Select
                                            labelId='CameLabelId'
                                            label='Camera'
                                            defaultValue=''
                                            onChange={(e) => {handleCameraChange(e, route.Id)}}
                                            >   
                                                <MenuItem value={''}><em>No Camera</em></MenuItem>
                                                <MenuItem value='b612164b-0313-4e83-95bc-fc2bfc10ea36'>Camera 1</MenuItem>
                                                <MenuItem value='9a51ffda-86ce-41be-9a5f-183260ec2106'>Camera 2</MenuItem>

                                            </Select>
                                        </FormControl>
                                        <FormControlLabel control={<Switch onChange={(e)=> {handleXenonChange(e, route.Id)}}/>} label="Xenon"/>
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
                <Button variant='contained' onClick={() => {navigate('/')}}>Back</Button>
            </Stack>
            
        </Box>
    </div>
  )
}

export default SetRoute