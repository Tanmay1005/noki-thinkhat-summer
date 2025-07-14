import { Grid, Typography } from "@mui/material";
import {
	FIND_MULTI_STATION_ATTEMPT,
	GET_ATTEMPT_BY_ID,
	GET_CASE_SCORE_BY_ID,
	GET_INTEGRATED_CASE_BY_PATIENT_ID,
} from "adapters/noki_ed.service";
import Disclaimer from "components/ReusableComponents/Disclaimer";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import useCircuitHelpers from "helpers/circuit_helpers";
import {
	convertHtmlToText,
	convertSecToTime,
	getScore,
} from "helpers/common_helper";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
	osceSections,
} from "helpers/constants";
import {
	assessmentPlanFeedbackFormatter,
	diagnosticTestsFeedbackFormatter,
	focusedHistoryExpertFeedbackFormatter,
	physicalExaminationExpertFeedbackFormatter,
	soapNoteFeedbackFormatter,
} from "helpers/feedbackHelper";
import { stationRequiresDocumentation } from "helpers/station_helpers";
import useMultiStationCase from "hooks/useMultiStationCase";
import { useUserType } from "hooks/useUserType";
import { capitalize, isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";
import NoDataFound from "../../assets/no-data-found.svg";
import { useQuery } from "../../hooks/useQuery";
import UIButton from "../ReusableComponents/UIButton";
import AssessmentInDetail from "./AssessmentIndetail";
import CustomBarChart from "./CustomBarChart";
import DiagnosticTestFeedbackSection from "./DiagnosticTestFeedbackSection";
import DummyFeedback from "./DummyFeedback";
import ExpertApproachView from "./ExpertApproachView";
import FeedbackUI from "./FeedbackUI";
import RubricsTable from "./RubricsTable.jsx";
const feedbackKeys = {
	[FOCUSED_HISTORY]: "Symptom",
	[FOCUSED_PHYSICAL_EXAMINATION]: "Exam_Name",
	[ASSESSMENT_PLAN]: "Diagnosis",
	[DIAGNOSTIC_TESTS]: "Test_Name",
	[SOAP_NOTE]: "Topic",
};
const feedbackFormatters = {
	[FOCUSED_HISTORY]: focusedHistoryExpertFeedbackFormatter,
	[FOCUSED_PHYSICAL_EXAMINATION]: physicalExaminationExpertFeedbackFormatter,
	[SOAP_NOTE]: soapNoteFeedbackFormatter,
	[ASSESSMENT_PLAN]: assessmentPlanFeedbackFormatter,
	[DIAGNOSTIC_TESTS]: diagnosticTestsFeedbackFormatter,
};
const AssessmentFeedback = ({
	CasesData,
	circuitsData,
	station = null,
	displayBackButton = true,
}) => {
	const appTheme = useSelector((state) => state?.app?.theme);
	const auth = useSelector((state) => state?.auth?.personData);
	const navigate = useNavigate();
	const query = useQuery();
	const scoreId = query.get("scoreId");
	const attemptId = query.get("attemptId");
	const caseId = query.get("caseId");
	const type = query.get("type");
	const isNextStation = query.get("isNextStation");
	const tab = query.get("tab");
	const location = useLocation();
	const [caseScoreParsedJson, setCaseScoreParsedJson] = useState();
	const [rubricsParsedJson, setRubricsParsedJson] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showDialog, setShowDialog] = useState(false);
	const [showNoData, setShowNoData] = useState(false);
	const [attemptDetails, setAttemptDetails] = useState({});
	const [showTranscript, setShowTranscript] = useState([]);
	const [transcriptDialog, setTranscriptDialog] = useState(false);
	const [patientId, setPatientId] = useState("");
	const [caseDetails, setCaseDetails] = useState(null);
	const [stationDetails, setStationDetails] = useState({});
	const [attemptTime, setAttemptTime] = useState(0);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [showDummyFeedback, setShowDummyFeedback] = useState(false);
	const path = window.location.pathname;
	const userRole = useUserType();
	const { getNextCase } = useCircuitHelpers();
	const { getNextStation } = useMultiStationCase();
	const { practitionerId, circuitId, model, navigateTo } =
		location?.state || {};
	const expertApproachData =
		feedbackFormatters?.[stationDetails?.type]?.(caseScoreParsedJson);
	const getCaseScore = async () => {
		try {
			setLoading(true);

			let requestData = {
				practitionerId: circuitsData?.practitioner_id,
				attemptId: [circuitsData?.id],
				patientId: CasesData?.fhir_patient_id,
				station: station,
				count: 10,
			};
			if (scoreId) {
				requestData = { id: scoreId };
			} else if (caseId) {
				requestData = {
					patientId: caseId,
					practitionerId: practitionerId,
				};
			}
			const response = await GET_CASE_SCORE_BY_ID({
				...requestData,
				type: type,
				role: userRole?.toLowerCase(),
			});

			if (attemptId && attemptId !== "null" && type !== "multi-station-case") {
				const attempt = await GET_ATTEMPT_BY_ID(attemptId);
				if (attempt) {
					setAttemptDetails(attempt.data);
				}
			}
			const attemptType = response?.data?.message ? "private" : "public";
			if (type === "multi-station-case") {
				const attempt = await FIND_MULTI_STATION_ATTEMPT({
					id: attemptId,
					attemptType: attemptType,
				});
				setAttemptDetails(attempt?.data?.data?.[0] || {});
			}
			if (response?.data?.message) {
				setShowDummyFeedback(true);
				return;
			}
			if (!response?.data?.entries?.length) {
				setShowNoData(true);
				return;
			}

			const firstEntry = response.data.entries[0];
			const resources = firstEntry?.resource?.item?.reduce((acc, curr) => {
				const { linkId, answer } = curr;
				acc[linkId] = answer?.[0] ? { ...answer[0] } : {};
				return acc;
			}, {});
			const patientId = firstEntry.resource.subject.reference.split("/")[1];
			const caseScoreValueString = resources?.["case-score"]?.valueString;
			const rubricsString = resources?.rubrics?.valueString;
			if (!caseScoreValueString) {
				setShowNoData(true);
				return;
			}

			const parsedValue = JSON.parse(caseScoreValueString);
			if (rubricsString) {
				const parsedRubrics = JSON.parse(rubricsString);
				const value = getScore(parsedRubrics);
				setRubricsParsedJson({ ...parsedRubrics, ...value });
			}
			const timeTaken = resources?.["time-taken"]?.valueDecimal || 0;
			const quizDetails = resources?.["quiz-score"]?.valueString;
			const quizScore = quizDetails ? JSON.parse(quizDetails) : null;
			const stationDetails = JSON.parse(resources?.stationDetails?.valueString);

			const transcript = resources?.transcript?.valueString;
			const parsedTranscript = JSON.parse(transcript);
			setPatientId(patientId);
			setStationDetails(stationDetails);
			setAttemptTime(firstEntry.resource.authored);
			setShowTranscript(parsedTranscript?.value);
			setCaseScoreParsedJson({
				...(parsedValue?.value || null),
				timeTaken: timeTaken,
				quizScore: quizScore,
			});
		} catch (error) {
			console.error("Error fetching case score:", error);
			setShowNoData(true);
		} finally {
			setLoading(false);
		}
	};
	const handleCaseDetails = async () => {
		try {
			if (caseDetails && caseDetails.case.length > 0) {
				setShowDialog(true);
				return;
			}
			setButtonLoading(true);
			const response = await GET_INTEGRATED_CASE_BY_PATIENT_ID(patientId);
			setCaseDetails(response?.data);
			// setCaseDetailsCache(response?.data);
		} catch (error) {
			console.error("Error fetching case details:", error);
		} finally {
			setButtonLoading(false);
		}
	};

	useEffect(() => {
		getCaseScore();
	}, []);

	const barChartData = caseScoreParsedJson?.["Insights Dashboard"]?.[
		"Category Scores"
	]
		? Object?.entries(
				caseScoreParsedJson["Insights Dashboard"]["Category Scores"],
			)?.map(([key, value]) => {
				return {
					x: key,
					y: Number.parseFloat(value),
				};
			})
		: [];
	const handleNextStation = () => {
		const query = {
			circuit_id: circuitId,
			practitioner_id: auth?.fhir_practitioner_id,
		};
		if (type === "multi-station-case") {
			getNextStation(attemptId, model, attemptDetails?.attempt_type);
			return;
		}
		getNextCase(query, "", attemptDetails?.attempt_type, model);
	};
	return (
		<>
			{transcriptDialog && (
				<UIModal
					open={transcriptDialog}
					handleClose={() => setTranscriptDialog(false)}
					closeOnBackdropClick={true}
				>
					<>
						{" "}
						<h6
							style={{
								color: "#5D5FEF",
								fontWeight: 600,
								marginTop: "2px",
								fontSize: "16px",
							}}
						>
							Transcript{" "}
						</h6>
						{stationRequiresDocumentation?.[stationDetails?.type]?.length >
						0 ? (
							<>
								{Array.isArray(showTranscript)
									? showTranscript?.map((transcript) =>
											Object.entries(transcript).map(([key, value], index) => (
												<div
													className="p-2"
													key={`transcription-map-${index + 1}`}
												>
													<span style={{ color: "#5840BA" }}>
														{capitalize(key)}:
													</span>{" "}
													{typeof value === "object"
														? JSON.stringify(value)
														: value}
												</div>
											)),
										)
									: Object.entries(showTranscript).map(
											([key, value], index) => (
												<div
													className="p-2"
													key={`transcription-map-${index + 1}`}
												>
													<span style={{ color: "#5840BA" }}>
														{capitalize(key)}:
													</span>{" "}
													<span dangerouslySetInnerHTML={{ __html: value }} />
												</div>
											),
										)}
							</>
						) : (
							<div>
								{showTranscript?.filter(
									(item) =>
										!(
											item.speakerId?.toLowerCase() === "unknown" &&
											item.speakerText?.trim() === ""
										),
								).length === 0 ? (
									<div
										className="d-flex justify-content-center align-items-center h-100"
										style={{
											minHeight: "100%",
										}}
									>
										Transcript Not Found
									</div>
								) : (
									showTranscript
										?.filter(
											(item) =>
												!(
													item.speakerId?.toLowerCase() === "unknown" &&
													item.speakerText?.trim() === ""
												),
										)
										.map((item, index) => (
											<div
												className="p-2"
												key={`transcription-map-${index + 1}`}
											>
												<span style={{ color: "#5840BA" }}>
													{item?.speakerId}:
												</span>{" "}
												{item.speakerText}
											</div>
										))
								)}
							</div>
						)}
					</>
				</UIModal>
			)}
			<UIModal
				open={showDialog}
				handleClose={() => setShowDialog(false)}
				closeOnBackdropClick={true}
				width={500}
			>
				<>
					{" "}
					<h6
						style={{
							color: "#5D5FEF",
							fontWeight: 600,
							marginTop: "2px",
							fontSize: "16px",
						}}
					>
						CASE DETAILS{" "}
					</h6>
					{caseDetails && (
						<div className="p-2" style={{ fontSize: "16px" }}>
							<div className="p-1">
								<span style={{ fontWeight: 600 }}>Case Name : </span>
								{caseDetails?.case?.[0]?.name}
							</div>
							<div className="p-1">
								<span style={{ fontWeight: 600 }}>Description :</span>{" "}
								<div
									className="editInnerHtml"
									dangerouslySetInnerHTML={{
										__html: caseDetails?.case?.[0]?.description,
									}}
								/>
							</div>
							<div className="p-1">
								<span style={{ fontWeight: 600 }}>Case Type :</span>{" "}
								{convertHtmlToText(caseDetails?.case?.[0]?.case_type)}
							</div>
							<div className="p-1">
								<span style={{ fontWeight: 600 }}>Station Type :</span>{" "}
								{stationDetails.type}
							</div>
							<div className="p-1">
								<span style={{ fontWeight: 600 }}>Attempted At :</span>{" "}
								{dayjs(attemptTime).format("MM/DD/YYYY hh:mm A")}
							</div>
						</div>
					)}
				</>
			</UIModal>
			{loading ? (
				<>
					<div
						className="d-flex justify-content-center align-items-center"
						style={{ height: "100vh" }}
					>
						<CommonProgress />
					</div>
				</>
			) : (
				<div className="px-3">
					<div
						className="d-flex justify-content-between gap-2 mt-2 flex-wrap align-items-center position-sticky top-0"
						style={{ backgroundColor: "#fff", zIndex: 1000 }}
					>
						<div className="d-flex gap-2 align-items-center">
							{displayBackButton && (
								<img
									src={GoBackIcon}
									alt="Go Back"
									onClick={() => navigate(navigateTo)}
									onKeyUp={() => navigate(navigateTo)}
									style={{
										cursor: "pointer",
										height: "1.5rem",
										width: "1.5rem",
									}}
								/>
							)}

							{!showNoData && (
								<Typography fontWeight={"bold"} color={"primary"}>
									{path.includes("/allscores") || path.includes("/OSCE/tests")
										? ""
										: "Feedback"}
								</Typography>
							)}
						</div>
						<div className="d-none d-md-flex justify-content-between gap-2">
							{patientId && (
								<UIButton
									text={buttonLoading ? <CommonProgress /> : "Case Details"}
									disabled={buttonLoading}
									variant="contained"
									size="large"
									onClick={async () => {
										await handleCaseDetails();
										setShowDialog(true);
									}}
								/>
							)}
							{showTranscript?.length !== 0 && (
								<UIButton
									text="Transcript"
									variant="contained"
									size="large"
									onClick={() => {
										setTranscriptDialog(true);
									}}
								/>
							)}

							{isNextStation === "true" && (
								<UIButton
									text="Next Station"
									variant="contained"
									size="large"
									onClick={handleNextStation}
								/>
							)}

							{!showNoData &&
								circuitsData &&
								!circuitsData?.case?.is_multi_station &&
								(circuitsData?.circuit?.visibility !== "private" ||
									circuitsData?.attempt_type !== "private") && (
									<UIButton
										text={`Go To ${osceSections[tab]}`}
										size="large"
										onClick={() => {
											// need to change this handle nested tabs
											navigate(`/OSCETraining?tab=${0}`);
										}}
									/>
								)}
							<UIButton
								text="Go To Dashboard"
								variant="contained"
								size="large"
								onClick={() => navigate("/")}
							/>
						</div>
					</div>
					{showDummyFeedback ? (
						<DummyFeedback />
					) : showNoData ? (
						<div
							className="mb-4 d-flex align-items-center justify-content-center"
							style={{ height: "50vh" }}
						>
							<img src={NoDataFound} alt="No Data" />
						</div>
					) : (
						<div className="mx-1 mx-md-3">
							<div>
								<div className="mt-2">
									<div className="d-flex flex-column align-items-center ">
										<div className="mb-4 d-flex align-items-center justify-content-between gap-2">
											<div className="hurray-icon " />
											<Typography fontSize={"1.2rem"} textAlign={"center"}>
												Keep going, you are doing a great job!!
											</Typography>
										</div>
										<div className="d-flex text-center justify-content-center gap-3 gap-md-5">
											<div className="d-flex flex-column align-items-center">
												<Typography
													fontSize={{ xs: "1.3rem", md: "1.5rem" }}
													fontWeight={"510"}
												>
													Score
												</Typography>
												<Typography
													className="text-center"
													fontSize={{ xs: "2rem", md: "3rem" }}
													fontWeight={"bold"}
													sx={{
														color: "rgba(103, 186, 64, 1)",
													}}
												>
													{rubricsParsedJson?.score} /{" "}
													{rubricsParsedJson?.total}
												</Typography>
											</div>
											<div className="d-flex flex-column align-items-center">
												<Typography
													fontSize={{ xs: "1.3rem", md: "1.5rem" }}
													fontWeight={"510"}
												>
													Time Taken
												</Typography>
												<Typography
													className="text-center"
													fontSize={{ xs: "2rem", md: "3rem" }}
													fontWeight={"bold"}
													sx={{
														color: "rgba(255, 114, 94, 1)",
													}}
												>
													{convertSecToTime(caseScoreParsedJson?.timeTaken)}
												</Typography>
											</div>
											{caseScoreParsedJson?.quizScore && (
												<div className="d-flex flex-column align-items-center">
													<Typography
														fontSize={{ xs: "1.3rem", md: "1.5rem" }}
														fontWeight={"510"}
													>
														Quiz Score
													</Typography>
													<Typography
														className="text-center"
														fontSize={{ xs: "2rem", md: "3rem" }}
														fontWeight="bold"
														sx={{
															color: "rgba(103, 186, 64, 1)",
														}}
													>
														{`${caseScoreParsedJson?.quizScore?.answeredCorrect || 0}/${caseScoreParsedJson?.quizScore?.totalQuestions || 0}`}
													</Typography>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
							<div>
								<Disclaimer />
							</div>
							{barChartData?.length > 0 && (
								<Grid
									container
									className="p-2 d-flex flex-column flex-md-row justify-content-between my-3 main-bg-color rounded rounded-4"
								>
									<Grid item xs={12}>
										<div
											style={{
												textAlign: "center",
												marginBottom: "10px",
												fontSize: "1rem",
												fontWeight: "bold",
											}}
										>
											Your Performance by Competency
										</div>
										<CustomBarChart data={barChartData} appTheme={appTheme} />
									</Grid>
								</Grid>
							)}
							{!showDummyFeedback &&
								rubricsParsedJson?.value?.Sections?.length > 0 && (
									<RubricsTable
										data={rubricsParsedJson?.value?.Sections}
										setData={setRubricsParsedJson}
										editable={false}
									/>
								)}
							<div>
								{!isEmpty(expertApproachData) && (
									<ExpertApproachView jsonData={expertApproachData} />
								)}
							</div>
							<div>
								{stationDetails?.type === DIAGNOSTIC_TESTS && (
									<DiagnosticTestFeedbackSection data={caseScoreParsedJson} />
								)}
							</div>
							{caseScoreParsedJson?.In_Detail_Feedback && (
								<AssessmentInDetail
									feedbackList={caseScoreParsedJson?.In_Detail_Feedback}
									headingKey={feedbackKeys?.[stationDetails?.type]}
								/>
							)}
							<FeedbackUI data={caseScoreParsedJson} />
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default AssessmentFeedback;
