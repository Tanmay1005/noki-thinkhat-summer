import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { Box, IconButton } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import OldCarts from "components/TestConfiguration/HandleCase/common/OldCarts";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
	display: "flex",
	flexDirection: "column",
	// height: "90vh",
};

const Actions = ({
	handleResumeRecording,
	handlePauseRecording,
	handleStopRecording,
}) => {
	const { isRecording, isPaused } = useSelector((state) => state.speech);
	const [endSessionAlert, setEndSessionAlert] = useState(false);
	const { getValues, setValue } = useFormContext();
	const currentStationId = getValues("currentStationId");
	const { stationMap } = useSelector((state) => state.stations);
	const formTypeStations = [
		FOCUSED_PHYSICAL_EXAMINATION,
		FOCUSED_HISTORY,
		DIAGNOSTIC_TESTS,
		ASSESSMENT_PLAN,
		SOAP_NOTE,
	];
	const currentStationName = stationMap?.[currentStationId]?.type || "";
	const handleEndSession = async () => {
		setEndSessionAlert(false);
		if (formTypeStations.includes(currentStationName)) {
			await handleStopRecording(false, currentStationName);
			return;
		}
		await handleStopRecording(true);
	};
	return (
		<>
			<UIModal
				open={endSessionAlert}
				handleClose={() => {
					setEndSessionAlert(false);
					setValue("isCaseEditable", !isPaused);
				}}
				style={{
					...modalStyle,
					height: currentStationName === FOCUSED_HISTORY ? "90vh" : "auto",
				}}
				width={currentStationName === FOCUSED_HISTORY ? 800 : 400}
			>
				<div className="modal-content p-2 d-flex flex-column h-100 overflow-hidden">
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
					{currentStationName === FOCUSED_HISTORY && (
						<div className="flex-1 h-100 overflow-auto p-2">
							<OldCarts
								title="Quick Review - OLDCARTS"
								formFieldName="student"
							/>
						</div>
					)}
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="Cancel"
							onClick={() => {
								setEndSessionAlert(false);
								setValue("isCaseEditable", !isPaused);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize",
							}}
						/>
						<UIButton
							text="OK"
							variant="contained"
							onClick={handleEndSession}
							sx={{
								width: "100%",
								textTransform: "capitalize",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<Box className="d-flex">
				{isRecording && (
					<div className="d-flex align-items-center gap-2">
						<UIButton
							className="d-none d-md-inline-block rounded-pill"
							text={isPaused ? "Resume" : "Pause"}
							sx={{
								width: "max-content",
								textTransform: "capitalize",
							}}
							onClick={isPaused ? handleResumeRecording : handlePauseRecording}
						/>
						<IconButton
							className="d-md-none"
							onClick={isPaused ? handleResumeRecording : handlePauseRecording}
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
						<UIButton
							className="d-none d-md-inline-block rounded-pill"
							text="End Session"
							style={{
								color: "#B22234",
								borderColor: "#B22234",
								width: "max-content",
								textTransform: "capitalize",
							}}
							onClick={() => {
								setEndSessionAlert(true);
								setValue("isCaseEditable", false);
							}}
						/>
					</div>
				)}
			</Box>
		</>
	);
};

export default Actions;
