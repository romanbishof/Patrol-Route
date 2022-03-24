import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

export const getRoutesAsync = createAsyncThunk("routes/getRoutesAsync",
async () => {
    let res = await axios.get(`http://localhost:8000/routes`)
    let routes = res.data
    return routes
})

export const postRoutesAsync = createAsyncThunk('routes/postRoutesAsync',
async (newRoute) => {
    await axios.post(`http://localhost:8000/routes`, newRoute)
})

export const deleteRouteAsync = createAsyncThunk('routes/deleteRouteAsync',
async (routeName) => {
    await axios.delete(`http://localhost:8000/routes/${routeName}`)
})

const initialState = [
    {
        Jetty: "Apapa",
        LastUpdate: "12-05-2021 15:00",
        Home: {
            Latitude: 6.41096,
            Longitude: 3.39447
        },
        SecurityLevel: 2,
        IntervalInMinutes: 60,
        RoutePlans: []
    },
    {map: ''}
]


const patrolSlice = createSlice({
    name: "patrols",
    initialState: initialState,
    reducers: {
        setRoutePlans: (state, action) => {
            state[0].RoutePlans.push(action.payload)
            
        },
        setMapState: (state, action) => {
            state[1].map = action.payload
        },
        deleteRoute: (state, action) => {
            let routes = state[0].RoutePlans.filter( routePlan => routePlan.Name !== action.payload)
            console.log(routes);
            state[0].RoutePlans = routes
        },
    },
    // using the http protocols logic
    extraReducers: {
        [getRoutesAsync.pending]: (state, action) => {
            console.log('fetching data');
        },
        [getRoutesAsync.fulfilled]: (state, action) => {
            try {
                state[0] = action.payload
            } catch (error) {
                console.log(error);
            }
        },
        [postRoutesAsync.fulfilled]: (state, action) => {
            console.log('routes added');
        },
        [deleteRouteAsync.fulfilled]: (state, action) => {
            console.log('route deleted');
        }
    },
})

export const {setRoutePlans, setMapState, deleteRoute} = patrolSlice.actions;

export default patrolSlice.reducer;