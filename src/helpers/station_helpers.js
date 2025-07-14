import AnalysisStationIcon from "../assets/Case_tabs_image/AnalysisStationIcon.svg";
import DiagnosticInterpretationIcon from "../assets/Case_tabs_image/DiagnosticInterpretationIcon.svg";
import EmergencyResponseIcon from "../assets/Case_tabs_image/EmergencyResponseIcon.svg";
import ExaminationStationIcon from "../assets/Case_tabs_image/ExaminationStationIcon.svg";
import HistoryStationIcon from "../assets/Case_tabs_image/HistoryStationIcon.svg";
import InterprofessionalCollaborationStationIcon from "../assets/Case_tabs_image/InterprofessionalCollaborationStationIcon.svg";
import ManagementPlanningIcon from "../assets/Case_tabs_image/ManagementPlanningIcon.svg";
import ProceduralSkillsIcon from "../assets/Case_tabs_image/ProceduralSkillsIcon.svg";
import Default from "../assets/Case_tabs_image/default.svg";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	PATIENT_EDUCATION,
	PROCEDURES,
	PROFESSIONALISM,
	SOAP_NOTE,
} from "./constants";

export const getIconByStationType = (name) => {
	switch (name) {
		case FOCUSED_HISTORY:
			return HistoryStationIcon;
		case FOCUSED_PHYSICAL_EXAMINATION:
			return ExaminationStationIcon;
		case DIAGNOSTIC_TESTS:
			return DiagnosticInterpretationIcon;
		case ASSESSMENT_PLAN:
			return ManagementPlanningIcon;
		case PROFESSIONALISM:
			return InterprofessionalCollaborationStationIcon;
		case PATIENT_EDUCATION:
			return EmergencyResponseIcon;
		case SOAP_NOTE:
			return AnalysisStationIcon;
		case PROCEDURES:
			return ProceduralSkillsIcon;
		default:
			return Default;
	}
};

export const getColorByStationType = (name) => {
	switch (name) {
		case FOCUSED_HISTORY:
			return "#27C6DA";
		case DIAGNOSTIC_TESTS:
			return "#A854F7";
		case PROFESSIONALISM:
			return "#334154";
		case SOAP_NOTE:
			return "#A21CAF";
		case FOCUSED_PHYSICAL_EXAMINATION:
			return "#6D27D9";
		case ASSESSMENT_PLAN:
			return "#BD195D";
		case PATIENT_EDUCATION:
			return "#FF0000";
		case PROCEDURES:
			return "#3B81F6";
		default:
			return "#000000";
	}
};

export const STATIONS_WITH_TAB_VALUES = [
	{
		stationType: FOCUSED_HISTORY,
		value: 0,
	},
	{
		stationType: FOCUSED_PHYSICAL_EXAMINATION,
		value: 1,
	},
	{
		stationType: DIAGNOSTIC_TESTS,
		value: 2,
	},
	{
		stationType: ASSESSMENT_PLAN,
		value: 3,
	},
	{
		stationType: PROFESSIONALISM,
		value: 4,
	},
	{
		stationType: PATIENT_EDUCATION,
		value: 5,
	},
	{
		stationType: SOAP_NOTE,
		value: 6,
	},
	{
		stationType: PROCEDURES,
		value: 7,
	},
];
export const stationRequiresDocumentation = {
	[SOAP_NOTE]: [
		{ label: "Subjective", value: "subjective" },
		{ label: "Objective", value: "objective" },
		{ label: "Assessment", value: "assessment" },
		{ label: "Plan", value: "plan" },
	],
};
const stationConfigForCase = {
	[SOAP_NOTE]: {
		ehr: true,
		cdss: false,
		caseDetails: true,
		transcript: false,
		objectives: true,
		modelSelection: false,
		rubrics: true,
	},
};
export const modelSelectionConfig = (name) => {
	return stationConfigForCase?.[name]?.modelSelection ?? true;
};
export const getStationConfigForCase = (name) => {
	return (
		stationConfigForCase[name] ?? {
			ehr: true,
			cdss: true,
			caseDetails: true,
			transcript: true,
			objectives: true,
			rubrics: true,
		}
	);
};
