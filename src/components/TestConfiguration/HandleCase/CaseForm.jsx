import { Close } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import {
	CREATE_CASE,
	GET_CASE_SCORE_BY_ID,
	GET_INTEGRATED_CASE,
	UPDATE_CASE,
} from "adapters/noki_ed.service";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import dayjs from "dayjs";
import { hasEditPrivileges } from "helpers/common_helper";
import { useUserType } from "hooks/useUserType";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Transcript from "./common/Transcript";
import { processFileDeletions } from "./manageCaseHelper";
import CaseDetailsAndDescription from "./sections/CaseDetailsAndDescription";
import EHRDataHandler from "./sections/EHRDataHandler";
import StationBasedFormBuilder from "./sections/StationBasedFormBuilder";

const CaseForm = ({
	setInitializeCaseData = () => {},
	initializeCaseData = null,
	handleClose = () => {},
	handleRender = () => {},
	caseId = "",
	viewOnly = false,
}) => {
	const methods = useForm({
		mode: "onChange",
		defaultValues: {
			loading: false,
			firstName: "",
			lastName: "",
			gender: "",
			dob: null,
			caseName: "",
			specialization: "",
			applicable_types: [],
			description: "",
			stations: {},
			visibility: "public",
			ehrData: {},
		},
	});
	const { handleSubmit, reset, control, setValue, getValues } = methods;
	const applicableTypes = useWatch({
		control,
		name: "applicable_types",
	});
	// const manageDocumentRef = useRef();

	const [loading, setLoading] = useState({
		initialLoading: false,
		proceedLoading: false,
	});

	const [isCaseEditable, setIsCaseEditable] = useState(true);

	const userID = useSelector((state) => state?.auth?.personData?.id);
	const userRole = useUserType();

	const [questionnaireCount, setQuestionnaireCount] = useState(0);

	const getCaseScoreById = async (id) => {
		try {
			const response = await GET_CASE_SCORE_BY_ID({
				patientId: id,
			});
			setQuestionnaireCount(response?.data?.total);
		} catch (error) {
			console.error("Error fetching JSON:", error);
		}
	};

	useEffect(() => {
		if (!isEmpty(initializeCaseData) && !caseId) {
			reset(initializeCaseData);
		}

		return () => setInitializeCaseData(null);
	}, [initializeCaseData]);

	function getLinkTextById(data, targetLinkId) {
		// Find the object with matching linkId
		const found = data.find((item) => item.linkId === targetLinkId);

		// Return the text if found, otherwise return null
		return found ? found.text : null;
	}

	const getFormDetails = async () => {
		try {
			setValue("loading", true);
			setLoading((prev) => ({ ...prev, initialLoading: true }));
			const response = await GET_INTEGRATED_CASE(caseId);
			const responseData = response?.data;
			let currentEHRData = {};
			let pastEHRData = {};
			let stationData = {};
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

			try {
				currentEHRData =
					responseData?.ehrData?.currentEncounter?.[0]?.resource?.extension?.[0]
						?.valueString;
				currentEHRData = JSON?.parse(currentEHRData);
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
				id: responseData?.id,
				fhir_patient_id: responseData?.fhir_patient_id,
				created_by: responseData?.created_by,
				applicable_types: responseData?.applicable_types,
				specialization: responseData?.case_type,
				caseName: responseData?.name,
				description: responseData?.description,
				firstName: responseData?.fhirPatient?.name[0]?.given[0],
				lastName: responseData?.fhirPatient?.name[0]?.family,
				appearance: responseData?.fhirPatient?.extension?.[0]?.valueString,
				gender: responseData?.fhirPatient?.gender,
				dob: responseData?.fhirPatient?.birthDate,
				visibility: responseData?.visibility,
				additional_prompt: getLinkTextById(
					fhirQuestionnaireItems,
					"additional-prompt",
				),
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
				attempts_count: responseData?.attempts_count,
				test_assignments_count: responseData?.test_assignments_count,
				multi_station_case_attempts_count:
					responseData?.multi_station_case_attempts_count,
				transcript: getLinkTextById(fhirQuestionnaireItems, "transcript"),
				currentChiefComplaint: getLinkTextById(
					fhirQuestionnaireItems,
					"current-chief-complaint",
				),
				pastChiefComplaint: getLinkTextById(
					fhirQuestionnaireItems,
					"past-chief-complaint",
				),
			};
			reset(data);
			responseData?.visibility?.visibility === "public" &&
				(await getCaseScoreById(responseData?.visibility?.fhir_patient_id));
			const createdByID = responseData?.visibility?.created_by;
			const userPrivilege = hasEditPrivileges(createdByID, userRole, userID);
			setIsCaseEditable(userPrivilege);
			setValue("isCaseEditable", userPrivilege);
			if (viewOnly) {
				setIsCaseEditable(false);
				setValue("isCaseEditable", false);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setValue("loading", false);
			setLoading((prev) => ({ ...prev, initialLoading: false }));
		}
	};
	useEffect(() => {
		if (caseId) {
			getFormDetails();
		}
	}, [caseId]);

	const stationPayloadGenerator = (data) => {
		const formattedData = Object?.entries?.(data)?.map(([key, value]) => ({
			...value,
			station: key,
		}));
		return formattedData;
	};

	function updateIsExistingRecursively(obj, newValue, excludeTopKey) {
		if (obj === null || typeof obj !== "object") return obj;

		const result = Array.isArray(obj) ? [] : {};

		for (const key of Object.keys(obj)) {
			const value = obj[key];

			// Skip recursion inside the excluded top-level key
			if (key === excludeTopKey && typeof value === "object") {
				result[key] = value; // Leave as-is
				continue;
			}

			if (key === "isExisting") {
				result[key] = newValue;
			} else if (typeof value === "object" && value !== null) {
				result[key] = updateIsExistingRecursively(
					value,
					newValue,
					excludeTopKey,
				);
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	const onSubmit = async (originalData) => {
		try {
			const data = updateIsExistingRecursively(
				originalData,
				true,
				"filesToProcess",
			);
			setValue("loading", true);
			setValue("isCaseEditable", false);
			setLoading((prev) => ({ ...prev, proceedLoading: true }));
			const payload = {
				title: data?.caseName?.trim(),
				description: data?.description,
				applicable_types: data?.applicable_types || [],
				case_type: data?.specialization,
				additional_prompt: data?.additional_prompt || undefined,
				cdss_request: data?.cdss_request,
				objective_auto_check: data?.objective_auto_check,
				visibility: data?.visibility,
				role: userRole.toLowerCase(),
				updated_by: userID,
				scenario: initializeCaseData?.scenario,
				transcript: data?.transcript,
				currentChiefComplaint: data?.currentChiefComplaint,
				pastChiefComplaint: "Test Test",
				// ehrData: data?.ehrData || {},
				patient_info: {
					firstName: data?.firstName?.trim(),
					lastName: data?.lastName?.trim(),
					gender: data?.gender,
					birthDate: dayjs(originalData?.dob)?.format("YYYY-MM-DD"),
					appearance: data?.appearance,
				},
				ehr: {
					current: data?.ehrData?.Current_Encounter_EHR || {},
					past: data?.ehrData?.Past_Encounter_EHR || {},
				},
				data: stationPayloadGenerator(data?.stations),
			};

			if (data?.id) {
				payload.ehr.current_encounter_id = data?.ehrData?.current_encounter_id;
				payload.ehr.past_encounter_id = data?.ehrData?.past_encounter_id;
				payload.case_id = data?.id;
				payload.fhir_patient_id = data?.fhir_patient_id;
				payload.created_by = data?.created_by;
			} else {
				payload.created_by = userID;
			}

			let _response;
			if (data?.id) {
				_response = await UPDATE_CASE(payload);
			} else {
				_response = await CREATE_CASE(payload);
			}
			processFileDeletions(originalData?.filesToProcess, "SAVE");

			handleRender();
			toast.success(`Case ${data?.id ? "Updated" : "Created"} Successfully.`);
			handleClose();
		} catch (e) {
			console.error(e);
			toast.error(
				e?.response?.data?.error ||
					e?.message ||
					"Something went wrong while creating case.",
			);
		} finally {
			setValue("loading", false);
			setValue("isCaseEditable", true);
			setLoading((prev) => ({ ...prev, proceedLoading: false }));
			handleRender();
		}
	};

	return (
		<>
			<FormProvider {...methods}>
				<div className="d-flex flex-column h-100">
					<div className="d-flex justify-content-between align-items-center mx-3 py-2">
						<div className="d-flex align-items-center gap-2">
							<IconButton
								fontSize="1.5rem"
								onClick={() => {
									const filesToProcess = getValues("filesToProcess");
									processFileDeletions(filesToProcess, "CANCEL");
									handleClose();
								}}
								className="p-0"
								disabled={loading?.initialLoading || loading?.proceedLoading}
							>
								<Close
									sx={{ fontSize: "1.5rem", color: "rgba(88, 64, 186, 1)" }}
								/>
							</IconButton>
							{isCaseEditable && !loading?.initialLoading && (
								<Typography fontWeight="bold" fontSize={"1rem"}>
									{caseId ? "Update Case" : "Add Case"}
								</Typography>
							)}
						</div>

						<div className={"d-flex gap-2 "}>
							<div
								className={`${
									(loading?.initialLoading || !isCaseEditable) && "d-none"
								}`}
							>
								<UIButton
									onClick={() => {
										const filesToProcess = getValues("filesToProcess");
										processFileDeletions(filesToProcess, "CANCEL");
										handleClose();
									}}
									className="p-2 px-4 rounded-pill"
									text="Cancel"
									disabled={loading?.initialLoading || loading?.proceedLoading}
								/>
							</div>

							<div
								className={`${
									(loading?.initialLoading || !isCaseEditable) && "d-none"
								}`}
							>
								<UIButton
									variant="contained"
									className="p-2 px-4 rounded-pill"
									text={caseId ? "Update Case" : "Add Case"}
									onClick={handleSubmit(onSubmit)}
									disabled={
										loading?.initialLoading ||
										loading?.proceedLoading ||
										!isCaseEditable
									}
								/>
							</div>
						</div>
					</div>

					<div className="flex-grow-1 h-100 overflow-auto card-bg-secondary">
						{loading?.initialLoading ? (
							<div className="d-flex h-100 justify-content-center align-items-center">
								<CommonProgress />
							</div>
						) : (
							<>
								<form
									onSubmit={handleSubmit(onSubmit)}
									className="d-flex flex-column h-100"
								>
									<CaseDetailsAndDescription
										loading={loading}
										isCaseEditable={isCaseEditable}
										caseDetailsById={{}}
										questionnaireCount={questionnaireCount}
									/>
									<EHRDataHandler />
									{applicableTypes?.length === 1 && <Transcript />}
									<StationBasedFormBuilder />
								</form>
							</>
						)}
					</div>
				</div>
			</FormProvider>
		</>
	);
};

export default CaseForm;
