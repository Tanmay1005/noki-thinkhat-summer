import { CASE_RAG_QUERY_BY_TYPE } from "adapters/ai_tutor.service";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import { jsonToHtml, repairJson } from "helpers/common_helper";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import { v4 as uuidv4 } from "uuid";
const expertApproachStations = [
	FOCUSED_PHYSICAL_EXAMINATION,
	FOCUSED_HISTORY,
	DIAGNOSTIC_TESTS,
	ASSESSMENT_PLAN,
	SOAP_NOTE,
];
let final_differential_diagnosis = [];
let filtered_ehr = {};
let differentials_for_diagnostic_tests = [];

const transformDataForFinalDiagnosis = (data) => {
	// should transform to store differentials
	const transformedDataForFinalDiagnosis =
		data?.Recommended_Differentials_And_Ranking.sort(
			(a, b) => a?.rank - b?.rank,
		).map((item) => item?.diagnosis || "");
	return transformedDataForFinalDiagnosis;
};

const focused_history_flow = async (data) => {
	const { chief_complaint, stationId } = data;

	const response = await EXECUTE_PROMPT({
		prompt_code: "focused-history-expert-approach",
		payload: {
			current_chief_complaint: chief_complaint,
		},
	});
	const result = repairJson(response?.data);

	return { stationId, result };
};

const physical_examination_flow = async (data) => {
	const { chief_complaint, ehr_data, stationId } = data;

	const {
		Past_Medical_History,
		Medications,
		Family_History,
		Social_History,
		Allergies,
	} = ehr_data.Medical_And_Social_Background;

	filtered_ehr = {
		Past_Medical_History,
		Medications,
		Family_History,
		Social_History,
		Allergies,
	};

	// 1. Getting data which goes inoput for RAG
	const response = await EXECUTE_PROMPT({
		prompt_code: "rag-enhanced-physical-examination-expert-details",
		payload: {
			current_chief_complaint: chief_complaint,
			ehr_details: filtered_ehr,
		},
	});
	const data_For_RAG = repairJson(response?.data);

	// 2. Getting data from RAG
	const queryPayload = {
		query: data_For_RAG?.physical_examinations,
	};
	const dataFromQuery = await CASE_RAG_QUERY_BY_TYPE(
		"physical_examination",
		queryPayload,
	);
	const rag_data = dataFromQuery?.data?.results;
	// 3. sending the query data to prompt for final physical examination
	const physicalExaminationResponse = await EXECUTE_PROMPT({
		prompt_code: "physical-examination-expert-approach",
		payload: {
			current_chief_complaint: chief_complaint,
			ehr_details: filtered_ehr,
			rag_derived_examinations: rag_data,
		},
	});
	const result = repairJson(physicalExaminationResponse?.data);
	const updatedPhysicalExaminationResultsForForm =
		result?.Recommended_Examination_Components?.map((item) => {
			return {
				id: item?.id,
				name: item?.text,
				metadata: item?.metadata || {},
				AI_Prompt: item?.AI_Prompt || "",
				Textual_Summary: item?.Textual_Summary || "",
				documents: [],
				audioFiles: [],
				fileId: uuidv4(),
				isExisting: false,
			};
		});

	return {
		stationId,
		result: {
			PETests: updatedPhysicalExaminationResultsForForm,
			Generic_Explanation: result?.Generic_Explanation,
		},
	};
};

const assessment_plan_flow = async (data) => {
	const { chief_complaint, ehr_data, stationId } = data;

	const {
		Past_Medical_History,
		Medications,
		Family_History,
		Social_History,
		Allergies,
	} = ehr_data.Medical_And_Social_Background;

	filtered_ehr = {
		Past_Medical_History,
		Medications,
		Family_History,
		Social_History,
		Allergies,
	};
	// 1. Getting data which goes inoput for RAG
	const response = await EXECUTE_PROMPT({
		prompt_code: "rag-enhanced-assessment-expert-details",
		payload: {
			current_chief_complaint: chief_complaint,
			ehr_details: filtered_ehr,
		},
	});
	const data_For_RAG = repairJson(response?.data);

	const differential_diagnoses = data_For_RAG?.differential_diagnoses.map(
		(diagnosis) => diagnosis?.diagnosis_name || "",
	);

	// 2. Getting data from RAG
	const queryPayload = {
		query: differential_diagnoses,
	};
	const dataFromQuery = await CASE_RAG_QUERY_BY_TYPE(
		"differential_diagnosis",
		queryPayload,
	);
	const rag_data = dataFromQuery?.data?.results;
	// 3. sending the query data to prompt for final assessment and plan
	const assessmentPlanResponse = await EXECUTE_PROMPT({
		prompt_code: "assessment-expert-approach",
		payload: {
			current_chief_complaint: chief_complaint,
			ehr_details: filtered_ehr,
			rag_derived_differentials: rag_data,
		},
	});
	const result = repairJson(assessmentPlanResponse?.data);
	const updatedResultForForm = result.Recommended_Differentials_And_Ranking.map(
		(item) => {
			return {
				snomed_id: item?.id,
				diagnosis: item?.diagnosis,
			};
		},
	);
	final_differential_diagnosis = transformDataForFinalDiagnosis(result);
	differentials_for_diagnostic_tests = updatedResultForForm;

	return {
		stationId,
		result: {
			differentials: updatedResultForForm,
			Generic_Explanation: result?.Generic_Explanation,
		},
	};
};

const diagnostic_tests_flow = async (data) => {
	const { stations, chief_complaint, stationId } = data;
	let ranked_differentials = "";
	if (stations?.selectedTypes.includes(ASSESSMENT_PLAN)) {
		ranked_differentials = final_differential_diagnosis;
	} else {
		await assessment_plan_flow(data);
		ranked_differentials = final_differential_diagnosis;
	}

	// 1. Getting data which goes inoput for RAG
	const response = await EXECUTE_PROMPT({
		prompt_code: "rag-enhanced-diagnostic-tests-expert-details",
		payload: {
			current_chief_complaint: chief_complaint,
			ehr_details: filtered_ehr,
			differentials: ranked_differentials,
		},
	});

	const data_For_RAG = repairJson(response?.data);

	const diagnostic_tests = data_For_RAG?.recommended_tests.map(
		(test) => test?.test_name || "",
	);

	// 2. Getting data from RAG
	const queryPayload = {
		query: diagnostic_tests,
	};
	const dataFromQuery = await CASE_RAG_QUERY_BY_TYPE(
		"diagnostic_tests",
		queryPayload,
	);

	// 3. sending the query data to prompt for final diagnostic tests
	const diagnosticTestsResponse = await EXECUTE_PROMPT({
		prompt_code: "diagnostic-tests-expert-approach",
		payload: {
			current_chief_complaint: chief_complaint,
			ehr_details: filtered_ehr,
			differential_diagnosis: ranked_differentials,
			rag_derived_diagnostic_tests: dataFromQuery,
		},
	});
	const result = repairJson(diagnosticTestsResponse?.data);

	const updatedDiagnosticTestResultsForForm = result?.Recommended_Tests?.map(
		(test) => {
			return {
				id: test?.id,
				loinc_num: test?.id,
				testName: test?.test_name,
				testInference: test?.textual_summary,
				fileId: uuidv4(),
				documents: [],
				isExisting: false,
			};
		},
	);
	const finalDiagnosisOptions = differentials_for_diagnostic_tests.map(
		(item) => {
			return {
				name: item?.diagnosis || "",
			};
		},
	);

	// randomizing the answer value in options

	const index =
		Math.floor(Math.random() * differentials_for_diagnostic_tests?.length) || 0;
	finalDiagnosisOptions?.splice(index, 0, {
		name: result?.Final_Diagnosis?.diagnosis_name,
	});

	const finalDiagnosis = {
		options: finalDiagnosisOptions,
		value: result?.Final_Diagnosis?.diagnosis_name || "",
	};
	const isAssessmentPlanStation =
		data?.stations?.selectedTypes?.includes(ASSESSMENT_PLAN);
	return {
		stationId,
		result: {
			tests: updatedDiagnosticTestResultsForForm,
			...(isAssessmentPlanStation
				? {}
				: { differentials: differentials_for_diagnostic_tests }),
			finalDiagnosis: { ...finalDiagnosis },
			Generic_Explanation: result?.Generic_Explanation,
		},
	};
};

const soap_note_flow = async (data) => {
	const { ehr_data, scenario, stationId } = data;
	const response = await EXECUTE_PROMPT({
		prompt_code: "soap-note-expert-approach",
		payload: {
			current_ehr_details: ehr_data,
			scenario: scenario,
		},
	});
	const result = repairJson(response?.data);
	const { soap_note, ...rest } = result;
	let vitals = soap_note?.Objective?.Vitals;
	vitals = typeof vitals === "object" ? jsonToHtml(vitals) : vitals;
	result.soap_note.Objective.Vitals = vitals;
	return {
		stationId,
		result: {
			...rest,
			soapNote: soap_note,
		},
	};
};

const stationFlowMap = {
	[FOCUSED_HISTORY]: focused_history_flow,
	[FOCUSED_PHYSICAL_EXAMINATION]: physical_examination_flow,
	[ASSESSMENT_PLAN]: assessment_plan_flow,
	[DIAGNOSTIC_TESTS]: diagnostic_tests_flow,
	[SOAP_NOTE]: soap_note_flow,
};

export const startExpertApproach = async ({
	stations,
	chief_complaint,
	ehr_data,
	scenario,
}) => {
	const data = {
		stations,
		chief_complaint,
		ehr_data,
		scenario,
	};
	const hasExpertApproachStations = stations?.selectedTypes.filter(
		(station) => {
			return (
				expertApproachStations.includes(station) && station !== DIAGNOSTIC_TESTS
			);
		},
	);
	const diagnosticTestStation =
		stations?.selectedTypes?.includes(DIAGNOSTIC_TESTS);

	// Proceed if we have either expert approach stations OR diagnostic tests
	if (hasExpertApproachStations?.length > 0 || diagnosticTestStation) {
		// Check if diagnostic tests station exists in the selected stations

		const assessmentPlanStation = hasExpertApproachStations.find(
			(station) => station === ASSESSMENT_PLAN,
		);
		const otherStations = hasExpertApproachStations.filter(
			(station) => station !== ASSESSMENT_PLAN,
		);

		// Start all processes that can run in parallel
		const stationId = Object.entries(stations.idToTypeMap).find(
			([_id, type]) => type === ASSESSMENT_PLAN,
		)?.[0];
		const assessmentPlanPromise = assessmentPlanStation
			? assessment_plan_flow({ ...data, stationId: stationId })
			: null;

		const otherStationsPromises = otherStations.map((station) => {
			const stationId = Object.entries(stations.idToTypeMap).find(
				([_id, type]) => type === station,
			)?.[0];
			const flowFunction = stationFlowMap[station];
			if (flowFunction) {
				return flowFunction({ ...data, stationId: stationId });
			}
		});

		// Start diagnostic tests after assessment plan (only if diagnostic tests station exists)
		const diagnosticTestsPromise = diagnosticTestStation
			? (async () => {
					const stationId = Object.entries(stations.idToTypeMap).find(
						([_id, type]) => type === DIAGNOSTIC_TESTS,
					)?.[0];
					if (assessmentPlanPromise) {
						await assessmentPlanPromise; // Wait only for assessment plan
					}
					return diagnostic_tests_flow({ ...data, stationId: stationId });
				})()
			: null;

		// Wait for all promises to complete
		const promisesToWait = [
			assessmentPlanPromise,
			Promise.all(otherStationsPromises),
		];

		if (diagnosticTestsPromise) {
			promisesToWait.push(diagnosticTestsPromise);
		}

		const results = await Promise.all(promisesToWait);
		const [assessmentPlanResult, otherResults, diagnosticTestsResult] = results;

		// Combine all responses in the correct order
		const expertApproachFlowResponses = [];

		// Place responses in the same order as original stations
		for (const station of hasExpertApproachStations) {
			if (station === ASSESSMENT_PLAN) {
				expertApproachFlowResponses.push(assessmentPlanResult);
			} else {
				const stationIndex = otherStations.indexOf(station);
				expertApproachFlowResponses.push(otherResults[stationIndex]);
			}
		}

		// Add diagnostic tests response only if it exists
		if (diagnosticTestStation && diagnosticTestsResult) {
			expertApproachFlowResponses.push(diagnosticTestsResult);
		}

		return expertApproachFlowResponses;
	}
};
