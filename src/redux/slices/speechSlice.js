import { createSlice } from "@reduxjs/toolkit";

export const speechSlice = createSlice({
	name: "speech",
	initialState: {
		isRecording: false,
		isPaused: false,
		isStopped: false,
		recordingTime: 0,
		transcription: [],
	},
	reducers: {
		setRecording: (state, action) => {
			state.isRecording = action.payload;
		},
		setPaused: (state, action) => {
			state.isPaused = action.payload;
		},
		setStopped: (state, action) => {
			state.isStopped = action.payload;
		},
		setRecordingTime: (state, action) => {
			state.recordingTime = action.payload;
		},
		addTranscription: (state, action) => {
			state.transcription.push(action.payload);
		},
		resetStates: (state) => {
			state.isRecording = false;
			state.isPaused = false;
			state.isStopped = true;
			state.recordingTime = 0;
			state.transcription = [];
		},
	},
});

export const {
	setRecording,
	setPaused,
	setStopped,
	setRecordingTime,
	addTranscription,
	resetStates,
} = speechSlice.actions;

export default speechSlice.reducer;
