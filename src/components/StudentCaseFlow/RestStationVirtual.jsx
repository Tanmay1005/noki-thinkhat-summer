import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Avatar, CircularProgress, Grid, Typography } from "@mui/material";
import FemaleAvatar from "assets/virtual_patient_avatars/female avatar.webp";
import MaleAvatar from "assets/virtual_patient_avatars/male avatar.webp";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import getSvgFileInfo from "helpers/PESVGHelper";
import { calculateAge } from "helpers/common_helper";
import { FOCUSED_PHYSICAL_EXAMINATION } from "helpers/constants";
import useConversation from "hooks/ConversationHook";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import MicIcon from "../../assets/Case_tabs_image/MicIcon.svg";
import SpeechTabs from "./SpeechComponents/SpeechTabs";
const avatars = {
	male: MaleAvatar,
	female: FemaleAvatar,
	other: FemaleAvatar,
};
const RestStationVirtual = forwardRef((_props, ref) => {
	const { stationMap } = useSelector((state) => state.stations);
	const [_loading, setLoading] = useState(false);
	const [isSessionTimeout, setIsSessionTimeout] = useState(false);
	const [microPhoneAlert, setMicroPhoneAlert] = useState(false);
	const { isRecording } = useSelector((state) => state.speech);
	const { getValues } = useFormContext();
	const navigate = useNavigate();
	const {
		gender,
		dob,
		appearance,
		description,
		specialization,
		ehrData,
		currentStationId,
		questionnaireId,
		additional_prompt,
		id,
		scenario,
		stations,
	} = getValues();
	const age = calculateAge(dob);
	const stationType = stationMap?.[currentStationId]?.type;
	const handleWebsocketClose = () => {
		if (!isSessionTimeout) {
			setIsSessionTimeout(true);
		}
	};
	const showMicPermissionPopup = () => {
		setMicroPhoneAlert(true);
	};
	const imageName = getSvgFileInfo(age, appearance, gender, true);
	const imageSrc = imageName
		? `${process.env.REACT_APP_GCS_PUBLIC_BUCKET_URL}/avatars/${imageName}`
		: avatars?.[gender];
	const peAdditionalPrompt = stations?.[
		currentStationId
	]?.expertApproach?.PETests?.map((item) => item?.AI_Prompt || "")?.join(",");
	const virtualPatientDetails = {
		description,
		specialization,
		gender,
		birthDate: dob,
		ehr: ehrData?.Current_Encounter_EHR,
		scenario,
		id,
		fhir_questionnaire_id: questionnaireId,
		additionalPrompt: additional_prompt,
		stationDetail: { type: stationType },
		...(stationType === FOCUSED_PHYSICAL_EXAMINATION && {
			physicalExaminationPrompts: peAdditionalPrompt,
		}),
	};
	const {
		startConversation,
		stopConversation,
		currentMessage,
		pauseConversation,
		resumeConversation,
		isConnecting,
	} = useConversation({
		linkCode: uuidv4(),
		virtualPatientDetails,
		handleWebsocketClose,
		showMicPermissionPopup,
	});

	const handleStartRecording = async () => {
		try {
			setLoading(true);
			await startConversation();
		} catch (error) {
			toast.error("Error starting case");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
	// const handleSendMessage = (message, callback) => {
	// 	window.alert(message);
	// 	callback();
	// };
	const handleStopRecording = async () => {
		try {
			await stopConversation();
		} catch (error) {
			console.error("Error stopping recording or generating score:", error);
		}
	};
	const handlePauseRecording = () => {
		pauseConversation();
	};
	const handleResumeRecording = async () => {
		resumeConversation();
	};

	useImperativeHandle(ref, () => ({
		handleStopRecording,
		handlePauseRecording,
		handleResumeRecording,
	}));
	const handleCancelAndRetake = async () => {
		await handleStopRecording();
		navigate(0);
	};
	return (
		<>
			<UIModal open={microPhoneAlert} displayCloseIcon={false} width={400}>
				<div className="d-flex justify-content-center align-items-center p-2">
					<ErrorOutlineIcon style={{ color: "orange", marginRight: "10px" }} />
					Please switch on the Microphone in your browser to start recording.
				</div>
				<div className="d-flex justify-content-end">
					<UIButton text="ok" onClick={() => setMicroPhoneAlert(false)} />
				</div>
			</UIModal>
			<UIModal open={isSessionTimeout} displayCloseIcon={false} width={400}>
				<div className="d-flex justify-content-center align-items-center p-2 fs-5">
					<ErrorOutlineIcon
						style={{ color: "orange", marginRight: "10px", fontSize: "1.8rem" }}
					/>
					Session Timeout!
				</div>
				<div className="text-center">
					Transcription has been saved. Do you still want to generate report.
				</div>
				<div className="d-flex justify-content-between pt-3 gap-3">
					<UIButton
						className="flex-grow-1 rounded rounded-pill"
						text="Cancel and Retake"
						color="error"
						onClick={handleCancelAndRetake}
					/>
					<UIButton
						className="flex-grow-1 rounded rounded-pill"
						fullWidth
						text="Generate Report"
						onClick={() => {
							handleStopRecording(false);
							setIsSessionTimeout(false);
						}}
					/>
				</div>
			</UIModal>
			<Grid container className="d-flex h-100 gap-2">
				{isRecording ? (
					<>
						<Grid
							item
							className="card-bg-admin-table w-100 h-100"
							borderRadius="18px"
							sx={{ borderRadius: "18px", padding: "1rem 1.5rem 0 1.5rem" }}
						>
							<SpeechTabs
								speechType="Virtual Patient"
								message={currentMessage?.speakerText}
							/>
						</Grid>
					</>
				) : (
					<Grid
						item
						className="d-flex justify-content-center align-items-center h-100 flex-column gap-4 card-bg-admin-table w-100"
						sx={{ borderRadius: "18px", padding: "1.5rem" }}
					>
						<div className="d-flex text-center justify-content-center rounded-top pt-2 w-100">
							<div>
								<Avatar
									src={imageSrc}
									sx={{ zIndex: 100, width: 100, height: 100 }}
									slotProps={{
										img: {
											style: {
												position: "absolute",
												objectPosition: "top",
											},
										},
									}}
								/>
								<Typography sx={{ zIndex: 100, position: "relative" }}>
									{/* {caseDetails?.fhirPatient?.name?.[0]?.text} */}
								</Typography>
							</div>
						</div>
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
							{isConnecting ? (
								<CircularProgress sx={{ color: "white" }} />
							) : (
								<img src={MicIcon} alt="Start Recording" />
							)}
						</div>
						{isConnecting && <div>Connecting to Virtual Patient...</div>}
					</Grid>
				)}
			</Grid>
		</>
	);
});

export default RestStationVirtual;
