import {
	CREATE_ATTEMPT,
	CREATE_CASE_SCORE,
	UPDATE_ATTEMPT_BY_ID,
} from "adapters/noki_ed.service";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import {
	// convertCaseDetailsToString,
	generateFormScoreHelper,
	repairJson,
} from "helpers/common_helper";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import {
	getAssessmentPlanData,
	getDiagnosticTestsData,
	getFocusedHistoryData,
	getFocusedPhysicalExaminationData,
	getSOAPNoteData,
} from "helpers/stationBasedContentBuilder";
import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const progressSteps = [
	"Analyzing Conversation...",
	"Identifying Strengths...",
	"Highlighting Areas of Improvement...",
	"Analysing Communication Skills...",
	"Calculating Score...",
	"Generating Score...",
];

const calculateScore = (rubrics, type) => {
	let score = rubrics?.[type]?.Sections?.reduce((total, section) => {
		const sectionScore = section?.Criteria?.reduce(
			(sectionTotal, criteria) =>
				sectionTotal + (Number.parseInt(criteria?.Score) || 0),
			0,
		);
		return total + sectionScore / section?.Criteria?.length;
	}, 0);

	score = score / rubrics?.[type]?.Sections?.length;
	score = Number.isNaN(score) ? "0.00" : score.toFixed(2);
	return score;
};
const stationRequiresTranscript = [
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
];
const contentBasedOnComponent = {
	[DIAGNOSTIC_TESTS]: getDiagnosticTestsData,
	[SOAP_NOTE]: getSOAPNoteData,
	[ASSESSMENT_PLAN]: getAssessmentPlanData,
	[FOCUSED_HISTORY]: getFocusedHistoryData,
	[FOCUSED_PHYSICAL_EXAMINATION]: getFocusedPhysicalExaminationData,
};

const generateRubricsPayload = (station, data) => {
	if (station === FOCUSED_HISTORY || station === FOCUSED_PHYSICAL_EXAMINATION) {
		return {
			prompt_code: "transcript-and-notes-based-rubrics-analysis",
			payload: {
				transcript: data?.transcript,
				notes: data?.notes?.studentData,
			},
		};
	}
	if (
		station === ASSESSMENT_PLAN ||
		station === DIAGNOSTIC_TESTS ||
		station === SOAP_NOTE
	) {
		return {
			prompt_code: "notes-based-rubrics-analysis",
			payload: { notes: data?.notes?.studentData },
		};
	}
	return {
		prompt_code: "transcript-based-rubrics-analysis",
		payload: { transcript: data?.transcript },
	};
};
const generateExpertAnalysisPayload = (station, data, applicableTypes) => {
	switch (station) {
		case FOCUSED_HISTORY:
			return {
				student_oldcarts: data?.studentData,
				expert_oldcarts: data?.expertData?.OLDCARTS,
			};
		case FOCUSED_PHYSICAL_EXAMINATION:
			return {
				student_exam_findings: data?.studentData,
				expert_exam_findings: data?.expertData?.PETests,
			};
		case ASSESSMENT_PLAN:
			return {
				student_differentials: data?.studentData,
				expert_differentials: data?.expertData,
			};
		case DIAGNOSTIC_TESTS:
			return {
				expert_tests: data?.expertData?.diagnostics,
				expert_final_diagnosis: data?.expertData?.finalDiagnosis,
				student_tests: data?.studentData?.diagnostics,
				student_final_diagnosis: data?.studentData?.finalDiagnosis,
				...(applicableTypes?.length === 1 && {
					expert_differentials: data?.studentData?.differentials,
					student_differentials: data?.expertData?.differentials,
				}),
			};
		case SOAP_NOTE:
			return {
				expert_soap_note: data?.expertData?.soapNote,
				student_soap_note: data?.studentData,
			};
		default:
			return {};
	}
};
const useScoreGenerator = (caseAttemptRef) => {
	const [isLoading, setIsLoading] = useState(false);
	const [loadingText, setLoadingText] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const transcriptRef = useRef();
	const { getValues } = useFormContext();
	const {
		id,
		currentStationId,
		// description,
		visibility: caseVisibility,
		fhir_patient_id,
		ehrData,
		stations,
		scenario,
		osceType,
		attemptId,
		applicable_types,
		nextStationDetails,
		questionnaireId,
		currentChiefComplaint,
		_timeTaken,
		student = {},
	} = getValues();
	const {
		// notes,
		// Current_Encounter_EHR,
		encounterId,
		observationId,
		// expertApproach,
	} = student;
	// const differentials = expertApproach?.differentials || [];

	const { stationMap } = useSelector((state) => state.stations);
	const practitionerId = useSelector(
		(state) => state?.auth?.personData?.fhir_practitioner_id,
	);
	const { transcription } = useSelector((state) => state.speech);
	const navigate = useNavigate();
	//go out
	const generateTranscriptScoreHelper = async () => {
		const mappedString = transcriptRef.current?.length
			? transcriptRef.current
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
	//go out
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
	const progressInterval = (step) => {
		let currentStep = step;
		const interval = setInterval(() => {
			setLoadingText(progressSteps[currentStep]);
			currentStep++;
			if (currentStep >= progressSteps.length) {
				clearInterval(interval);
			}
		}, 5000);
		return interval;
	};
	const generateScore = async (content = "", isTranscriptRequired = true) => {
		try {
			setIsLoading(true);
			const interval = progressInterval(0);
			const data = {};
			if (content) {
				data.notes = content;
				const { error, notes } = await generateFormScoreHelper(
					content?.studentData,
				);
				if (error) {
					data.notes.studentData = notes;
					if (!isTranscriptRequired) {
						setErrorMessage(error);
						clearInterval(interval);
						return;
					}
				}
			}
			if (isTranscriptRequired) {
				data.transcript = await generateTranscriptScoreHelper();
				if (data?.transcript?.error) {
					setErrorMessage(data.error);
					clearInterval(interval);
					return;
				}
			}

			const station = stationMap?.[currentStationId]?.type;
			// const stringifiedCaseDescription = convertCaseDetailsToString({
			// 	description,
			// });
			// let case_details=null;
			// if (
			// 	station === "Diagnostic Tests" ||
			// 	station === "Patient Education" ||
			// 	station === "SOAP NOTE"
			// ) {
			// 	case_details = {
			// 		description: stringifiedCaseDescription,
			// 		...ehrData.Current_Encounter_EHR,
			// 	};
			// } else {
			// 	case_details = stringifiedCaseDescription;
			// }
			const rubrics = stations?.[currentStationId]?.rubrics;
			let evaluated_rubrics;
			if (rubrics) {
				const payload = generateRubricsPayload(station, data);
				payload.payload = {
					...payload.payload,
					station,
					rubrics,
					scenario,
				};
				const response = await EXECUTE_PROMPT({
					...payload,
				});
				evaluated_rubrics = repairJson(response?.data);
				// setRubricsData(evaluated_rubrics?.[station]);
				// setScore(finalScore);
			}
			const score = calculateScore(evaluated_rubrics, station);
			const {
				Past_Medical_History,
				Medications,
				Family_History,
				Social_History,
				Allergies,
			} = ehrData?.Current_Encounter_EHR?.Medical_And_Social_Background ?? {};
			const payload = generateExpertAnalysisPayload(
				station,
				data?.notes,
				applicable_types,
			);
			payload.ehr_details = {
				Past_Medical_History,
				Medications,
				Family_History,
				Social_History,
				Allergies,
			};
			payload.current_chief_complaint = currentChiefComplaint;
			let { data: promptData } = await EXECUTE_PROMPT({
				prompt_code: stationMap?.[currentStationId]?.prompt_code,
				payload,
			});
			promptData = repairJson(promptData);
			const error = validatePromptResponse(promptData);
			if (error) {
				console.error(error);
				setErrorMessage(error);
				clearInterval(interval);
				return;
			}
			return await createCaseScore(
				promptData,
				data,
				evaluated_rubrics?.[station],
				score,
			);
		} catch (error) {
			console.error("Error in generateScore:", error);
		} finally {
			setIsLoading(false);
			setLoadingText("");
		}
	};
	const createCaseScore = async (
		generatedScore,
		cleanedTranscript,
		rubrics,
		calculatedScore,
	) => {
		setIsLoading(true);
		let attemptResponse;
		if (!attemptId && (osceType === "case" || osceType === "station")) {
			//create an attempt for case to status completed and reviewStatus Todo
			attemptResponse = await CREATE_ATTEMPT({
				caseId: id,
				practitionerId: practitionerId,
				status: "completed",
				reviewStatus: caseVisibility === "private" ? "todo" : "completed",
				attemptType: caseVisibility,
			});
		}
		const caseAttemptFrom =
			osceType === "multi" ? "multi-station-case" : osceType;
		const notes = getValues("student.notes");
		const ehr = getValues("student.Current_Encounter_EHR");
		const differentials = getValues("student.expertApproach.differentials");
		const caseScorePayload = {
			patientId: fhir_patient_id,
			practitionerId: practitionerId,
			questionnaireId: questionnaireId,
			stationId: currentStationId,
			// status: "completed",
			type: caseAttemptFrom,
			caseType: caseVisibility,
			data: {
				caseScore: {
					value: { ...generatedScore, "Overall Score": calculatedScore },
				},
				rubrics: { value: rubrics },
				transcript: {
					value: transcriptRef?.current,
				},
				cleanedTranscript: { value: cleanedTranscript },
				timeTaken: getValues("timeTaken"),
				stationDetails: stationMap?.[currentStationId],
				...(notes?.length > 0 && { notes }),
				differentials,
				ehrData: ehr,
			},
		};
		if (encounterId) {
			caseScorePayload.encounterId = encounterId;
		}
		if (observationId) {
			caseScorePayload.observationId = observationId;
		}
		let isNextStation = false;
		if (caseVisibility === "private") {
			caseScorePayload.feedbackState = "pending";
		}
		if (attemptId && attemptId !== "null") {
			caseScorePayload.attemptId = attemptId;
			switch (osceType) {
				case "circuit":
					{
						const { unAttemptedCase } = nextStationDetails;
						const casesLeft = unAttemptedCase - 1;
						caseScorePayload.casesLeft = casesLeft;
						isNextStation = casesLeft > 0;
					}
					break;
				case "multi":
					{
						const { completed_stations = [], selected_stations } =
							nextStationDetails;
						const casesLeft =
							selected_stations?.length - (completed_stations?.length || 0) - 1;
						caseScorePayload.casesLeft = casesLeft;
						isNextStation = casesLeft > 0;
					}
					break;
			}
		}
		if (attemptResponse?.data?.id) {
			caseScorePayload.attemptId = attemptResponse.data.id;
		}
		try {
			const response = await CREATE_CASE_SCORE(caseScorePayload);
			if (
				attemptId &&
				attemptId !== "null" &&
				osceType === "circuit" &&
				nextStationDetails?.unAttemptedCase === 1
			) {
				await UPDATE_ATTEMPT_BY_ID(attemptId, { status: "completed" });
			}
			navigate(
				`/feedback?scoreId=${response?.data?.id}&attemptId=${attemptId}&type=${caseAttemptFrom}&isNextStation=${isNextStation}`,
			);
			return response?.data;
		} catch (error) {
			console.error("Error in createCaseScore:", error);
		} finally {
			transcriptRef.current = [];
			setIsLoading(false);
		}
	};
	const handlePauseRecording = useCallback(() => {
		caseAttemptRef.current?.handlePauseRecording();
	}, [caseAttemptRef]);
	const handleResumeRecording = useCallback(() => {
		caseAttemptRef.current?.handleResumeRecording();
	}, [caseAttemptRef]);
	const handleStopRecording = useCallback(
		async (isSoftEnd = false, station = "") => {
			transcriptRef.current = transcription;
			caseAttemptRef.current?.handleStopRecording();
			if (isSoftEnd) {
				await generateScore();
				return;
			}
			if (station) {
				const formValues = getValues();
				const contentGenerator = contentBasedOnComponent?.[station];

				if (!contentGenerator) {
					setErrorMessage("No content available for this station.");
					return;
				}

				const content =
					typeof contentGenerator === "function"
						? contentGenerator(formValues)
						: contentGenerator;
				const isTranscriptRequired =
					stationRequiresTranscript?.includes(station);
				await generateScore(content, isTranscriptRequired);
				return;
			}
		},
		[
			transcription,
			// getValues,
			// generateScore,
			// setErrorMessage,
			contentBasedOnComponent,
			stationRequiresTranscript,
		],
	);
	return {
		isLoading,
		loadingText,
		errorMessage,
		handlePauseRecording,
		handleResumeRecording,
		handleStopRecording,
	};
};

export default useScoreGenerator;
