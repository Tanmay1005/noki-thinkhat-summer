// headerSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const topbarSlice = createSlice({
	name: "header",
	initialState: {
		username: "",
		profileComponent: null,
		className: "",
		notifications: [],
	},
	reducers: {
		setUsername: (state, action) => {
			state.username = action.payload;
		},
		setProfileComponent: (state, action) => {
			state.profileComponent = action.payload;
		},
		setClassName: (state, action) => {
			state.className = action.payload;
		},
		setNotificationData: (state, action) => {
			state.notifications = action.payload;
		},
		removeNotificationsById: (state, action) => {
			const idsToRemove = action.payload;
			state.notifications = state.notifications.filter(
				(n) => !idsToRemove.includes(n.id),
			);
		},
		markNotificationsAsReadById: (state, action) => {
			const idsToMark = action.payload;
			state.notifications = state.notifications.map((n) =>
				idsToMark.includes(n.id) ? { ...n, read: true } : n,
			);
		},
	},
});

export const {
	setUsername,
	setProfileComponent,
	setClassName,
	setNotificationData,
	removeNotificationsById,
	markNotificationsAsReadById,
} = topbarSlice.actions;

export default topbarSlice.reducer;
