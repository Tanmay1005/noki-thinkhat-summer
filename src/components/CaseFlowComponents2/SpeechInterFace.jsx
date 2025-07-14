import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { CircularProgress } from "@mui/material";
import {
	pauseVisualization,
	resumeVisualization,
} from "components/CaseFlowComponents/data";
import { useSelector } from "react-redux";
import MicIcon from "../../assets/Case_tabs_image/MicIcon.svg";
import UICard from "../ReusableComponents/UICard";

const SpeechInterface = ({
	isPaused,
	canvasRef,
	isRecording,
	startRecording,
	liveTranscriptionRef,
	setCheck,
	pauseRecording,
	resumeRecording,
	openAlert,
	defaultText = "",
	webLoading,
	setWebLoading,
	source = "role-play",
}) => {
	const themeMode = useSelector((state) => state.app.theme);
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const handleOnStartRecording = async (event) => {
		if (openAlert) {
			setCheck(true);
		}

		const isTriggerEvent =
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter");

		if (isTriggerEvent) {
			try {
				await startRecording();
				setWebLoading(true);
			} catch (error) {
				console.error("Error starting recording:", error);
			}
		}
	};

	const handleOnPauseRecording = (event) => {
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			pauseRecording();
			pauseVisualization();
		}
	};

	const handleOnResumeRecording = async (event) => {
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			await resumeRecording();
			resumeVisualization(canvasRef.current);
		}
	};

	return (
		<div
			className="p-0 m-0"
			style={{ display: "flex", flexDirection: "column" }}
		>
			<div>
				{isRecording ? (
					<UICard
						customClasses="p-0 border-0"
						customBodyClasses="p-0"
						CardBody={
							<div
								style={{
									flex: "1 0 auto",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									flexDirection: "column",
									backgroundColor: CardColor2,
								}}
							>
								<div className="col-12 p-1 d-flex justify-content-center">
									<div className="canvas-container">
										<canvas id="myCanvas" ref={canvasRef} />
									</div>
								</div>

								<div className="col-12 d-flex justify-content-center align-items-center p-1">
									<div
										className="col-10 border d-flex justify-content-center align-items-center"
										style={{
											fontSize: "14px",
											height: "50px",
											margin: "auto",
											backgroundColor: themeMode === "dark" ? "grey" : "white",
											borderRadius: "10px",
											overflow: "auto",
										}}
									>
										<span>
											{defaultText ||
												(liveTranscriptionRef?.current
													? liveTranscriptionRef.current
													: isRecording && isPaused
														? "Recording has been paused."
														: isRecording
															? "Recording has been started"
															: null)}
										</span>
									</div>
									<div
										className="col-2 d-flex justify-content-center align-items-center mb-2"
										style={{
											height: "50px",
											width: "50px",
											background:
												"linear-gradient(93.39deg, #E38DF1 -5.66%, #8C68C3 56.74%, #6754A7 96.84%)",
											borderRadius: "50%",
											marginRight: "15px",
											cursor: "pointer",
										}}
										onClick={
											isPaused
												? handleOnResumeRecording
												: handleOnPauseRecording
										}
										onKeyUp={
											isPaused
												? handleOnResumeRecording
												: handleOnPauseRecording
										}
										title={
											isPaused ? "Resume Conversation" : "Pause Conversation"
										}
									>
										{isPaused ? (
											<PlayArrowIcon
												sx={{ color: "white", height: "75%", width: "75%" }}
											/>
										) : (
											<PauseIcon
												sx={{ color: "white", height: "75%", width: "75%" }}
											/>
										)}
									</div>
								</div>
							</div>
						}
					/>
				) : (
					<UICard
						customClasses="p-0 border-0"
						customBodyClasses="p-0"
						CardBody={
							<div
								className="col-12 d-flex flex-column justify-content-center align-items-center p-5"
								style={{ backgroundColor: CardColor2 }}
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
									onClick={handleOnStartRecording}
									onKeyUp={handleOnStartRecording}
									tabIndex={0}
									role="button"
									aria-label="Start Conversation"
								>
									{webLoading ? (
										<CircularProgress sx={{ color: "white" }} />
									) : (
										<img src={MicIcon} alt="Start Recording" />
									)}
								</div>
								<div>
									{webLoading && source === "virtual-patient"
										? "Connecting to Virtual Patient..."
										: "Start Conversation"}
								</div>
							</div>
						}
					/>
				)}
			</div>
		</div>
	);
};

export default SpeechInterface;
