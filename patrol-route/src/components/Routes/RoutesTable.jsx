import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { deleteRoute, deleteRouteAsync, getRoutesAsync } from '../../redux/patroslSlice'

function RoutesTable() {
  const routes = useSelector((state) => state.patrols)
  const [watchRoute, setWatchRoute] = useState(false)
  const [ routePlan , setRoutePlan ] = useState('')

  const map = routes[1]
  const dispatch = useDispatch();
  useEffect(async() => {
    dispatch(getRoutesAsync())
  },[dispatch])

  const handleDelete = (id) => {
    console.log(id);
    
    dispatch(deleteRoute(id));
    dispatch(deleteRouteAsync(id))
  }

  const handleEditRoute = (id) =>{
    // getting specific route plan by id
    let data = routes[0].RoutePlans.filter(routePlan => routePlan.Id === id)
    console.log(data);
    
    
  }

  const handleShowRoute = (id) => {
    setWatchRoute(!watchRoute)
    let route = routes[0].RoutePlans.filter(routePlan => routePlan.Id === id)
    
    setRoutePlan(route[0])
  }

  // useEffect(() => {
    
  // },[])
  
  return (
    watchRoute ? 
    <div>
      <h3>Route {routePlan.Id}</h3>
        <TableContainer>
          <Table>
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
                // console.log(routePlan)
                routePlan.CheckPoints.map((routePoint, index) => {
                  return(
                    <TableRow key={index}>
                      <TableCell>{index}</TableCell>
                      <TableCell>{routePoint.Latitude}</TableCell>
                      <TableCell>{routePoint.Longitude}</TableCell>
                      <TableCell>{routePoint.WaitforSeconds}</TableCell>
                      <TableCell>
                        <button>delete</button>
                      </TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
      <button onClick={() => setWatchRoute(!watchRoute)}> back</button>
    </div>
      :
    <div className='RoutesTable'>

        <TableContainer>
        <Table sx={{maxWidth: 605}}>
        <TableHead>
            <TableCell>Routes</TableCell>
            <TableRow>
                <TableCell>Route number</TableCell>
                <TableCell>Route Name</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
          {routes[0].RoutePlans.map((route, index) => {

            return(
              <TableRow key={index}>
                <TableCell>{index+1}</TableCell>
                <TableCell onClick={() => handleShowRoute(route.Id)} >{route.Id}</TableCell>
                <button onClick={() => {handleEditRoute(route.Id)}}>Edit Route</button>
                <button onClick={() => {handleDelete(route.Id)}}>Delete Route</button>
              </TableRow>
            )


          })}
        </TableBody>
        </Table>
      </TableContainer>
        <div className="RoutesTable__options">
            <Link to='/patrol-route'>
              <button>Add Route</button>
            </Link>
            
        </div>

    </div>
  )
}

export default RoutesTable