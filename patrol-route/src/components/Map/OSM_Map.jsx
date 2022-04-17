import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import React, { useEffect, useRef, useState } from 'react'
import { OSM, Vector as VectorSource } from 'ol/source'
import { get } from 'ol/proj';
import { defaults as defaultControls, MousePosition } from 'ol/control';
import './OSM_Map.css'
import { useSelector } from 'react-redux';
import { createStringXY } from 'ol/coordinate';


function OSM_Map() {

  const patrols = useSelector((state) => state.patrols)
  const raster = new TileLayer({
    source: new OSM({ url: process.env.REACT_APP_API_MAP }),
  })

  const source = new VectorSource({ wrapX: false });
  const vector = new VectorLayer({
    source: source,
  });

  vector.id = 'PolygonLayer'

  const mapElement = useRef();

  const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
  });

  useEffect(() => {
    // initialaiting map
    window.map = new Map({
      target: mapElement.current,
      layers: [raster, vector],
      view: new View({
        center: [patrols[0].Home.Longitude, patrols[0].Home.Latitude],
        zoom: 17,
        projection: 'EPSG:4326',
      }),
      controls: [mousePositionControl],
    });

  }, []);

  return (
    <div className='OSM_Map'>
      <div id='OSM' ref={mapElement} className="OSM_Map-container">
        {/* <div className="popup"></div> */}

      </div>
    </div>
  )
}

export default OSM_Map