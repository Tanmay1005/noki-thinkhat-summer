import { createSlice } from "@reduxjs/toolkit";

const stationsSlice = createSlice({
	name: "stations",
	initialState: {
		stations: [],
		stationMap: {},
	},
	reducers: {
		set_station_details: (state, action) => {
			state.data = action.payload;
			state.stationMap = action.payload.reduce((acc, curr) => {
				acc[curr.id] = curr;
				return acc;
			}, {});
		},
	},
});

export const { set_station_details } = stationsSlice.actions;

export default stationsSlice.reducer;
