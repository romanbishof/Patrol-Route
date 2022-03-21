import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import React, { useEffect, useRef, useState } from 'react'
import { OSM, Vector as VectorSource } from 'ol/source'
import Draw from 'ol/interaction/Draw'
import './OSM_Map.css'
import { useDispatch, useSelector } from 'react-redux';
import { setMapState, setRoutePoint } from '../../redux/patroslSlice';



function OSM_Map() {
    const dispatch = useDispatch();
    const patrols = useSelector( (state) => state.patrols)
    
    const raster = new TileLayer({
      source: new OSM(),
    })

    const source = new VectorSource({wrapX: false});
    const vector = new VectorLayer({
      source: source,
    });
    
    const mapElement = useRef();

    useEffect(() => {
      // initialaiting map
      const initialMap = new Map({
        target: mapElement.current,
        layers: [raster, vector],
        view: new View({
          center: [patrols[0].Home.Longitude, patrols[0].Home.Latitude],
          zoom: 17,
          projection: 'EPSG:4326',
          
        }),

      });
        // initialMap.addInteraction(
        //   new Draw({
        //     type: 'Point',
        //     source: source
        //   })
        // )

        // getting coordinates by clicking the map
        // initialMap.on("click", (e) => {
        //   let template = {

        //     Id: '',
        //     Name: '',
        //     Latitude: e.coordinate[1].toString(),
        //     Longitude: e.coordinate[0].toString(),
        //     WaitforSeconds: 1000,
        //     Devices: []
        //   }

          // dispatch(setRoutePoint(template))
          
        // } )
        dispatch(setMapState(initialMap))

    }, []);
    
  return (
    <div className='OSM_Map'>
        <div ref={mapElement} className="OSM_Map-container">
          
        </div>
    </div>
  )
}

export default OSM_Map