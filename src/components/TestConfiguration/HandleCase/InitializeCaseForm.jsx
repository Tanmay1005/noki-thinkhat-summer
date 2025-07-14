import { Close } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import {
	Box,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	Grid,
	IconButton,
	LinearProgress,
	Radio,
	Skeleton,
	Slide,
	Stack,
	Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { green, grey, red } from "@mui/material/colors";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import { useLayout } from "components/Layout";
import Disclaimer from "components/ReusableComponents/Disclaimer";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import UIRadioGroup from "components/ReusableComponents/UIRadioGroup";
import UISelectField from "components/ReusableComponents/UISelectField";
import dayjs from "dayjs";
import { jsonToHtml, repairJson } from "helpers/common_helper";
import { specializations } from "helpers/constants";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import { getIconByStationType } from "helpers/station_helpers";
import { isArray } from "lodash";
import { marked } from "marked";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { startExpertApproach } from "./expertApproachHelper";

const Transition = forwardRef(function Transition(props, ref) {
	const { isMobile } = useLayout();
	return <Slide direction={isMobile ? "down" : "up"} ref={ref} {...props} />;
});
const initialData = {
	caseGenerateMethod: "formd-ai",
	selectedStations: [],
	specialization: "",
	context: "",
	caseGenerationType: "individual",
};

const fullStationCase = [
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	SOAP_NOTE,
];
const ehrTabs = {
	Current_Encounter_EHR: [
		"Patient_Overview",
		"Subjective",
		"Medical_And_Social_Background",
		"Objective",
		"Clinical_Reasoning",
	],
	Past_Encounter_EHR: [
		"Patient_Overview",
		"Subjective",
		"Medical_And_Social_Background",
		"Objective",
		"Clinical_Reasoning",
	],
};
const InitializeCaseForm = ({
	open,
	handleClose = () => {},
	setInitializeCaseData = () => {},
}) => {
	// const [stationList, setStationsList] = useState([]);
	const { data: stationList, _stationMap } = useSelector(
		(state) => state?.stations,
	);
	const [loading, setLoading] = useState({
		initialLoading: false,
		proceedLoading: false,
	});
	const [data, setData] = useState({ ...initialData });
	const [stepStatus, setStepStatus] = useState({
		"chief-complaint-creation": {
			label: "Generating chief complaint",
			status: "loading",
		},
		"gen-ehr-data": {
			label: "Generating patient health records",
			status: "loading",
		},
		"gen-expert-data": {
			label: "Generating experts view for the case",
			status: "loading",
		},
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [isCaseCreationLoading, setIsCaseCreationLoading] = useState(false);

	const setStepStatusForKey = useCallback((key, status, extras) => {
		setStepStatus((prev) => ({
			...prev,
			[key]: { ...prev[key], status, extras },
		}));
	}, []);

	const resetStepStatus = useCallback(() => {
		setStepStatus({
			"chief-complaint-creation": {
				label: "Generating chief complaint",
				status: "loading",
			},
			"gen-ehr-data": {
				label: "Generating patient health records",
				status: "loading",
			},
			"gen-expert-data": {
				label: "Generating experts view for the case",
				status: "loading",
			},
		});
	}, []);

	const handleChange = (e) => {
		const { name, value, checked } = e.target;

		setData((prev) => {
			if (name === "selectedStations") {
				if (data.caseGenerationType === "individual") {
					return {
						...prev,
						selectedStations: [value],
					};
				}
				return {
					...prev,
					selectedStations: checked
						? [...(prev.selectedStations || []), value]
						: prev.selectedStations.filter((station) => station !== value),
				};
			}
			return {
				...prev,
				[name]: value,
			};
		});
	};

	const handleModeChange = (e) => {
		const { name, value } = e.target;
		setData((prev) => ({
			...prev,
			[name]: value,
			context: value === "manual" ? "" : prev?.context,
		}));
		setErrorMessage("");
	};

	const FullStationCaseValue = () => {
		const stationValue = fullStationCase?.map(
			(itemLabel) => stationList?.find((item) => item?.type === itemLabel)?.id,
		);
		return stationValue;
	};

	const handleCaseTypeChange = (e) => {
		const { name, value } = e.target;
		setData((prev) => ({
			...prev,
			[name]: value,
			selectedStations: value === "individual" ? [] : FullStationCaseValue(),
		}));
	};

	const transformData = (
		response,
		rubrics_response,
		selectedStationsData,
		expertApproachData,
	) => {
		const formatRubricsData = (data) => {
			const tempData = Object.entries(data)?.map(([key, value]) => ({
				category: key,
				criteria: value,
			}));

			return tempData || [];
		};

		const formatObjectivesData = (data) => {
			const tempData = data?.map((item) => ({ value: item }));
			return tempData || [];
		};
		const formatExpertApproachData = (id) => {
			const result = expertApproachData?.find(
				(item) => item?.stationId === id,
			)?.result;
			return result || {};
		};
		const findGenericExplanation = (id) => {
			const genericExplanation = expertApproachData?.find(
				(item) => item?.stationId === id,
			)?.result?.Generic_Explanation;
			return genericExplanation || "";
		};

		// const formatEhrData = (data, id) => {
		// 	const tempData = Object?.entries(data)?.reduce((acc, [key, value]) => {
		// 		if (stationMap?.[id]?.ehr_config?.includes(key)) {
		// 			acc[key] = jsonToHtml(value);
		// 		}
		// 		return acc;
		// 	}, {});
		// 	return transformTopLevelKeys(tempData) || {};
		// };

		const { Full_Name, Date_Of_Birth, Gender } =
			response?.Past_Encounter_EHR?.Patient_Overview || {};
		const nameParts = Full_Name?.split(" ") || [];
		const firstName = nameParts[0] || "";
		const lastName = nameParts.slice(1).join(" ") || "";
		const description =
			jsonToHtml(
				response?.Current_Encounter_EHR?.Subjective
					?.Chief_Concern_And_Visit_Context,
			) || "";
		const applicable_types = data?.selectedStations;
		// const caseName = response?.Case_Title || "";
		const specialization = data?.specialization;
		const stations = data?.selectedStations?.reduce((acc, item) => {
			const stationType = selectedStationsData?.idToTypeMap[item];
			acc[item] = {
				scoreRange: { min: 1, max: 10 },
				caseObjectives: formatObjectivesData(
					rubrics_response?.[stationType]?.Objectives,
				),
				rubrics: formatRubricsData(rubrics_response?.[stationType]?.Rubric),
				task: String(rubrics_response?.[stationType]?.Task),
				// ehrData: formatEhrData(response?.EHR, item),
				expertApproach: formatExpertApproachData(item),
				genericExplanation: findGenericExplanation(item),
			};
			return acc;
		}, {});
		return {
			firstName,
			lastName,
			applicable_types,
			// caseName,
			specialization,
			stations,
			// ehrData:response?.EHR,
			dob: Date_Of_Birth,
			gender: Gender?.toLowerCase(),
			description,
			cdss_request: true,
			objective_auto_check: true,
		};
	};
	const generateTranscriptPayload = (
		selectedStationsData,
		ehr_data,
		case_details,
	) => {
		let stations = "";
		let ehr_details = {};
		const selectedStations = selectedStationsData?.selectedTypes;
		if (
			selectedStations?.length > 1 ||
			selectedStations?.length < 1 ||
			(selectedStations?.length === 1 &&
				selectedStations[0] === FOCUSED_HISTORY)
		) {
			return null;
		}
		if (selectedStations[0] === FOCUSED_PHYSICAL_EXAMINATION) {
			stations = FOCUSED_HISTORY;
		} else {
			stations = `${FOCUSED_PHYSICAL_EXAMINATION}, ${FOCUSED_HISTORY}`;
		}
		const {
			Family_History,
			Medications,
			Past_Medical_History,
			Social_History,
			Allergies,
		} = ehr_data?.Current_Encounter_EHR?.Medical_And_Social_Background || {};
		const { Vital_Signs } = ehr_data?.Current_Encounter_EHR?.Objective || {};
		ehr_details = {
			Family_History,
			Medications,
			Past_Medical_History,
			Social_History,
			Allergies,
			Vital_Signs,
			demographics: {
				DOB: case_details?.dob || "",
				appearance: case_details?.appearance || "",
			},
		};
		return {
			stations,
			ehr_details,
		};
	};

	const handleProceed = async () => {
		if (
			data?.specialization?.length &&
			data?.selectedStations?.length &&
			data?.context?.length <= 150
		) {
			try {
				setErrorMessage("");
				setIsCaseCreationLoading(true);
				setLoading((prev) => ({ ...prev, proceedLoading: true }));
				const selectedStationsData = stationList?.reduce(
					(acc, station) => {
						acc.idToTypeMap[station.id] = station.type;
						if (data?.selectedStations?.includes(station.id)) {
							acc.selectedTypes.push(station.type);
						}
						return acc;
					},
					{ idToTypeMap: {}, selectedTypes: [] },
				);
				selectedStationsData?.selectedTypes.map((station) => {
					setStepStatus((prev) => ({
						...prev,
						[`rubrics-for-station-${station}`]: {
							label: `Generating rubrics for station ${station}`,
							status: "loading",
						},
					}));
				});
				let response = {};
				let rubrics_response = {};
				let randomLetters = new Set();
				while (randomLetters.size < 8) {
					randomLetters.add(String.fromCharCode(Math.random() * 26 + 65));
				}
				randomLetters = Array.from(randomLetters);
				const specialty = data?.specialization;
				let finalStructure = {};
				if (data?.caseGenerateMethod === "formd-ai") {
					const getInitialDetailsForCase = await EXECUTE_PROMPT({
						payload: {
							stations: selectedStationsData?.selectedTypes?.join(","),
							randomLetters: randomLetters,
							specialty: specialty,
							context: data?.context,
						},
						prompt_code: "dynamic-chief-complaints-generation-new",
					});
					setStepStatusForKey("chief-complaint-creation", "done");
					let initialDetailsForCase = repairJson(
						getInitialDetailsForCase?.data,
					);
					initialDetailsForCase = isArray(initialDetailsForCase)
						? initialDetailsForCase?.[0]
						: initialDetailsForCase;

					const generateEHRData = async () => {
						const payload = {
							current_chief_complaint:
								initialDetailsForCase?.Current_Chief_Complaint,
							specialty: initialDetailsForCase?.Specialty,
							past_chief_complaint:
								initialDetailsForCase?.Previous_Chief_Complaint,
							scenario: initialDetailsForCase?.Scenario,
							patient_name: initialDetailsForCase?.Patient_Name,
							current_date: dayjs().format("MM-DD-YYYY"),
						};

						response = await EXECUTE_PROMPT({
							payload: { ...payload },
							prompt_code: "EHR-details-generation-new",
						});
						response = repairJson(response?.data);
						response = isArray(response) ? response?.[0] : response;
						return response;
					};

					const allPromises = selectedStationsData?.selectedTypes?.map(
						async (station) => {
							const rubricsPayload = {
								station,
								scenario: initialDetailsForCase?.Scenario,
							};

							const response = await EXECUTE_PROMPT({
								payload: { ...rubricsPayload },
								prompt_code: "dynamic-scoring-rubrics-generation-new",
							});

							setStepStatusForKey(`rubrics-for-station-${station}`, "done");
							return { station, response };
						},
					);
					// allPromises.push(generateEHRData());
					const ehr_Data = await generateEHRData();
					setStepStatusForKey("gen-ehr-data", "done");

					const transcriptPayload = generateTranscriptPayload(
						selectedStationsData,
						ehr_Data,
						initialDetailsForCase,
					);

					const generateTranscript = () => {
						if (!transcriptPayload) {
							return new Promise((resolve) => {
								resolve(null);
							});
						}
						return EXECUTE_PROMPT({
							payload: {
								...transcriptPayload,
								scenario: initialDetailsForCase?.Scenario,
								current_chief_complaint:
									initialDetailsForCase?.Current_Chief_Complaint,
							},
							prompt_code: "history-and-examination-transcript-generator",
						});
					};

					const [
						transcriptResponse,
						expertApproachResponses,
						allGeneratedData,
					] = await Promise.all([
						generateTranscript(),
						startExpertApproach({
							stations: selectedStationsData,
							chief_complaint: initialDetailsForCase?.Current_Chief_Complaint,
							scenario: initialDetailsForCase?.Scenario,
							ehr_data: ehr_Data?.Current_Encounter_EHR,
						}),
						Promise.all(allPromises),
					]);
					setStepStatusForKey("gen-expert-data", "done");

					finalStructure.expertApproachResponses = expertApproachResponses;
					rubrics_response = allGeneratedData.reduce(
						(acc, { station, response }) => {
							acc[station] = response?.data;
							return acc;
						},
						{},
					);
					finalStructure = transformData(
						response,
						rubrics_response,
						selectedStationsData,
						expertApproachResponses,
					);
					finalStructure.scenario = initialDetailsForCase?.Scenario || "";
					finalStructure.appearance =
						initialDetailsForCase?.Skin_Color?.toLowerCase() || "";
					finalStructure.caseName = initialDetailsForCase?.Case_Title || "";
					finalStructure.currentChiefComplaint =
						initialDetailsForCase?.Current_Chief_Complaint || "";
					finalStructure.pastChiefComplaint =
						initialDetailsForCase?.Previous_Chief_Complaint || "";
					finalStructure.visibility = "public";
					finalStructure.ehrTabMapper = ehrTabs;
					finalStructure.ehrData = ehr_Data; // Use ehr_Data instead of ehrData
					finalStructure.current_chief_complaint =
						initialDetailsForCase?.Current_Chief_Complaint;
					finalStructure.isCaseEditable = true;
					if (transcriptResponse?.data) {
						finalStructure.transcript = marked(transcriptResponse?.data);
					}
				} else {
					finalStructure = {
						chief_complaint: "",
						ehr_data: "",
						isCaseEditable: true,
						applicable_types: data?.selectedStations,
						caseName: "",
						description: "",
						dob: null,
						firstName: "",
						gender: "",
						lastName: "",
						visibility: "public",
						additional_prompt: "",
						cdss_request: true,
						objective_auto_check: true,
						ehrTabMapper: ehrTabs,
						ehrData: {
							Current_Encounter_EHR: {
								Patient_Overview: {
									Full_Name: "",
									Date_Of_Birth: "",
									Age: "",
									Gender: "",
									Encounter_Date: null,
									Visit_Type: "Follow-up",
									Marital_Status: "",
									Occupation: "",
								},
								Subjective: {
									Chief_Concern_And_Visit_Context: {
										Chief_Complaint: "",
										Reason_For_Visit: "",
									},
									History_Of_Present_Illness: {
										Narrative: "",
										Symptom_Overview_And_History: {
											OLDCARTS: [
												{
													Description: "",
													Onset: "",
													Location: "",
													Duration: "",
													Characteristics: "",
													Aggravating: "",
													Relieving: "",
													Timing: "",
													Severity: "",
												},
											],
										},
									},
									Review_Of_Systems: {
										General: "",
										HEENT: "",
										Cardiovascular: "",
										Respiratory: "",
										Gastrointestinal: "",
										Genitourinary: "",
										Musculoskeletal: "",
										Neurological: "",
										Integumentary: "",
										Psychiatric: "",
										Endocrine: "",
										Hematologic_Lymphatic: "",
										Immunologic: "",
										Anyother: "",
									},
								},
								Medical_And_Social_Background: {
									Past_Medical_History: {
										Chronic_Conditions: "",
										Childhood_Illnesses: "",
									},
									Surgical_History: {
										Surgeries: [
											{
												Surgery_Type: "",
												Date: null,
												Outcome: "",
											},
										],
										Hospital_Admissions: [
											{
												Reason: "",
												Admission_Date: null,
												Discharge_Date: null,
											},
										],
									},
									Medications: [],
									Allergies: {
										Drug_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Severity: "",
												Onset: "",
												Last_Occurrence: "",
											},
										],
										Food_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Severity: "",
												Onset: "",
												Last_Occurrence: "",
											},
										],
										Environmental_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Seasonality: "",
												Management: "",
											},
										],
										Other_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Severity: "",
												Onset: "",
												Last_Occurrence: "",
											},
										],
									},
									Preventive_Health_And_Immunizations: {
										Preventive_Health_Tips: "",
										Immunizations_Status: "",
									},
									Social_History: {
										Addiction: "",
										Sexual_Activity: "",
										Living_Situation: "",
										Academic_Or_Occupational_Details: "",
										Lifestyle: {
											Exercise: "",
											Diet: "",
											Other: "",
										},
									},
									Family_History: [
										{
											Relation: "",
											Genetic_Conditions: "",
											Full_Name: "",
										},
									],
								},
								Objective: {
									Vital_Signs: {
										Blood_Pressure: "",
										Heart_Rate: "",
										Respiratory_Rate: "",
										Temperature: "",
										Oxygen_Saturation: "",
										Height: "",
										Weight: "",
										BMI: "",
										Pain_Level: "",
									},
									Physical_Exam: {
										General_Appearance: "",
										HEENT_Neck: "",
										Cardiovascular: "",
										Respiratory: "",
										GI: "",
										GU: "",
										MSK: "",
										Neurological: "",
										Skin: "",
										Psych: "",
									},
								},
								Clinical_Reasoning: {
									Assessment: {
										Clinical_Summary: "",
										Differential_Diagnosis: "",
										Primary_Diagnosis: "",
										Problem_List: "",
									},
									Plan: {
										Tests_Or_Imaging: "",
										Treatment: [
											{
												Rx: "",
												Procedure: "",
											},
										],

										Education_Provided: "",
										Follow_Up_Instructions: "",
										Referrals: "",
									},
								},
							},
							Past_Encounter_EHR: {
								Patient_Overview: {
									Full_Name: "",
									Date_Of_Birth: "",
									Age: "",
									Gender: "",
									Encounter_Date: null,
									Visit_Type: "Initial",
									Marital_Status: "",
									Occupation: "",
								},
								Subjective: {
									Chief_Concern_And_Visit_Context: {
										Chief_Complaint: "",
										Reason_For_Visit: "",
									},
									History_Of_Present_Illness: {
										Narrative: "",
										Symptom_Overview_And_History: {
											OLDCARTS: [
												{
													Description: "",
													Onset: "",
													Location: "",
													Duration: "",
													Characteristics: "",
													Aggravating: "",
													Relieving: "",
													Timing: "",
													Severity: "",
												},
											],
										},
									},
									Review_Of_Systems: {
										General: "",
										HEENT: "",
										Cardiovascular: "",
										Respiratory: "",
										Gastrointestinal: "",
										Genitourinary: "",
										Musculoskeletal: "",
										Neurological: "",
										Integumentary: "",
										Psychiatric: "",
										Endocrine: "",
										Hematologic_Lymphatic: "",
										Immunologic: "",
										Anyother: "",
									},
								},
								Medical_And_Social_Background: {
									Past_Medical_History: {
										Chronic_Conditions: "",
										Childhood_Illnesses: "",
									},
									Surgical_History: {
										Surgeries: [
											{
												Surgery_Type: "",
												Date: null,
												Outcome: "",
											},
										],
										Hospital_Admissions: [
											{
												Reason: "",
												Admission_Date: null,
												Discharge_Date: null,
											},
										],
									},
									Medications: [],
									Allergies: {
										Drug_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Severity: "",
												Onset: "",
												Last_Occurrence: "",
											},
										],
										Food_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Severity: "",
												Onset: "",
												Last_Occurrence: "",
											},
										],
										Environmental_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Seasonality: "",
												Management: "",
											},
										],
										Other_Allergies: [
											{
												Substance: "",
												Reaction: "",
												Severity: "",
												Onset: "",
												Last_Occurrence: "",
											},
										],
									},
									Preventive_Health_And_Immunizations: {
										Preventive_Health_Tips: "",
										Immunizations_Status: "",
									},
									Social_History: {
										Addiction: "",
										Sexual_Activity: "",
										Living_Situation: "",
										Academic_Or_Occupational_Details: "",
										Lifestyle: {
											Exercise: "",
											Diet: "",
											Other: "",
										},
									},
									Family_History: [
										{
											Relation: "",
											Genetic_Conditions: "",
											Full_Name: "",
										},
									],
								},
								Objective: {
									Vital_Signs: {
										Blood_Pressure: "",
										Heart_Rate: "",
										Respiratory_Rate: "",
										Temperature: "",
										Oxygen_Saturation: "",
										Height: "",
										Weight: "",
										BMI: "",
										Pain_Level: "",
									},
									Physical_Exam: {
										General_Appearance: "",
										HEENT_Neck: "",
										Cardiovascular: "",
										Respiratory: "",
										GI: "",
										GU: "",
										MSK: "",
										Neurological: "",
										Skin: "",
										Psych: "",
									},
								},
								Clinical_Reasoning: {
									Assessment: {
										Clinical_Summary: "",
										Differential_Diagnosis: "",
										Primary_Diagnosis: "",
										Problem_List: "",
									},
									Plan: {
										Tests_Or_Imaging: "",
										Treatment: [
											{
												Rx: "",
												Procedure: "",
											},
										],

										Education_Provided: "",
										Follow_Up_Instructions: "",
										Referrals: "",
									},
								},
							},
						},
						stations: data?.selectedStations.reduce((acc, item) => {
							acc[item] = {
								scoreRange: { min: 1, max: 10 },
								caseObjectives: [],
								expertApproach: {},
								rubrics: [],
								task: "",
							};
							return acc;
						}, {}),
					};
				}
				setInitializeCaseData({
					...data,
					...finalStructure,
				});
				setIsCaseCreationLoading(false);
				resetStepStatus();
			} catch (e) {
				console.error(e);
			} finally {
				setStepStatus((prev) => {
					const newStatus = { ...prev };
					Object.keys(newStatus).map((key) => {
						if (newStatus[key].status === "loading") {
							newStatus[key].status = "error";
						}
					});
					return newStatus;
				});
				setLoading((prev) => ({ ...prev, proceedLoading: false }));
			}
		} else {
			setErrorMessage("To proceed it required station and specialty");
			if (
				data?.specialization?.length &&
				data?.selectedStations?.length &&
				data?.context?.length > 150
			) {
				setErrorMessage(
					"Maximum 150 characters allowed for additional details.",
				);
			}
		}
	};

	const hasCasecreationArray = useMemo(
		() => Object.values(stepStatus).some((step) => step.status === "error"),
		[stepStatus],
	);

	return (
		<>
			<Dialog
				open={open}
				maxWidth={"md"}
				fullWidth
				TransitionComponent={Transition}
				// onClose={handleClose}
				sx={{
					".MuiDialog-paper": {
						borderRadius: "1rem",
					},
				}}
			>
				{isCaseCreationLoading && (
					<div
						className="d-flex flex-column text-center justify-content-center align-items-center w-100 h-100 position-absolute"
						style={{ backgroundColor: "rgba(255,255,255,0.6)", zIndex: 10 }}
					>
						<Box
							className="shadow-sm overflow-auto"
							style={{
								width: "70%",
								padding: "0.5rem",
								borderRadius: "2em",
								maxHeight: "70%",
								backgroundColor: "white",
							}}
						>
							{!hasCasecreationArray &&
								Object.entries(stepStatus).map(([key, { label, status }]) => (
									<div
										key={key}
										style={{
											display: "flex",
											alignItems: "center",
											width: "100%",
											padding: "10px",
											borderRadius: "10px",
										}}
									>
										{status === "loading" && (
											<CircularProgress size={20} style={{ marginRight: 8 }} />
										)}
										{status === "done" && (
											<CheckCircleIcon
												style={{ color: green[500], marginRight: 8 }}
											/>
										)}
										{status === "error" && (
											<ErrorIcon style={{ color: red[500], marginRight: 8 }} />
										)}
										<span
											style={{
												color:
													status === "error"
														? red[500]
														: status === "done"
															? green[700]
															: grey[800],
											}}
										>
											{label}
										</span>
									</div>
								))}
							{/* Error notice and OK button */}
							{hasCasecreationArray && (
								<>
									{Object.entries(stepStatus)
										.filter(([_, { status }]) => status === "error")
										.map(([key, { label }]) => (
											<div
												key={key}
												style={{
													display: "flex",
													alignItems: "center",
													width: "100%",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<ErrorIcon
													style={{ color: red[500], marginRight: 8 }}
												/>
												<span style={{ color: red[500] }}>{label}</span>
											</div>
										))}
									<div
										style={{
											marginTop: 32,
											textAlign: "center",
											backgroundColor: "white",
											padding: "0.5rem",
											borderRadius: "2em",
										}}
									>
										<div
											style={{
												color: red[700],
												fontWeight: 600,
												fontSize: "0.8rem",
												marginBottom: 3,
											}}
										>
											Unexpected issue while creating case. Please start again.
										</div>
										<button
											type="button"
											style={{
												padding: "0.25rem 0.75rem",
												borderRadius: 8,
												border: "none",
												background: red[500],
												color: "#fff",
												fontWeight: 600,
												fontSize: "1rem",
												cursor: "pointer",
											}}
											onClick={() => {
												setIsCaseCreationLoading(false);
												resetStepStatus();
											}}
										>
											ok
										</button>
									</div>
								</>
							)}
						</Box>
					</div>
				)}
				<DialogTitle>
					<div className="d-flex justify-content-between align-items-center">
						<Typography fontSize={"1.2rem"}>Create Case</Typography>
						<div>
							<IconButton
								fontSize="1.5rem"
								onClick={() => {
									handleClose();
									setErrorMessage("");
									setData(initialData);
								}}
								className="p-0"
								disabled={loading?.initialLoading || loading?.proceedLoading}
							>
								<Close sx={{ fontSize: "1.5rem" }} />
							</IconButton>
						</div>
					</div>
				</DialogTitle>
				<DialogContent dividers>
					<div className="d-flex align-items-center gap-3">
						<div>
							<Typography fontSize={"1rem"} fontWeight={"bold"}>
								Generate
							</Typography>
							<UIRadioGroup
								name="caseGenerateMethod"
								value={data?.caseGenerateMethod}
								onChange={handleModeChange}
								options={[
									{ value: "formd-ai", label: "Generate using FORMD AI" },
									{ value: "manual", label: "Manual" },
								]}
								disabled={loading?.initialLoading || loading?.proceedLoading}
							/>
						</div>
						{/* <div>
							<Typography fontSize={"1rem"} fontWeight={"bold"}>
								Type
							</Typography>
							<UIRadioGroup
								name="caseGenerationType"
								value={data?.caseGenerationType}
								onChange={handleCaseTypeChange}
								options={[
									{ value: "individual", label: "Individual" },
									{ value: "fullCase", label: "Full Case" },
								]}
								disabled={loading?.initialLoading || loading?.proceedLoading}
							/>
						</div> */}
					</div>
					<div className="mt-2 w-100">
						<Grid container spacing={1} className="justify-content-between">
							<Grid item xs={12} sm={5.9}>
								<UISelectField
									label="Select Station"
									isRequired={true}
									name="caseGenerationType"
									multiple={false}
									value={data?.caseGenerationType}
									onChange={handleCaseTypeChange}
									options={[
										{ value: "individual", label: "Single Station" },
										{ value: "fullCase", label: "Full Case" },
									]}
									disabled={loading?.initialLoading || loading?.proceedLoading}
								/>
							</Grid>
							<Grid item xs={12} sm={5.9}>
								<UISelectField
									label="Specialty"
									isRequired={true}
									name="specialization"
									multiple={false}
									value={data?.specialization}
									onChange={handleChange}
									options={specializations}
									disabled={loading?.initialLoading || loading?.proceedLoading}
								/>
							</Grid>
							{data?.caseGenerateMethod !== "manual" && (
								<Grid item xs={12}>
									<UIInputField
										value={data?.context}
										label="Additional Details for Case Generation"
										name="context"
										onChange={handleChange}
										disabled={
											loading?.initialLoading || loading?.proceedLoading
										}
									/>
								</Grid>
							)}
						</Grid>
					</div>
					<div className="mt-2 me-3">
						<div className="d-flex gap-2">
							<Typography fontSize={"1rem"} fontWeight={"bold"}>
								Select Stations
							</Typography>
							<FormHelperText error={!!errorMessage}>
								{errorMessage}
							</FormHelperText>
						</div>

						{loading?.initialLoading ? (
							<Grid container spacing={2}>
								{[1, 2, 3, 4, 5, 6, 7, 8]?.map((item) => (
									<Grid key={item} item xs={12} sm={5.9}>
										<Stack spacing={1}>
											<Skeleton variant="rounded" width={"100%"} height={60} />
										</Stack>
									</Grid>
								))}
							</Grid>
						) : (
							<div className="mt-2">
								<FormGroup>
									<Grid
										container
										spacing={2}
										className="justify-content-between"
									>
										{stationList?.map((item) => (
											<Grid
												className="ps-0"
												item
												xs={12}
												sm={5.9}
												key={item?.type}
											>
												<div className="d-flex">
													<FormControlLabel
														className="border main-bg-color rounded-4 p-2 py-2"
														sx={{
															width: "100%",
															"&:hover":
																loading?.initialLoading ||
																loading?.proceedLoading
																	? ""
																	: {
																			border: "1px solid rgba(88, 64, 186, 1)",
																			boxShadow:
																				"0 0 10px rgba(88, 64, 186, 0.5)",
																		},
															transition: "all 0.3s",
															borderColor: "transparent !important",
															".MuiTypography-root": { width: "100%" },
														}}
														disabled={
															loading?.initialLoading ||
															loading?.proceedLoading ||
															data?.caseGenerationType === "fullCase"
														}
														control={
															data?.caseGenerationType === "individual" ? (
																<Radio
																	checked={data?.selectedStations?.includes(
																		item?.id,
																	)}
																	onChange={handleChange}
																	value={item?.id}
																	name="selectedStations"
																	disabled={
																		loading?.initialLoading ||
																		loading?.proceedLoading
																	}
																	sx={{
																		"&.Mui-checked": {
																			color: "rgba(88, 64, 186, 1)",
																		},
																	}}
																/>
															) : (
																<Checkbox
																	checked={data?.selectedStations?.includes(
																		item?.id,
																	)}
																	onChange={handleChange}
																	value={item?.id}
																	name="selectedStations"
																	disabled={
																		loading?.initialLoading ||
																		loading?.proceedLoading
																	}
																	sx={{
																		"&.Mui-checked": {
																			color: "rgba(88, 64, 186, 1)",
																		},
																	}}
																/>
															)
														}
														label={
															<div className="d-flex align-items-center w-100 gap-2">
																<div className="ms-1">
																	<img
																		src={getIconByStationType(item?.type)}
																		alt={"loading"}
																		style={{ width: 40, height: 40 }}
																	/>
																</div>
																<Typography
																	variant="body2"
																	fontSize={"0.8rem"}
																	fontWeight={"bold"}
																>
																	{item?.type}
																</Typography>
															</div>
														}
														labelPlacement="start"
													/>
												</div>
											</Grid>
										))}
									</Grid>
								</FormGroup>
							</div>
						)}
					</div>

					{data?.caseGenerateMethod === "formd-ai" && <Disclaimer />}
				</DialogContent>
				<DialogActions className="d-flex justify-content-between p-3">
					{loading?.proceedLoading ? (
						<Box sx={{ width: "100%" }}>
							<Typography className="text-center mb-2 fw-bold">
								Generating Case Using FORMD AI
							</Typography>
							<LinearProgress />
						</Box>
					) : (
						<>
							<UIButton
								onClick={() => {
									handleClose();
									setErrorMessage("");
									setData(initialData);
								}}
								fullWidth
								className="w-100 py-2 rounded-pill"
								text="Cancel"
								disabled={loading?.initialLoading || loading?.proceedLoading}
							/>
							<UIButton
								onClick={handleProceed}
								fullWidth
								className="w-100 py-2 rounded-pill"
								variant="contained"
								text="Proceed"
								disabled={loading?.initialLoading || loading?.proceedLoading}
							/>
						</>
					)}
				</DialogActions>
			</Dialog>
		</>
	);
};

export default InitializeCaseForm;
