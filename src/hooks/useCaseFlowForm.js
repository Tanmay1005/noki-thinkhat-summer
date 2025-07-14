import { useDispatch } from "react-redux";
import {
	resetStates,
	setPaused,
	setRecording,
} from "../redux/slices/speechSlice";

const useNonSpeech = () => {
	const reduxDispatch = useDispatch();

	const handleOnStartDocumenting = () => {
		reduxDispatch(setRecording(true));
	};
	const handleOnStopDocumenting = () => {
		reduxDispatch(resetStates());
		reduxDispatch(setRecording(false));
	};
	const handleOnAbortDocumenting = () => {
		reduxDispatch(setRecording(false));
	};
	const handleOnPauseDocumenting = () => {
		reduxDispatch(setPaused(true));
	};
	const handleOnResumeDocumenting = () => {
		reduxDispatch(setPaused(false));
	};

	return {
		handleOnStartDocumenting,
		handleOnStopDocumenting,
		handleOnAbortDocumenting,
		handleOnPauseDocumenting,
		handleOnResumeDocumenting,
	};
};
export default useNonSpeech;
