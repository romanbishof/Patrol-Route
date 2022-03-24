import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Draw from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import {v4 as uuidv4} from 'uuid'

function SetRoute() {

    const patrols = useSelector((state) => state.patrols)
    const [routeName, setRouteName] = useState('')
    const [routePoint, setRoutePoints] = useState([])
    const [waitforSeconds, setWaitforSeconds] = useState('')
    const [camera, setCamera] = useState(false)
    const [xenon, setXenon] = useState(false)
    const [ date, setDate ] = useState('')
    const dispatch = useDispatch();

    const hendleSaveRoute = () => {
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
                Id: '',
                Name: '',
                Latitude: e.coordinate[1].toString(),
                Longitude: e.coordinate[0].toString(),
                WaitforSeconds: waitforSeconds,
                Devices: [
                    camera ? "b612164b-0313-4e83-95bc-fc2bfc10ea36": null,
                    xenon ? "e47f1d52-b035-45dd-b35b-c55511d80f9f" : null
                ]
            }
            let points = routePoint
            points.push(template)
            setRoutePoints(points)
        })

    }, [])

  return (

    <div>
        <p>Route
            <input type="text" required placeholder='Enter Route name...' onChange={(e) => setRouteName(e.target.value)}/>    
        </p>
        <label>choose starting date</label>
        <input type="datetime-local" required onChange={(e) => {setDate(e.target.value)}}/>
        <h2>enter points</h2>
        <TableContainer >
            <Table sx={{maxWidth: 650}}>
                <TableHead>
                    <TableRow>
                        <TableCell>Point Number</TableCell>
                        <TableCell>Laitude</TableCell>
                        <TableCell>Longitde</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {
                    routePoint.map((route, index) => {
                        
                        return(
                            <TableRow key={index}>
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{route.Latitude}</TableCell>
                                <TableCell>{route.Longitude}</TableCell>
                                <TableCell>{route.WaitforSeconds}</TableCell>
                                <TableCell>
                                    <div>
                                        <input type="checkbox" id="camera" checked={camera} onChange={(e)=> {setCamera(e.target.checked)}}/>
                                        <label >Camera</label>
                                        <br />
                                        <input type="checkbox" id="Xenon" checked={xenon}  onChange={(e)=> setXenon(e.target.checked)}/>
                                        <label >Xenon</label>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })
                }
                    
                </TableBody>
            </Table>
            
        </TableContainer>
        <Link to='/'>
            <button onClick={hendleSaveRoute} >save</button>
        </Link>
        
    </div>
  )
}

export default SetRoute