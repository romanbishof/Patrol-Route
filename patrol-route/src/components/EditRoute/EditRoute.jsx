import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

function EditRoute() {

    const route = useSelector((state) => state.patrols)

  return (
    <div>
        <h2>edit route component</h2>
        
        <Link to='/'>
            <button>save / back</button>
        </Link>
    </div>
  )
}

export default EditRoute