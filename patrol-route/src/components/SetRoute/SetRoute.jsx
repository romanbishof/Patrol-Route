import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Draw from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import { postRoutesAsync, setRoutePlans } from '../../redux/patroslSlice'
import { singleClick } from 'ol/events/condition'


function SetRoute() {

    const patrols = useSelector((state) => state.patrols)
    const [routeName, setRouteName] = useState('')
    const [routePoint, setRoutePoints] = useState([])
    const [waitforSeconds, setWaitforSeconds] = useState('')
    const dispatch = useDispatch();
    let map = patrols[1].map
    let draw

    const hendleSaveRoute = () => {
        // send route to service
        let newRoute = {
            Id: routeName,
            OrgId: '',
            StartAt: '',
            CheckPoints: routePoint
        } 
        
        dispatch(setRoutePlans(newRoute))
        dispatch(postRoutesAsync(newRoute))

        // remove the option to draw on the map
        map.removeInteraction(draw)
        
    }

    useEffect(()=>{
        // adding option to draw on the map
        map.addInteraction(
            draw = new Draw({
                type: "LineString",
                source: new VectorSource(),
            })
        )

        // get coordinates of the map by click
        map.on("click", (e) => {
            let template = {
                Id: '',
                Name: '',
                Latitude: e.coordinate[1].toString(),
                Longitude: e.coordinate[0].toString(),
                WaitforSeconds: waitforSeconds,
                Devices: []
            }
            console.log(e.target);
            let points = routePoint
            points.push(template)
            setRoutePoints(points)
        })

    }, [])

  return (

    <div>
        <p>Route
            <input type="text" placeholder='Enter Route name...' onChange={(e) => setRouteName(e.target.value)}/>    
        </p>
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
                        console.log(route);
                        return(
                            <TableRow key={index}>
                                <TableCell>{index}</TableCell>
                                <TableCell>{route.Latitude}</TableCell>
                                <TableCell>{route.Longitude}</TableCell>
                                <TableCell>{route.WaitforSeconds}</TableCell>
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