import {
	FIND_MULTI_STATION_ATTEMPT,
	GET_INTEGRATED_CASE,
	GET_NEXT_CASE,
} from "adapters/noki_ed.service";
import CaseDescription from "components/StudentCaseFlow/CaseDescription";
import RolePlayCaseAttempt from "components/StudentCaseFlow/RoleplayCaseAttempt";
import SkeltonLoader from "components/StudentCaseFlow/SkeltonLoader";
import VirtualCaseAttempt from "components/StudentCaseFlow/VirtualCaseAttempt";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { getStations } from "../redux/thunks/stations";
// import RolePlayCaseAttemptDifferentials from "components/StudentCaseFlow/RolePlayforDifferentials";

const StudentCaseFlow = () => {
	const methods = useForm({
		mode: "onChange",
	});
	const { reset, control, setValue } = methods;
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const { id } = useParams();
	const { data: stationList } = useSelector((state) => state.stations);
	const practitionerId = useSelector(
		(state) => state?.auth?.personData?.fhir_practitioner_id,
	);
	const reduxDispatch = useDispatch();
	const queryParams = new URLSearchParams(location.search);
	const caseId = queryParams.get("caseId");
	const osceType = queryParams.get("osceType");
	const stationId = queryParams.get("stationId");
	const attemptId = queryParams.get("attemptId");
	const isCaseValueFetched = useWatch({ control, name: "dataFetched" });
	const currentStationDetails = useWatch({
		control,
		name: "nextStationDetails",
	});
	const isRecording = useSelector((state) => state?.speech?.isRecording);
	const isPaused = useSelector((state) => state?.speech?.isPaused);

	useEffect(() => {
		if (isRecording) {
			if (isPaused) {
				setValue("isCaseEditable", false);
			} else {
				setValue("isCaseEditable", true);
			}
		}
	}, [isRecording, isPaused]);

	const Component = useMemo(() => {
		const pathname = location.pathname;

		switch (true) {
			case pathname.startsWith("/case/"):
				setValue("isCaseEditable", false);
				return <CaseDescription />;

			case pathname.startsWith("/attempt/virtual"):
				// setValue("isCaseEditable", true);
				return <VirtualCaseAttempt />;

			case pathname.startsWith("/attempt"):
				// setValue("isCaseEditable", true);
				return <RolePlayCaseAttempt />;

			default:
				return <div>Invalid path</div>;
		}
	}, [location]);

	function getLinkTextById(data, targetLinkId) {
		// Find the object with matching linkId
		const found = data.find((item) => item.linkId === targetLinkId);

		// Return the text if found, otherwise return null
		return found ? found.text : null;
	}
	const getNextStationDetails = async (visibility) => {
		switch (osceType) {
			case "circuit":
				try {
					const response = await GET_NEXT_CASE({
						id: [attemptId],
						practitionerId,
						attemptType: visibility,
					});
					return { ...response?.data?.[attemptId], attemptId };
				} catch (error) {
					console.error("ERROR getting next case details", error);
				}
				break;
			case "multi":
				try {
					const response = await FIND_MULTI_STATION_ATTEMPT({
						id: attemptId,
						status: "in progress",
						attemptType: visibility,
					});
					return response?.data?.data?.[0];
				} catch (error) {
					console.error("ERROR getting next case details", error);
				}
				break;
		}
	};
	const getFormDetails = async () => {
		try {
			setLoading(true);
			const response = await GET_INTEGRATED_CASE(id || caseId);
			const responseData = response?.data;
			let currentEHRData = {};
			let studentCurrentEHRData = {};
			let pastEHRData = {};
			let stationData = {};
			let nextStationDetails = {};
			const fhirQuestionnaireItems = responseData?.fhirQuestionnaire?.item;
			const expertAndGenericData = responseData?.questionnaireResponses?.reduce(
				(acc, questionnaire) => {
					const items = questionnaire?.resource?.item || [];
					const stationId = questionnaire?.resource?.meta?.tag?.[0]?.code;

					if (!stationId) return acc;

					const expertItem = items.find(
						(item) => item.linkId === "expert-approach",
					);
					const genericItem = items.find(
						(item) => item.linkId === "generic-explanation",
					);

					const expertApproach = expertItem
						? JSON?.parse(expertItem.answer?.[0]?.valueString || "{}")
						: null;
					const genericExplanation = genericItem
						? JSON?.parse(genericItem.answer?.[0]?.valueString || '""')
						: null;

					acc[stationId] = {
						expertApproach,
						genericExplanation,
					};

					return acc;
				},
				{},
			);
			const IGNORABLE_TABS = [
				"Patient_Overview",
				"Subjective",
				"Medical_And_Social_Background",
				"Objective",
				"Clinical_Reasoning",
				"fileId",
				"documents",
			];

			try {
				if (
					attemptId &&
					osceType !== "case" &&
					!Object.keys(currentStationDetails || {}).length
				) {
					nextStationDetails = await getNextStationDetails(
						responseData?.visibility,
					);
				}
				currentEHRData =
					responseData?.ehrData?.currentEncounter?.[0]?.resource?.extension?.[0]
						?.valueString;
				currentEHRData = JSON?.parse(currentEHRData);
				studentCurrentEHRData = {
					...currentEHRData,
					Objective: {
						Vital_Signs: currentEHRData?.Objective?.Vital_Signs,
					},
					Subjective: {},
					Medical_And_Social_Background: {},
					Clinical_Reasoning: {},
					...Object.keys(currentEHRData || {}).reduce((acc, key) => {
						if (!IGNORABLE_TABS.includes(key)) {
							acc[key] = { description: "" };
						}
						return acc;
					}, {}),
				};
				pastEHRData =
					responseData?.ehrData?.pastEncounter?.[0]?.resource?.extension?.[0]
						?.valueString;
				pastEHRData = JSON?.parse(pastEHRData);

				const filteredStationsData = fhirQuestionnaireItems?.filter(
					(item) =>
						![
							"case-details",
							"additional-prompt",
							"scenario",
							"transcript",
							"task",
							"supporting-files",
							"current-chief-complaint",
							"past-chief-complaint",
						]?.includes(item?.linkId),
				);
				stationData = filteredStationsData?.reduce((acc, curr) => {
					const parsedData = JSON?.parse(curr?.text);
					acc[curr?.linkId] = {
						...parsedData,
						...expertAndGenericData?.[curr?.linkId],
					};
					return acc;
				}, {});
			} catch (e) {
				console.error(
					e?.message,
					"something went wrong while extracting data from stringify json",
				);
			}
			const data = {
				dataFetched: true,
				id: responseData?.id,
				isCaseEditable: !location?.pathname?.startsWith("/case/"),
				fhir_patient_id: responseData?.fhir_patient_id,
				created_by: responseData?.created_by,
				applicable_types: responseData?.applicable_types,
				specialization: responseData?.case_type,
				caseName: responseData?.name,
				createdAt: responseData?.created_at,
				description: responseData?.description,
				firstName: responseData?.fhirPatient?.name[0]?.given[0],
				lastName: responseData?.fhirPatient?.name[0]?.family,
				gender: responseData?.fhirPatient?.gender,
				dob: responseData?.fhirPatient?.birthDate,
				appearance: responseData?.fhirPatient?.extension?.[0]?.valueString,
				visibility: responseData?.visibility,
				additional_prompt: getLinkTextById(
					fhirQuestionnaireItems,
					"additional-prompt",
				),
				startDiagnosticTest: false,
				orderTests: false,
				scenario: getLinkTextById(fhirQuestionnaireItems, "scenario"),
				cdss_request: responseData?.cdss_request,
				objective_auto_check: responseData?.objective_auto_check,
				ehrTabMapper: {
					Current_Encounter_EHR: Object?.keys(currentEHRData)
						?.map((key) => key)
						?.filter(
							(item) => !["documents", "fileid"]?.includes(item?.toLowerCase()),
						),
					Past_Encounter_EHR: Object?.keys(pastEHRData)
						?.map((key) => key)
						?.filter(
							(item) => !["documents", "fileid"]?.includes(item?.toLowerCase()),
						),
				},
				ehrData: {
					current_encounter_id:
						responseData?.ehrData?.currentEncounter?.[0]?.resource?.id,
					past_encounter_id:
						responseData?.ehrData?.pastEncounter?.[0]?.resource?.id,
					Current_Encounter_EHR: currentEHRData,
					Past_Encounter_EHR: pastEHRData,
				},
				stations: stationData,
				student: {
					Current_Encounter_EHR: studentCurrentEHRData,
					expertApproach: {
						differentials: [],
						diagnostics: [],
						finalDiagnosis: {
							value: "",
						},
						PETests: [],
						soapNote: {},
					},
					notes: "",
					differentials: [],
					OLDCARTS: [],
				},
				questionnaireId: responseData?.fhirQuestionnaire?.id,
				currentStationId: stationId,
				attemptId: attemptId,
				nextStationDetails,
				osceType,
				transcript: getLinkTextById(fhirQuestionnaireItems, "transcript"),
				currentChiefComplaint: getLinkTextById(
					fhirQuestionnaireItems,
					"current-chief-complaint",
				),
				// attempts_count: responseData?.attempts_count,
				// test_assignments_count: responseData?.test_assignments_count,
				// multi_station_case_attempts_count:
				// 	responseData?.multi_station_case_attempts_count,
			};
			reset(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if ((caseId || id) && !isCaseValueFetched) {
			getFormDetails();
		}
		if (!stationList?.length) {
			reduxDispatch(getStations());
		}
	}, [caseId, id, attemptId]);

	return (
		<FormProvider {...methods}>
			<div className="h-100">{loading ? <SkeltonLoader /> : Component}</div>
		</FormProvider>
	);
};

export default StudentCaseFlow;
