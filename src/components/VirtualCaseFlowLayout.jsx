import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Avatar, Skeleton, Typography } from "@mui/material";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import FemaleAvatar from "assets/virtual_patient_avatars/female avatar.webp";
import MaleAvatar from "assets/virtual_patient_avatars/male avatar.webp";
import {
	convertCaseDetailsToString,
	generateFormScoreHelper,
	getEhrDetailsfromCaseDetails,
	repairJson,
} from "helpers/common_helper";
import {
	getStationConfigForCase,
	stationRequiresDocumentation,
} from "helpers/station_helpers";
import useConversation from "hooks/ConversationHook";
import { useEffect, useReducer, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
	CREATE_ATTEMPT,
	CREATE_CASE_SCORE,
	GET_INTEGRATED_CASE,
	GET_STATION_BY_ID,
	UPDATE_ATTEMPT_BY_ID,
} from "../adapters/noki_ed.service";
import UIButton from "../components/ReusableComponents/UIButton";
import { setRecording } from "../redux/slices/speechSlice";
import CaseForm from "./CaseFlowComponents/CaseForm";
import CaseTabsCard from "./CaseFlowComponents/CaseTabsCard";
import DisplayImages from "./CaseFlowComponents/DisplayImages";
import { startVisualization } from "./CaseFlowComponents/data";
import SpeechInterface from "./CaseFlowComponents2/SpeechInterFace";
import SpeechTabs from "./CaseFlowComponents2/SpeechTabs";
import StationTracker from "./CaseFlowComponents2/StepperBar";
import TopTimerComponents from "./CaseFlowComponents2/TopTimerComponents";
import CommonProgress from "./ReusableComponents/Loaders";
import TakeQuiz from "./ReusableComponents/TakeQuiz";
import UIModal from "./ReusableComponents/UIModal";
import { Reload } from "./reload-alert";

const VirtualCaseFlowLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const reduxDispatch = useDispatch();
	const [caseDetails, setCaseDetails] = useState([]);
	const [loading, setLoading] = useState(true);
	const [inputSchema, setInputSchema] = useState();
	const [formState, dispatch] = useReducer(
		(state, value) => ({
			...state,
			...value,
		}),
		{
			isStarted: false,
			isPaused: false,
		},
	);
	const [fetchedStation, setFetchedStation] = useState();
	const [maxTime, setMaxTime] = useState();
	const auth = useSelector((state) => state?.auth?.personData);
	const queryParams = new URLSearchParams(location.search);
	const caseId = queryParams.get("caseId");
	const stationId = queryParams.get("stationId");
	const attemptId = queryParams.get("attemptId");
	const isQuiz = queryParams.get("quiz") === "true";
	const [endSession, setEndSession] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [errorDialog, setErrorDialog] = useState("");
	const [scoreLoader, setScoreLoader] = useState(false);
	const [loaderText, setLoaderText] = useState("Analyzing Conversation...");
	const [isQuizOpen, setIsQuizOpen] = useState(isQuiz);
	const [startQuiz, setStartQuiz] = useState(false);
	const [promptAnalysis, setPromptAnalysis] = useState(null);
	// const [score, setScore] = useState(null);
	const [check, setCheck] = useState(false);
	const [percentage, setPercentage] = useState(0);
	const [cleanedTranscript, setCleanedTranscript] = useState("");
	const [rubricsData, setRubricsData] = useState(null);
	const [score, setScore] = useState(null);
	// const [isBlocking, setIsBlocking] = useState(true);
	const transcript = useRef([]);
	const liveTranscriptionRef = useRef();
	const [openAlert, setOpenAlert] = useState(false);
	const [webLoading, setWebLoading] = useState(false);
	const formRef = useRef(null);
	const [showSessionTimeoutDialog, setShowSessionTimeoutDialog] =
		useState(false);
	const config = getStationConfigForCase(fetchedStation?.type);
	const handleWebsocketClose = () => {
		if (!showSessionTimeoutDialog) {
			setShowSessionTimeoutDialog(true);
		}
	};

	const showMicPermissionPopup = () => {
		setOpenAlert(true);
	};

	const {
		startConversation,
		stopConversation,
		conversationList,
		currentMessage,
		pauseConversation,
		resumeConversation,
		audioStream,
		isConnecting,
		agentSpeaking,
	} = useConversation({
		linkCode: uuidv4(),
		// linkCode: "0cd27529-217c-4b2d-a41c-7f04e3d89164", //local
		virtualPatientDetails: { ...caseDetails, stationDetail: fetchedStation },
		handleWebsocketClose,
		showMicPermissionPopup,
	});

	const { isRecording, isPaused } = useSelector((state) => state?.speech);

	useEffect(() => {
		if (currentMessage?.speakerId === "Patient") {
			liveTranscriptionRef.current = currentMessage?.speakerText || "";
		}
	}, [currentMessage]);

	useEffect(() => {
		if (conversationList?.length) {
			transcript.current = conversationList;
		}
	}, [conversationList?.length]);

	useEffect(() => {
		setMaxTime(fetchedStation?.time_limit * 60);
	}, [fetchedStation]);

	const handleQuizClose = (quizScore) => {
		createCaseScore(
			promptAnalysis,
			quizScore,
			cleanedTranscript?.data,
			rubricsData,
			score,
		);
		setIsQuizOpen(false);
	};

	const validatePromptResponse = (data) => {
		if (data?.error) {
			return data.error;
		}
		const parsedJson = repairJson(data);
		if (parsedJson?.error) {
			return parsedJson.error;
		}
		return null;
	};

	const fetchCaseDetails = async (case_id) => {
		try {
			const response = await GET_INTEGRATED_CASE(case_id, {
				station: location?.state?.stationName,
			});
			setCaseDetails(response?.data);
			getEhrDetailsfromCaseDetails(response?.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const canvasRef = useRef(null);

	useEffect(() => {
		if (audioStream && canvasRef.current && isRecording) {
			startVisualization(canvasRef.current, audioStream);
			setWebLoading(false);
		}
	}, [audioStream, isRecording]);
	const generateTranscriptScoreHelper = async () => {
		const mappedString = transcript.current?.length
			? transcript.current
					.map((t) => `[${t?.startTime} - ${t?.endTime}] ${t?.speakerText}.`)
					.join(" ")
					.trim()
			: "";
		if (!mappedString) {
			return { error: "Please start a conversation" };
		}
		const CleanedTranscript = await EXECUTE_PROMPT({
			prompt_code: "speaker-identification-for-formd",
			payload: { transcript: mappedString },
		});
		return CleanedTranscript?.data;
	};
	const generateScore = async (content = "") => {
		try {
			setScoreLoader(true);
			const progressSteps = [
				"Analyzing Conversation...",
				"Identifying Strengths...",
				"Highlighting Areas of Improvement...",
				"Analysing Communication Skills...",
				"Calculating Score...",
				"Generating Score...",
			];

			let stepIndex = 0;

			const interval = setInterval(() => {
				setLoaderText(progressSteps[stepIndex]);
				stepIndex++;
				if (stepIndex >= progressSteps.length) {
					clearInterval(interval);
				}
			}, 5000);
			let data;
			if (content) {
				data = await generateFormScoreHelper(content);
			} else {
				data = await generateTranscriptScoreHelper();
			}
			if (data?.error) {
				setErrorMessage(data.error);
				setErrorDialog(true);
				clearInterval(interval);
				return;
			}
			const station = fetchedStation?.type;
			const description = convertCaseDetailsToString(caseDetails);
			const ehrData = getEhrDetailsfromCaseDetails(caseDetails);
			let case_details;
			if (
				caseDetails?.applicable_types?.[0] ===
					"Interpretation of Investigative Results" ||
				caseDetails?.applicable_types?.[0] === "Patient Education" ||
				caseDetails?.applicable_types?.[0] === "SOAP NOTE"
			) {
				case_details = { description, ...ehrData };
			} else {
				case_details = description;
			}
			const rubrics = caseDetails?.fhirQuestionnaire?.item?.find(
				(item) => item.linkId === "rubrics",
			)?.text;
			const scenario = caseDetails?.fhirQuestionnaire?.item?.find(
				(item) => item.linkId === "scenario",
			)?.text;
			let finalScore = 0;
			let evaluated_rubrics;
			if (rubrics) {
				const response = await EXECUTE_PROMPT({
					prompt_code: "dynamic-rubrics-analysis",
					payload: {
						station: station,
						conversation_transcript: data,
						rubrics,
						scenario,
					},
				});
				evaluated_rubrics = repairJson(response?.data);
				setRubricsData(evaluated_rubrics?.[station]);
				const calculatedScore =
					evaluated_rubrics?.[station]?.Sections?.reduce((total, section) => {
						const sectionScore = section?.Criteria?.reduce(
							(sectionTotal, criteria) =>
								sectionTotal + (Number.parseInt(criteria?.Score) || 0),
							0,
						);
						return total + sectionScore / section?.Criteria?.length;
					}, 0) / evaluated_rubrics?.[station]?.Sections?.length;
				finalScore = calculatedScore.toFixed(2);
				setScore(finalScore);
			}
			let { data: promptData } = await EXECUTE_PROMPT({
				prompt_code: fetchedStation?.prompt_code,
				payload: {
					conversation_transcript: data,
					stationtime: `${fetchedStation?.time_limit} mins`,
					case_details: case_details,
					evaluated_rubrics,
				},
			});
			promptData = repairJson(promptData);
			const error = validatePromptResponse(promptData);
			if (error) {
				console.error(error);
				setErrorMessage(error);
				setErrorDialog(true);
				clearInterval(interval);
				return;
			}
			if (isQuiz) {
				setPromptAnalysis(promptData);
				setCleanedTranscript(data);
				setStartQuiz(true);
				clearInterval(interval);
				return;
			}
			return await createCaseScore(
				promptData,
				"",
				data,
				evaluated_rubrics?.[station],
				finalScore,
			);
		} catch (error) {
			console.error("Error in generateScore:", error);
		} finally {
			setScoreLoader(false);
			setLoaderText("");
		}
	};

	const createCaseScore = async (
		generatedScore,
		quizScore,
		cleanedTranscript,
		rubrics,
		calculatedScore,
	) => {
		setScoreLoader(true);
		let attemptResponse;
		if (
			caseDetails?.visibility === "private" &&
			location?.state?.type === "case"
		) {
			//create an attempt for case to status completed and reviewStatus Todo
			attemptResponse = await CREATE_ATTEMPT({
				caseId: caseDetails?.id,
				practitionerId: auth?.fhir_practitioner_id,
				status: "completed",
				reviewStatus: "todo",
				attemptType: caseDetails.visibility,
			});
		}
		const caseScorePayload = {
			patientId: caseDetails?.fhir_patient_id,
			PractitionerId: auth?.fhir_practitioner_id,
			questionnaireId: caseDetails?.fhir_questionnaire_id,
			stationId: stationId,
			// status: "completed",
			type: location?.state?.type,
			caseType: caseDetails?.visibility,
			data: {
				caseScore: {
					value: { ...generatedScore, "Overall Score": calculatedScore },
				},
				rubrics: { value: rubrics },
				transcript: {
					value: inputSchema ? cleanedTranscript : transcript.current,
				},
				cleanedTranscript: { value: cleanedTranscript },
				timeTaken: Math.floor((percentage * maxTime) / 100),
				stationDetails: fetchedStation,
			},
		};
		if (caseDetails?.visibility === "private") {
			caseScorePayload.feedbackState = "pending";
		}
		if (attemptId && typeof location?.state?.unAttemptedCase === "number") {
			caseScorePayload.attemptId = attemptId;
			caseScorePayload.casesLeft = location.state.unAttemptedCase - 1;
		}
		if (attemptResponse?.data?.id) {
			caseScorePayload.attemptId = attemptResponse.data.id;
		}
		if (quizScore && isQuiz) {
			caseScorePayload.data.quizScore = quizScore;
		}
		try {
			const response = await CREATE_CASE_SCORE(caseScorePayload);
			if (
				attemptId &&
				location.state.unAttemptedCase === 1 &&
				location?.state?.type === "circuit"
			) {
				await UPDATE_ATTEMPT_BY_ID(attemptId, { status: "completed" });
			}
			navigate(
				`/feedback?scoreId=${response?.data?.id}&attemptId=${attemptId}&type=${location?.state?.type}`,
				{
					state: {
						totalCases: location?.state?.totalCases,
						unAttemptedCase: location?.state?.unAttemptedCase,
						circuitId: location?.state?.circuitId,
						attemptType: location?.state?.attemptType,
						model: "virtualPatient",
						navigateTo: -2,
					},
				},
			);
			return response?.data;
		} catch (error) {
			console.error("Error in createCaseScore:", error);
		} finally {
			transcript.current = [];
			setPromptAnalysis(null);
			setScoreLoader(false);
		}
	};

	const handleOnStopRecording = async () => {
		try {
			transcript.current = conversationList;
			await stopConversation();
			await generateScore();
		} catch (error) {
			console.error("Error stopping recording or generating score:", error);
		}
	};

	const handleCancelAndRetake = async () => {
		await stopConversation();
		navigate(0);
	};
	const handleOnStartDocumenting = () => {
		dispatch({ isStarted: true });
		reduxDispatch(setRecording(true));
	};
	const handleOnStopDocumenting = () => {
		setEndSession(false);
		formRef.current.submitForm();
		reduxDispatch(setRecording(false));
	};
	const handleOnAbortDocumenting = () => {
		dispatch({ ispaused: true });
		reduxDispatch(setRecording(false));
	};
	const handleOnPauseDocumenting = () => {
		dispatch({ isPaused: true });
	};
	const handleOnResumeDocumenting = () => {
		dispatch({ isPaused: false });
	};

	const getStationsById = async (station_id) => {
		try {
			setLoading(true);
			const response = await GET_STATION_BY_ID(`/${station_id}`);
			setFetchedStation(response);
			setInputSchema(stationRequiresDocumentation?.[response?.type]);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (stationId && caseId) {
			if (stationId) {
				getStationsById(stationId);
			}
			if (caseId) {
				fetchCaseDetails(caseId);
			}
		}
	}, [stationId, caseId, location]);

	const [defaultVisualizationText, setDefaultVisualizationText] = useState("");

	useEffect(() => {
		const getVisualizationText = () => {
			switch (true) {
				case isPaused:
					return "Recording has been Paused";

				case agentSpeaking:
					return "Virtual Agent is Speaking";

				case Boolean(currentMessage?.speakerText):
					return currentMessage.speakerText;

				case isRecording:
					return "Recording is in Progress";

				default:
					return ""; // Add a default case if needed
			}
		};

		setDefaultVisualizationText(getVisualizationText());
	}, [isRecording, isPaused, agentSpeaking, currentMessage?.speakerText]);

	return (
		<>
			{/* For reload and close Alert */}
			<Reload is_true={isRecording || scoreLoader || isQuizOpen} />
			{scoreLoader && <div className="fullscreen-overlay" />}
			<UIModal open={openAlert} displayCloseIcon={false} width={400}>
				<div className="d-flex justify-content-center align-items-center p-2">
					<ErrorOutlineIcon style={{ color: "orange", marginRight: "10px" }} />
					Please switch on the Microphone in your browser to start recording.
				</div>
				<div className="d-flex justify-content-end">
					<UIButton text="ok" onClick={() => setOpenAlert(false)} />
				</div>
			</UIModal>
			<UIModal
				open={showSessionTimeoutDialog}
				displayCloseIcon={false}
				width={400}
			>
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
							handleOnStopRecording(false);
							setShowSessionTimeoutDialog(false);
						}}
					/>
				</div>
			</UIModal>
			{startQuiz && isQuizOpen && (
				<div className="d-flex flex-column justify-content-center align-items-center h-100">
					<TakeQuiz
						open={isQuizOpen}
						handleClose={handleQuizClose}
						quizConfig={{ limit: 5 }}
						disableXButton={true}
						filter={{
							stationType: location?.state?.stationDetails.type,
						}}
					/>
				</div>
			)}
			{loading || scoreLoader ? (
				loading ? (
					<SkeltonLoader />
				) : (
					<div className="d-flex flex-column justify-content-center align-items-center h-100">
						<CommonProgress />
						<Typography>{loaderText}</Typography>
					</div>
				)
			) : (
				<>
					<div
						className="row border m-0 p-0"
						style={{ height: "100%", overflowY: "auto" }}
					>
						<TopTimerComponents
							circuitName={location?.state?.circuitName}
							caseDetails={caseDetails}
							stationData={fetchedStation}
							setMaxTime={setMaxTime}
							maxTime={maxTime}
							isRecording={isRecording || formState?.isStarted}
							isPaused={isPaused || formState?.isPaused}
							setPercentage={setPercentage}
							{...(inputSchema
								? {
										handleOnStopRecording: handleOnStopDocumenting,
										stopRecording: handleOnAbortDocumenting,
										pauseRecording: handleOnPauseDocumenting,
										resumeRecording: handleOnResumeDocumenting,
									}
								: {
										handleOnStopRecording,
										stopRecording: stopConversation,
										pauseRecording: pauseConversation,
										resumeRecording: resumeConversation,
									})}
							canvasRef={canvasRef}
							check={check}
							loading={loading}
						/>

						<div
							className="p-2 m-0"
							style={{ background: "#F7F5FB", maxHeight: 50 }}
						>
							<StationTracker
								percentage={percentage}
								totalCases={location?.state?.totalCases}
								activeStep={
									location?.state?.totalCases -
									location?.state?.unAttemptedCase +
									1
								}
								completedCase={
									location?.state?.totalCases - location?.state?.unAttemptedCase
								}
							/>
						</div>

						<div className="col-md-8 col-sm-12 p-3">
							{inputSchema ? (
								<CaseForm
									ref={formRef}
									schema={inputSchema}
									formState={formState}
									handleOnStartDocumenting={handleOnStartDocumenting}
									generateScore={generateScore}
								/>
							) : (
								<>
									<div
										className="d-flex text-center justify-content-center rounded-top pt-2"
										style={{
											backgroundColor: "#F7F5FB",
											marginBottom: "-30px",
										}}
									>
										<div>
											<Avatar
												src={
													caseDetails?.fhirPatient?.gender === "male"
														? MaleAvatar
														: FemaleAvatar
												}
												sx={{ zIndex: 100, width: 100, height: 100 }}
											/>
											<Typography sx={{ zIndex: 100, position: "relative" }}>
												{caseDetails?.fhirPatient?.name?.[0]?.text}
											</Typography>
										</div>
									</div>
									<SpeechInterface
										setCheck={setCheck}
										isRecording={isRecording}
										startRecording={isConnecting ? () => {} : startConversation}
										liveTranscriptionRef={liveTranscriptionRef}
										canvasRef={canvasRef}
										isPaused={isPaused}
										pauseRecording={pauseConversation}
										resumeRecording={resumeConversation}
										openAlert={openAlert}
										defaultText={defaultVisualizationText}
										setWebLoading={setWebLoading}
										webLoading={webLoading}
										source="virtual-patient"
									/>
								</>
							)}
							{config?.ehr ? (
								<div className="d-none d-md-block mt-4">
									<CaseTabsCard caseDetails={caseDetails} />
								</div>
							) : (
								<div className="d-none d-md-flex flex-column justify-content-center align-items-center h-50">
									<p>
										{`EHR details will not be shown for this ${fetchedStation?.type} station`}
									</p>
								</div>
							)}
							<div className="mt-4">
								<DisplayImages
									questionnaireId={caseDetails?.fhir_questionnaire_id}
									stationType={fetchedStation?.type}
								/>
							</div>
						</div>
						<div className="col-md-4 col-sm-12 p-3">
							<div className="col-12">
								<SpeechTabs
									caseDetails={caseDetails}
									stationDetails={fetchedStation}
								/>
							</div>
							{config.ehr && (
								<div className="col-12 d-md-none p-0 mt-4">
									<CaseTabsCard caseDetails={caseDetails} />
								</div>
							)}
						</div>
						{/*mobile sticky buttons of EndSession and Go to Next Stations */}
						{(isRecording || formState?.isStarted) && (
							<div
								className="d-md-none  d-flex flex-row"
								style={{
									position: "sticky",
									bottom: 0,
									zIndex: 1000,
									backgroundColor: "white",
									padding: "30px",
									boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
								}}
							>
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
												text="cancel"
												onClick={() => setEndSession(false)}
												sx={{
													width: "100%",
													textTransform: "capitalize !important",
												}}
											/>

											<UIButton
												text="ok"
												variant="contained"
												onClick={() =>
													inputSchema
														? handleOnStopDocumenting()
														: handleOnStopRecording()
												}
												sx={{
													width: "100%",
													textTransform: "capitalize !important",
												}}
											/>
										</div>
									</div>
								</UIModal>
								<UIButton
									text="End Session"
									style={{
										color: "#B22234",
										borderColor: "#B22234",
										marginRight: "5px",
										width: "100%",
										textTransform: "capitalize",
									}}
									onClick={() => {
										setEndSession(true);
									}}
								/>
							</div>
						)}

						{errorMessage && (
							<UIModal open={errorDialog} displayCloseIcon={false} width={400}>
								<div className="modal-content">
									<div className="modal-body">
										<div className="d-flex flex-column justify-content-center align-items-center">
											<h5 style={{ fontWeight: "bold" }}>Are you sure?</h5>
											<span style={{ textAlign: "center" }}>
												{errorMessage}
											</span>
										</div>
									</div>
									<div className="d-flex justify-content-center align-items-center gap-2">
										<UIButton
											text="Try Again"
											variant="outlined"
											onClick={() => {
												navigate(0);
											}}
											sx={{
												width: "100%",
												textTransform: "capitalize !important",
											}}
										/>
										<UIButton
											text="Home"
											variant="contained"
											onClick={() => {
												navigate("/");
											}}
											sx={{
												width: "100%",
												textTransform: "capitalize !important",
											}}
										/>
										{/* <UIButton
                                            text="Reanalyze"
                                            variant="outlined"
                                            onClick={() => {
                                                generateScore();
                                            }}
                                            sx={{
                                                width: "100%",
                                                textTransform: "capitalize !important",
                                            }}
                                        /> */}
									</div>
								</div>
							</UIModal>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default VirtualCaseFlowLayout;

const SkeltonLoader = () => {
	const style = {
		transform: "none",
		WebkitTransform: "none",
	};

	return (
		<div className="row h-100 p-4">
			<div className="col-12 d-flex flex-row justify-content-between align-items-center p-2">
				<Skeleton
					animation="wave"
					height={40}
					className="col-3 p-0 m-0 "
					sx={style}
				/>

				<Skeleton
					animation="wave"
					height={40}
					className="col-3 p-0 m-0 "
					sx={style}
				/>
			</div>
			<div className="col-12 p-2">
				<Skeleton
					animation="wave"
					height={70}
					width={"100%"}
					className="p-0 m-0 "
					sx={style}
				/>
			</div>
			<div className="col-md-8 col-sm-12 d-flex flex-column gap-4">
				<Skeleton
					animation="wave"
					height={400}
					width={"100%"}
					className="p-0 m-0 "
					sx={style}
				/>
				<div className="h-100">
					<div className="d-flex gap-4 align-items-start">
						{[1, 2, 3, 4, 5, 6, 7]?.map((item) => (
							<Skeleton
								key={`case-flow-layout2-skeleton-${item}`} // This key will have 1,2,3,4,5,6,7 as values so it will be unique
								height={70}
								width={90}
								className="p-0 my-2"
								sx={style}
								animation="wave"
							/>
						))}
					</div>
					<Skeleton
						height={"50%"}
						width={"100%"}
						className="p-0 m-0"
						sx={style}
						animation="wave"
					/>
				</div>
			</div>
			<div className="col-md-4 col-sm-12">
				<Skeleton
					height={"100%"}
					width={"100%"}
					className="p-0 m-0"
					sx={style}
					animation="wave"
				/>
			</div>
		</div>
	);
};
