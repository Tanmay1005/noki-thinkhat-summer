export const getAssessmentPlanData = (formValues) => {
	const { student, stations, currentStationId } = formValues;
	const studentDifferentials = student?.expertApproach?.differentials || [];
	const expertData = stations?.[currentStationId]?.expertApproach || [];

	const filteredExpertDataDifferentials = expertData?.differentials?.map(
		(item) => item?.diagnosis,
	);
	const filteredStudentDifferentials = studentDifferentials?.map(
		(item) => item?.diagnosis,
	);

	const content = {
		studentData: filteredStudentDifferentials,
		expertData: filteredExpertDataDifferentials,
	};
	return content;
};

export const getDiagnosticTestsData = (formValues) => {
	const { student, stations, currentStationId, applicable_types } = formValues;
	const studentDiagnostics = student?.expertApproach?.diagnostics || [];
	const studentFinalDiagnosis = student?.expertApproach?.finalDiagnosis ?? {};
	const { tests: expertDiagnostics, finalDiagnosis: expertFinalDiagnosis } =
		stations?.[currentStationId]?.expertApproach ?? {};
	const filteredExpertTests = expertDiagnostics?.map((item) => {
		return {
			testName: item?.testName,
			testInference: item?.testInference,
		};
	});
	const filteredStudentDiagnostics = studentDiagnostics?.map(
		(item) => item?.testName,
	);
	let content = "";
	if (applicable_types?.length > 1) {
		content = {
			studentData: {
				diagnostics: studentDiagnostics,
				finalDiagnosis: studentFinalDiagnosis,
			},
			expertData: {
				diagnostics: filteredExpertTests,
				finalDiagnosis: filteredStudentDiagnostics,
			},
		};
	} else {
		const differentialsContent = getAssessmentPlanData(formValues);
		content = {
			studentData: {
				diagnostics: studentDiagnostics,
				finalDiagnosis: studentFinalDiagnosis,
				differentials: differentialsContent?.studentData,
			},
			expertData: {
				diagnostics: expertDiagnostics,
				finalDiagnosis: expertFinalDiagnosis,
				differentials: differentialsContent?.expertData,
			},
		};
	}

	return content;
};

export const getSOAPNoteData = (formValues) => {
	// implement SOAP NOTE content
	const { student, stations, currentStationId } = formValues;
	const studentSoapNote = student?.expertApproach?.soapNote || {};
	const expertData = stations?.[currentStationId]?.expertApproach || {};
	const content = {
		studentData: studentSoapNote,
		expertData,
	};
	return content;
};
export const getFocusedHistoryData = (formValues) => {
	// implement SOAP NOTE content
	const { student, stations, currentStationId } = formValues;
	const studentOldcarts = student?.OLDCARTS || {};
	const expertOldCarts = stations?.[currentStationId]?.expertApproach || {};
	const content = {
		studentData: studentOldcarts,
		expertData: expertOldCarts,
	};
	return content;
};

export const getFocusedPhysicalExaminationData = (formValues) => {
	// implement SOAP NOTE content
	const { student, stations, currentStationId } = formValues;
	const studentPETests = student?.expertApproach?.PETests || {};
	const expertPETests = stations?.[currentStationId]?.expertApproach || {};
	const content = {
		studentData: studentPETests,
		expertData: expertPETests,
	};
	return content;
};
