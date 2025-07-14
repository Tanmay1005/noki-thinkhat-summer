import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import authReducer from "./slices/authSlice";
import speechReducer from "./slices/speechSlice";
import stationReducer from "./slices/stationsSlice";
import topbarReducer from "./slices/topbarSlice";

const store = configureStore({
	reducer: {
		app: appReducer,
		auth: authReducer,
		topbar: topbarReducer,
		speech: speechReducer,
		stations: stationReducer,
		// Add new reducers above this line
	},
});

export default store;
