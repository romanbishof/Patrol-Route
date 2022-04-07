import { keys } from "@mui/system"
import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit"
import axios from "axios"

export const getDevicesAsync = createAsyncThunk('routes/getDevicesAsynv',
    async () => {
        const componentsTypes = {
            "componentTypes": [118, 117]
        }
        let res = await axios.post(`http://nnpcbe:89/IntegrationUI.svc/GetComponentDeviceStatuses`, componentsTypes, {
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                }
                console.log(error.config);
            })
        let components = res.data
        return components
    })

export const getRoutesAsync = createAsyncThunk("routes/getRoutesAsync",
    async () => {
        let res = await axios.get(`http://localhost:9090/routes`)
        let routes = res.data
        return routes
    })

export const postRoutesAsync = createAsyncThunk('routes/postRoutesAsync',
    async (newRoute) => {
        await axios.post(`http://localhost:9090/routes`, newRoute)
    })

export const deleteRouteAsync = createAsyncThunk('routes/deleteRouteAsync',
    async (routeId) => {
        await axios.delete(`http://localhost:9090/routes/${routeId}`)
    })

export const updateRouteAsync = createAsyncThunk('route/updateRouteAsync',
    async (updateRoute) => {
        await axios.put(`http://localhost:9090/routes`, updateRoute)
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
]


const patrolSlice = createSlice({
    name: "patrols",
    initialState: initialState,
    reducers: {
        setRoutePlans: (state, action) => {
            state[0].RoutePlans.push(action.payload)

        },
        deleteRoute: (state, action) => {
            let routes = state[0].RoutePlans.filter(routePlan => routePlan.Id !== action.payload)
            state[0].RoutePlans = routes
        },
        updateRoute: (state, action) => {
            let index = state[0].RoutePlans.findIndex(route => route.Id === action.payload.Id)
            state[0].RoutePlans[index] = action.payload
        }
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
        [postRoutesAsync.pending]: (state, action) => {
            console.log('updating last update file time');
        },
        [postRoutesAsync.fulfilled]: (state, action) => {
            console.log('routes added');
        },
        [deleteRouteAsync.fulfilled]: (state, action) => {
            console.log('route deleted');
        },
        [updateRouteAsync.fulfilled]: (state, action) => {
            console.log('updated route');
        },
        [getDevicesAsync.fulfilled]: (state, action) => {
            let rawCamera = []
            let rawXenon = []
            action.payload.forEach(obj => {
                if(obj.Component.ComponentName === 'Surveillance EO'){
                    obj.Devices.forEach(devicesObj => {

                        rawCamera.push({
                            DeviceId: devicesObj.DeviceId,
                            DeviceName: devicesObj.DeviceName
                        })
                    })
                    state.push({
                        rawCamera: rawCamera
                    })
                }

                if (obj.Component.ComponentName === 'Xenon') {
                    obj.Devices.forEach(devicesObj => {

                        rawXenon.push({
                            DeviceId: devicesObj.DeviceId,
                            DeviceName: devicesObj.DeviceName
                        })
                    })
                    state.push({
                        rawXenon: rawXenon
                    })
                }
            })
        }
    },
})

export const { setRoutePlans, deleteRoute, updateRoute } = patrolSlice.actions;

export default patrolSlice.reducer;