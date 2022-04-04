import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import React, { useEffect, useRef, useState } from 'react'
import { OSM, Vector as VectorSource } from 'ol/source'
import {get} from 'ol/proj';
import './OSM_Map.css'
import { useDispatch, useSelector } from 'react-redux';



function OSM_Map() {
    
    const patrols = useSelector( (state) => state.patrols)
    const raster = new TileLayer({
      source: new OSM(),
    })

    const source = new VectorSource({wrapX: false});
    const vector = new VectorLayer({
      source: source,      
    });

    vector.id = 'PolygonLayer'
    
    const mapElement = useRef();
    const extent = get('EPSG:4326').getExtent().slice();
    extent[0] += extent[0];
    extent[2] += extent[2];

    useEffect(() => {
      // initialaiting map
      window.map = new Map({
        target: mapElement.current,
        layers: [raster, vector],
        view: new View({
          center: [patrols[0].Home.Longitude, patrols[0].Home.Latitude],
          zoom: 17,
          projection: 'EPSG:4326',          
          extent
        }),
      });

    }, []);
    
  return (
    <div className='OSM_Map'>
        <div ref={mapElement} className="OSM_Map-container">
          <div className="popup"></div>
        </div>
    </div>
  )
}

export default OSM_Map