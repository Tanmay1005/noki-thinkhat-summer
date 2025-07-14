import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	SOAP_NOTE,
} from "helpers/constants";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
const formatTranscriptHelper = (transcript) => {
	return transcript?.length
		? transcript
				.map((t) => `${t?.speakerText}`)
				.join(", ")
				.trim()
		: "";
};
const useStudentActionCollector = () => {
	const { transcription } = useSelector((state) => state.speech);
	const { getValues } = useFormContext();
	const { stationMap } = useSelector((state) => state?.stations);
	const currentStationId = getValues("currentStationId");
	const applicableTypes = getValues("applicable_types");
	const stationType = stationMap?.[currentStationId]?.type;
	const studentActionData = useWatch({ name: "student", defaultValue: {} });
	const { expertApproach: studentApproach, OLDCARTS } = studentActionData;
	const getStudentActions = () => {
		switch (stationType) {
			case ASSESSMENT_PLAN:
				return {
					notes: {
						differentials: studentApproach?.differentials,
					},
				};
			case DIAGNOSTIC_TESTS:
				return {
					notes: {
						diagnosis: studentApproach?.diagnosis,
						finalDiagnosis: studentApproach?.finalDiagnosis,
						...(applicableTypes?.length === 1 && {
							differentials: studentApproach?.differentials,
						}),
					},
				};
			case SOAP_NOTE:
				return {
					notes: {
						soapNote: studentApproach?.soapNote,
					},
				};
			case FOCUSED_HISTORY:
				return {
					transcript: formatTranscriptHelper(transcription),
					notes: { OLDCARTS },
				};
			default:
				return {
					transcript: formatTranscriptHelper(transcription),
				};
		}
	};
	return {
		getStudentActions,
	};
};

export default useStudentActionCollector;
