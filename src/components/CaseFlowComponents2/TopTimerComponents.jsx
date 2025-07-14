// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
// import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { IconButton } from "@mui/material";
import {
	pauseVisualization,
	resumeVisualization,
} from "components/CaseFlowComponents/data";
import CollapsibleText from "components/ReusableComponents/CollapsibleText";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";

const TopTimerComponents = ({
	loading,
	caseDetails,
	// setMaxTime,
	maxTime,
	isRecording,
	isPaused,
	setPercentage,
	pauseRecording,
	resumeRecording,
	canvasRef,
	handleOnStopRecording,
	stopRecording,
	circuitName,
	stationData,
	check,
}) => {
	const navigate = useNavigate();
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const [currentTime, setCurrentTime] = useState(0);
	const [showDialog, setShowDialog] = useState(false);
	const [open, setOpen] = useState(false);
	const [endSession, setEndSession] = useState(false);
	const [navigateBack, setNavigateBack] = useState(false);
	const [autoEnd, setAutoEnd] = useState(false);
	const isPrivateCase = caseDetails && caseDetails?.visibility === "private";
	// const increaseMaxTime = () => {
	// 	setMaxTime((prevMaxTime) => prevMaxTime + 60);
	// 	setShowDialog(false);
	// };

	// const decreaseMaxTime = () => {
	// 	if (currentTime >= maxTime - 60) {
	// 		setOpen(true);
	// 		return;
	// 	}
	// 	setMaxTime((prevMaxTime) =>
	// 		prevMaxTime > 60 ? prevMaxTime - 60 : prevMaxTime,
	// 	);
	// };

	const timerRef = useRef(null);

	useEffect(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (isRecording && !isPaused) {
			if (!timerRef.current) {
				timerRef.current = setInterval(() => {
					setCurrentTime((prevTime) => {
						if (prevTime < maxTime) {
							if (maxTime - prevTime === 60 && !showDialog) {
								setShowDialog(true);
							}
							const newTime = prevTime + 1;
							const newPercentage = (newTime / maxTime) * 100;
							setPercentage(newPercentage);

							return newTime;
						}
						setAutoEnd(true);
						return prevTime;
					});
				}, 1000);
			}
		}
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isRecording, maxTime, isPaused]);

	useEffect(() => {
		if (autoEnd) {
			setShowDialog(false);
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			handleOnStopRecording();
		}
	}, [autoEnd]);

	const handleNavigation = () => {
		if (isRecording || check) {
			setNavigateBack(true);
		} else {
			navigate(-1);
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

	let DisplayText = circuitName
		? `${circuitName} - ${caseDetails?.name}`
		: caseDetails?.name;
	DisplayText += ` (${stationData?.type})`;
	return (
		<>
			<div className="d-flex justify-content-between align-items-center p-2">
				{!loading && (
					<div className="d-flex align-items-center gap-2">
						<UIModal
							open={navigateBack}
							handleClose={() => setNavigateBack(false)}
							width={400}
						>
							<div className="modal-content p-2">
								<div className="modal-body">
									<div className="d-flex flex-column justify-content-center align-items-center">
										<h6 style={{ fontWeight: "bold" }}>
											Are you sure you want to go back?
										</h6>
										<span style={{ textAlign: "center" }}>
											This action will no longer save the case, Do you really
											want to go back?
										</span>
									</div>
								</div>
								<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
									<UIButton
										text="cancel"
										onClick={() => setNavigateBack(false)}
										sx={{
											width: "100%",
											textTransform: "capitalize !important",
										}}
									/>

									<UIButton
										text="ok"
										variant="contained"
										onClick={async () => {
											await stopRecording();
											navigate(-1);
										}}
										sx={{
											width: "100%",
											textTransform: "capitalize !important",
										}}
									/>
								</div>
							</div>
						</UIModal>
						<img
							src={GoBackIcon}
							alt="Go Back"
							onClick={handleNavigation}
							onKeyUp={handleNavigation}
							style={{
								cursor: "pointer",
								height: "1.5rem",
								width: "1.5rem",
							}}
						/>
						<CollapsibleText
							className="d-none d-md-inline-block"
							value={DisplayText}
							type="tooltip"
							fontWeight={"bold"}
							fontSize="1rem"
						/>
					</div>
				)}
				<div className="d-flex align-items-center gap-2 ">
					<div
						className="d-flex align-items-center gap-2 "
						style={{
							borderRadius: "10px",
							backgroundColor: "#EAE7F466",
							padding: "5px",
							marginRight: "0.5rem",
						}}
					>
						<TimerOutlinedIcon sx={{ color: textColor }} />
						<span
							style={{
								fontSize: "16px",
								fontWeight: "bold",
								whiteSpace: "nowrap",
							}}
						>
							{TopBarTime(currentTime)} / {TopBarTime(maxTime)}
						</span>
						{/* {!isPrivateCase && (
							<RemoveCircleOutlineIcon
								sx={{
									color: textColor,
									cursor: "pointer",
								}}
								onClick={decreaseMaxTime}
							/>
						)}
						{!isPrivateCase && (
							<AddCircleOutlineIcon
								sx={{
									color: textColor,
									cursor: "pointer",
								}}
								onClick={increaseMaxTime}
							/>
						)} */}
						<UIModal
							open={showDialog}
							handleClose={() => setShowDialog(false)}
							width={400}
						>
							<div className="modal-content">
								<div className="d-flex justify-content-center align-items-center">
									{isPrivateCase
										? "⏳ Just 1 minute left! Wrap it up quickly!"
										: "⏳ Just 1 minute left! Wrap it up quickly!"}
								</div>
								<div className="modal-footer mt-2">
									<UIButton text="OK" onClick={() => setShowDialog(false)} />
								</div>
							</div>
						</UIModal>
						<UIModal open={open} handleClose={() => setOpen(false)} width={400}>
							<div className="modal-content">
								<div className="modal-body">
									Cannot decrease max time below the current time.
								</div>
								<div className="modal-footer mt-2">
									<UIButton text="OK" onClick={() => setOpen(false)} />
								</div>
							</div>
						</UIModal>
					</div>

					{isRecording && (
						<div className="d-flex align-items-center gap-2">
							<UIButton
								className="d-none d-md-inline-block rounded-pill"
								text={isPaused ? "Resume" : "Pause"}
								sx={{
									width: "max-content",
									textTransform: "capitalize",
								}}
								onClick={
									isPaused ? handleOnResumeRecording : handleOnPauseRecording
								}
							/>
							<IconButton
								className="d-md-none"
								onClick={
									isPaused ? handleOnResumeRecording : handleOnPauseRecording
								}
							>
								{isPaused ? (
									<PlayCircleOutlineIcon
										color="primary"
										style={{ fontSize: "30px" }}
									/>
								) : (
									<PauseCircleOutlineIcon
										color="primary"
										style={{ fontSize: "30px" }}
									/>
								)}
							</IconButton>

							<UIModal
								open={endSession}
								handleClose={() => setEndSession(false)}
								width={400}
							>
								<div className="modal-content p-2">
									<div className="modal-body">
										<div className="d-flex flex-column justify-content-center align-items-center">
											<h6 style={{ fontWeight: "bold" }}>
												Are you sure you want to end session?
											</h6>
											<span style={{ textAlign: "center" }}>
												Do you really want to end this session?
											</span>
										</div>
									</div>
									<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
										<UIButton
											text="Cancel"
											onClick={() => setEndSession(false)}
											sx={{
												width: "100%",
												textTransform: "capitalize",
											}}
										/>
										<UIButton
											text="OK"
											variant="contained"
											onClick={handleOnStopRecording}
											sx={{
												width: "100%",
												textTransform: "capitalize",
											}}
										/>
									</div>
								</div>
							</UIModal>

							<UIButton
								className="d-none d-md-inline-block rounded-pill"
								text="End Session"
								style={{
									color: "#B22234",
									borderColor: "#B22234",
									width: "max-content",
									textTransform: "capitalize",
								}}
								onClick={() => setEndSession(true)}
							/>
						</div>
					)}
				</div>
			</div>
			{/* mobile responsive */}

			<span
				className="d-block d-md-none mb-2"
				style={{
					fontSize: "16px",
					textTransform: "capitalize !important",
					fontWeight: 600,
				}}
			>
				{DisplayText}
			</span>
		</>
	);
};

export default TopTimerComponents;

export const TopBarTime = (time) => {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = time % 60;
	return hours > 0
		? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
		: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
