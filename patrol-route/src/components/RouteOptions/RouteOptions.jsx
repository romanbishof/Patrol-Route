import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import './RouteOptions.css'

function RouteOptions() {

  const patrols = useSelector((state) => state.patrols)
  const [routes, setRoutes] = useState('false')
  console.log(patrols[0].RoutePlans);
  const handleAddRoute = () => {
    
  }

  if (patrols[0].RoutePlans === null) {
    console.log("no  route in the data");
    setRoutes(false)
  }


  return (
    <div className='routeOptions'>
        <div className="routeOptions__options">
            <h3>Routes</h3>
            <Link to='/patrol-route'>
              <button className='routeOptions__options-button' onClick={handleAddRoute}>Add Route</button>
            </Link>
            
            <button className='routeOptions__options-button'>Edit route</button>
            <button className='routeOptions__options-button'>Delete route</button>
        </div>
      <TableContainer>
        <Table sx={{maxWidth: 605}}>
        <TableHead>
            <TableRow>
                <TableCell>Route Name</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
          
        </TableBody>
        </Table>
      </TableContainer>


    </div>
  )
}

export default RouteOptions