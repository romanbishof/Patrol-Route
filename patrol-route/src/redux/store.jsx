import { configureStore } from "@reduxjs/toolkit";

import patrolsReducer from "./patroslSlice";

export default configureStore({
    reducer: {
        patrols: patrolsReducer,
    }
})