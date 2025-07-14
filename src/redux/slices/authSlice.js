import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
	name: "auth",
	initialState: {
		isUserLoggedIn: false,
		userData: {},
		personData: {},
		isAdmin: false,
		userType: {},
	},
	reducers: {
		set_person_details: (state, action) => {
			state.personData = action.payload;
		},
		set_user_details: (state, action) => {
			state.userData = action.payload;
		},
		user_check_in: (state) => {
			state.isUserLoggedIn = true;
		},
		user_logout: (state) => {
			state.isUserLoggedIn = false;
			state.userData = {};
			state.personData = {};
		},
		set_is_admin: (state, action) => {
			state.isAdmin = action.payload;
		},
		set_user_type: (state, action) => {
			state.userType = action.payload;
		},

		reset_state: (state) => {
			state.isUserLoggedIn = false;
			state.userData = {};
			state.personData = {};
			state.isAdmin = false;
			state.userType = {};
		},
	},
});

export const {
	set_person_details,
	set_is_admin,
	set_user_type,
	set_user_details,
	user_check_in,
	user_logout,
	reset_state,
} = authSlice.actions;

export default authSlice.reducer;
