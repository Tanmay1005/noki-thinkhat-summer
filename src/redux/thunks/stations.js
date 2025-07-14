import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET_STATIONS_LIST } from "adapters/noki_ed.service";
import { set_station_details } from "../slices/stationsSlice";

export const getStations = createAsyncThunk(
	"fetch/stations",
	async (_, { dispatch }) => {
		try {
			const response = await GET_STATIONS_LIST();
			dispatch(set_station_details(response?.data?.stations));
		} catch (error) {
			console.error("Some issue in Firebase signout", error);
			throw error;
		}
	},
);
