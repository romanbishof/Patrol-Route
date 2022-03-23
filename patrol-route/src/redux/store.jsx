import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import patrolsReducer from "./patroslSlice";

export default configureStore({
    reducer: {
        patrols: patrolsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
})