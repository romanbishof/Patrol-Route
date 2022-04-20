import React from 'react'
import './LogWindow.css'
import { Typography } from '@mui/material'


function LogWindow({ log }) {
  
  return (
    <div className='logWindow'>


      { 
        log === null ? ''
        
        : 

        log.Messages.map((msg, index) => {

          return (
            <div className='logWindow__msg' key={index}>
              <Typography variant='p'>{msg}</Typography>
            </div>
          )
        })
      }

    </div>
  )
}

export default LogWindow