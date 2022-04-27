import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import axios from "axios";

export const getDevicesAsync = createAsyncThunk(
  "routes/getDevicesAsynv",
  async () => {
    const componentsTypes = {
      componentTypes: [118, 117],
    };
    let res = await axios
      .post(process.env.REACT_APP_DEVICES_API, componentsTypes, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
    let components = res.data;
    return components;
  }
);

export const getHistoryLogAsync = createAsyncThunk(
  "routes/getHistoryLog",
  async () => {
    let res = await axios.get(process.env.REACT_APP_API_LOG_FILR);
    let data = res.data;
    let result = data.map((item) => JSON.parse(item));
    return result;
  }
);

export const getRoutesAsync = createAsyncThunk(
  "routes/getRoutesAsync",
  async () => {
    let routes;
    await axios
      .get(process.env.REACT_APP_API_JSON_FILE)
      .then((resp) => {
        routes = resp.data;
        return routes;
      })
      .catch((err) => {
        if (err.message === "Network Error") {
          alert("server is down");
        }
        return routes;
      });

    return routes;
  }
);

export const postRoutesAsync = createAsyncThunk(
  "routes/postRoutesAsync",
  async (newRoute) => {
    await axios.post(process.env.REACT_APP_API_JSON_FILE, newRoute);
  }
);

export const deleteRouteAsync = createAsyncThunk(
  "routes/deleteRouteAsync",
  async (routeId) => {
    await axios.delete(`${process.env.REACT_APP_API_JSON_FILE}/${routeId}`);
  }
);

export const updateRouteAsync = createAsyncThunk(
  "route/updateRouteAsync",
  async (updateRoute) => {
    await axios.put(process.env.REACT_APP_API_JSON_FILE, updateRoute);
  }
);
let data = JSON.parse(sessionStorage.getItem("route"));
console.log(data);
const initialState = [
  {
    // Jetty: "Apapa",
    // LastUpdate: "12-05-2021 15:00",
    // Home: {
    //     Latitude: 6.454467,
    //     Longitude: 3.37155
    // },
    // SecurityLevel: 2,
    // IntervalInMinutes: 60,
    // RoutePlans: []
  },
];

const patrolSlice = createSlice({
  name: "patrols",
  initialState: initialState,
  reducers: {
    setRoutePlans: (state, action) => {
      state[0].RoutePlans.push(action.payload);
    },
    deleteRoute: (state, action) => {
      let routes = state[0].RoutePlans.filter(
        (routePlan) => routePlan.Id !== action.payload
      );
      state[0].RoutePlans = routes;
    },
    updateRoute: (state, action) => {
      let index = state[0].RoutePlans.findIndex(
        (route) => route.Id === action.payload.Id
      );
      state[0].RoutePlans[index] = action.payload;
    },
  },
  // using the http protocols logic
  extraReducers: {
    [getRoutesAsync.pending]: (state, action) => {
      console.log("fetching data");
    },
    [getRoutesAsync.fulfilled]: (state, action) => {
      //   sessionStorage.setItem("route", JSON.stringify(state));
      try {
        state[0] = action.payload;
        // let obj = sessionStorage.getItem("route");
        // state[0] = JSON.parse(obj);
        sessionStorage.setItem("route", JSON.stringify(state));
      } catch (error) {
        console.log(error);
      }
    },
    [postRoutesAsync.pending]: (state, action) => {
      console.log("updating last update file time");
    },
    [postRoutesAsync.fulfilled]: (state, action) => {
      console.log("routes added");
    },
    [deleteRouteAsync.fulfilled]: (state, action) => {
      console.log("route deleted");
    },
    [updateRouteAsync.fulfilled]: (state, action) => {
      console.log("updated route");
    },
    [getDevicesAsync.fulfilled]: (state, action) => {
      let rawCamera = [];
      let rawXenon = [];
      action.payload.forEach((obj) => {
        if (
          obj.Component.ComponentName === "Surveillance EO" ||
          obj.Component.ComponentName === "Octopus GenericPTZEx"
        ) {
          obj.Devices.forEach((devicesObj) => {
            rawCamera.push({
              DeviceId: devicesObj.DeviceId,
              DeviceName: devicesObj.DeviceName,
            });
          });
          state.push({
            rawCamera: rawCamera,
          });
        }

        if (
          obj.Component.ComponentName === "Xenon" ||
          obj.Component.ComponentName === "Fransis SearchLight"
        ) {
          obj.Devices.forEach((devicesObj) => {
            rawXenon.push({
              DeviceId: devicesObj.DeviceId,
              DeviceName: devicesObj.DeviceName,
            });
          });
          state.push({
            rawXenon: rawXenon,
          });
        }
      });
    },
    [getHistoryLogAsync.fulfilled]: (state, action) => {
      // current(state).forEach(obj => {
      //     if ('historyLog' in obj) {
      //         state.
      //     }
      // })
      // state.push({
      //     historyLog: action.payload[action.payload.length - 1]
      // })
      console.log(action.payload);
    },
  },
});

export const { setRoutePlans, deleteRoute, updateRoute } = patrolSlice.actions;

export default patrolSlice.reducer;
