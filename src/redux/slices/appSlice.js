import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
	name: "app",
	initialState: {
		theme: "light",
	},
	reducers: {
		toggleTheme: (state, _action) => {
			if (state.theme === "light") {
				state.theme = "dark";
			} else {
				state.theme = "light";
			}
		},
		setTheme: (_state, action) => action.payload,
	},
});

export const { toggleTheme, setTheme } = appSlice.actions;
export default appSlice.reducer;
