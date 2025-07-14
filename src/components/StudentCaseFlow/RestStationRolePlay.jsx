import { CircularProgress, Grid, Typography } from "@mui/material";
import useSpeechToText from "hooks/useSpeechToText";
import { forwardRef, memo, useImperativeHandle, useState } from "react";
import MicIcon from "../../assets/Case_tabs_image/MicIcon.svg";

import SpeechTabs from "./SpeechComponents/SpeechTabs";

const RestStationRolePlay = forwardRef((_props, ref) => {
	const [loading, setLoading] = useState(false);
	const {
		isRecording,
		startRecording,
		stopRecording,
		pauseRecording,
		resumeRecording,
		liveTranscriptionRef,
	} = useSpeechToText();

	const handleStartRecording = async () => {
		try {
			setLoading(true);
			await startRecording();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
	const handleStopRecording = async () => {
		try {
			// transcript.current = transcription;
			await stopRecording();
		} catch (error) {
			console.error("Error stopping recording or generating score:", error);
		}
	};
	const handlePauseRecording = () => {
		pauseRecording();
	};

	const handleResumeRecording = async () => {
		resumeRecording();
	};
	useImperativeHandle(ref, () => ({
		handleStopRecording,
		handlePauseRecording,
		handleResumeRecording,
	}));
	// const handleSendMessage = (message, callback) => {
	//     console.log(message)
	//     window.alert(message)
	//     callback()
	// }
	return (
		<Grid
			container
			flexDirection="column"
			className="card-bg-admin-table h-100"
			sx={{ borderRadius: "18px" }}
		>
			{isRecording ? (
				<Grid
					item
					className="h-100 d-flex flex-column justify-content-between"
					sx={{ padding: "1rem 1.5rem 0 1.5rem" }}
				>
					<SpeechTabs
						speechType="Role Play"
						message={liveTranscriptionRef?.current}
					/>
				</Grid>
			) : (
				<Grid
					item
					className="d-flex justify-content-center align-items-center h-100 flex-column p-5"
				>
					<div
						className="col-12 d-flex justify-content-center align-items-center mb-2"
						style={{
							height: "70px",
							width: "70px",
							background:
								"linear-gradient(93.39deg, #E38DF1 -5.66%, #8C68C3 56.74%, #6754A7 96.84%)",
							borderRadius: "50%",
						}}
						onClick={handleStartRecording}
						onKeyUp={handleStartRecording}
						tabIndex={0}
						role="button"
						aria-label="Start Conversation"
					>
						{loading ? (
							<CircularProgress sx={{ color: "white" }} />
						) : (
							<img src={MicIcon} alt="Start Recording" />
						)}
					</div>
					<Typography>Start Conversation</Typography>
				</Grid>
			)}
		</Grid>
	);
});

export default memo(RestStationRolePlay);
