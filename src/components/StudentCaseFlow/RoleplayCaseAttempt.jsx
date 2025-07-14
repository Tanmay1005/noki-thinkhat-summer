import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import { memo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import AssessmentAndDiagnostics from "./AssessmentAndDiagnostics";
import CaseAttempt from "./CaseAttempt";
import RestStation from "./RestStationRolePlay";
import StudentSOAPNoteForm from "./StudentSoapNoteForm";

const componentMap = {
	[FOCUSED_HISTORY]: RestStation,
	[FOCUSED_PHYSICAL_EXAMINATION]: RestStation,
	// "Focused Physical Examination": FocusedPhysicalExaminationForm,
	[ASSESSMENT_PLAN]: AssessmentAndDiagnostics,
	[DIAGNOSTIC_TESTS]: AssessmentAndDiagnostics,
	[SOAP_NOTE]: StudentSOAPNoteForm,
};

const RolePlayCaseAttempt = () => {
	const { stationMap } = useSelector((state) => state.stations);
	const { getValues } = useFormContext();
	const currentStationId = getValues("currentStationId");
	const Component = componentMap?.[stationMap?.[currentStationId]?.type];
	const caseAttemptRef = useRef();
	return (
		<CaseAttempt caseAttemptRef={caseAttemptRef}>
			{!Component ? (
				<RestStation ref={caseAttemptRef} />
			) : (
				<Component ref={caseAttemptRef} />
			)}
		</CaseAttempt>
	);
};

export default memo(RolePlayCaseAttempt);
