import { Grid, Typography } from "@mui/material";
import DiagnosticTestResults from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DiagnosticTestResults";
import DiagnosticTestsList from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DiagnosticTestsList";
import DifferentialsResults from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DifferentialsResults";
import { ASSESSMENT_PLAN, DIAGNOSTIC_TESTS } from "helpers/constants";
import useCaseFlowForm from "hooks/useCaseFlowForm";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import Logo from "../../assets/logo.svg";

const AssessmentAndDiagnostics = forwardRef((_props, ref) => {
	const {
		handleOnStartDocumenting,
		handleOnStopDocumenting,
		handleOnPauseDocumenting,
		handleOnResumeDocumenting,
	} = useCaseFlowForm();
	const { control, getValues } = useFormContext();
	const [endName, setEndName] = useState("");
	const [stationType, setStationType] = useState("");
	const { stationMap } = useSelector((state) => state.stations);
	const { isRecording, isPaused } = useSelector((state) => state.speech);
	const currentStationId = getValues("currentStationId");
	const startDiagnosticTest = useWatch({ name: "startDiagnosticTest" });
	const orderTests = useWatch({ name: "orderTests" });
	const applicable_types = useWatch({ name: "applicable_types" });

	useEffect(() => {
		const currentStationType = stationMap?.[currentStationId]?.type;
		setStationType(currentStationType);
	}, [stationMap, currentStationId]);

	useEffect(() => {
		if (
			(stationType === DIAGNOSTIC_TESTS && startDiagnosticTest) ||
			(stationType === DIAGNOSTIC_TESTS && applicable_types.length > 1)
		) {
			setEndName("diagnostics");
		} else if (stationType === ASSESSMENT_PLAN || !startDiagnosticTest) {
			setEndName("differentials");
		}
	}, [stationType, startDiagnosticTest]);

	const name = "student.expertApproach";
	const fieldName = `${name}.${endName}`;

	const {
		field: { value, onChange },
	} = useController({
		name: fieldName,
		control,
		defaultValue: [],
	});
	const [isOpen, setIsOpen] = useState(false);

	const handleStartRecording = () => {
		try {
			handleOnStartDocumenting();
			setIsOpen(true);
		} catch (error) {
			console.error(error);
		}
	};
	const handleStopRecording = () => {
		try {
			// transcript.current = transcription;
			handleOnStopDocumenting();
		} catch (error) {
			console.error("Error stopping recording or generating score:", error);
		}
	};
	const handlePauseRecording = () => {
		handleOnPauseDocumenting();
	};

	const handleResumeRecording = () => {
		handleOnResumeDocumenting();
	};
	useImperativeHandle(ref, () => ({
		handleStopRecording,
		handlePauseRecording,
		handleResumeRecording,
	}));
	const handleDifferentialsChange = (selectedItems) => {
		const transformedItems = selectedItems.map((item) => ({
			snomed_id: item?.snomed_id,
			diagnosis: item?.term || item?.diagnosis,
			concept_id: item?.concept_id,
			id: item?.snomed_id,
		}));
		onChange(transformedItems);
	};
	const handleDiagnosticTestsChange = (selectedItems) => {
		const transformedItems = selectedItems.map((item) => ({
			loinc_num: item?.loinc_num,
			testName: item?.long_common_name || item?.testName,
			id: item?.loinc_num,
		}));
		onChange(transformedItems);
	};
	const isDiagnosticTest = stationType === DIAGNOSTIC_TESTS;
	const isAssessmentAndPlan = stationType === ASSESSMENT_PLAN;

	const isMultiStation = applicable_types.length > 1;

	const shouldShowDiagnosticResults =
		isDiagnosticTest &&
		startDiagnosticTest &&
		!orderTests &&
		endName === "diagnostics";

	const shouldShowDifferentials =
		(isDiagnosticTest &&
			!isMultiStation &&
			!startDiagnosticTest &&
			!orderTests) ||
		isAssessmentAndPlan;
	return (
		<>
			{isRecording && isOpen ? (
				<Grid
					item
					className="h-100 d-flex flex-column justify-content-between"
					sx={{
						padding: "1rem 1.5rem 0 1.5rem",
						backgroundColor: "#F7F5FB",
						borderRadius: "18px",
					}}
				>
					{(isDiagnosticTest && isMultiStation && !orderTests) ||
					shouldShowDiagnosticResults ? (
						<>
							<Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
								Select Diagnostic Tests
							</Typography>
							<DiagnosticTestResults
								name={fieldName}
								resultsProps={{ sx: { height: "75%", ml: 3, mt: 2 } }}
								onSelectedItemsChange={handleDiagnosticTestsChange}
								selectedItems={value}
								isDisabled={isPaused}
							/>
						</>
					) : null}

					{shouldShowDifferentials && (
						<>
							<Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
								Select Differentials
							</Typography>
							<DifferentialsResults
								name={fieldName}
								onSelectedItemsChange={handleDifferentialsChange}
								resultsProps={{ sx: { height: "75%", ml: 3, mt: 2 } }}
								selectedItems={value}
								isDisabled={isPaused}
							/>
						</>
					)}

					{orderTests && (
						<DiagnosticTestsList
							name={name}
							fileSection={true}
							isDisabled={isPaused}
						/>
					)}
				</Grid>
			) : (
				<Grid
					item
					className="d-flex justify-content-center align-items-center h-100 flex-column p-5"
				>
					{" "}
					<div
						className="col-12 d-flex justify-content-center align-items-center mb-2"
						style={{
							height: "70px",
							width: "70px",
							background:
								"linear-gradient(93.39deg, #E38DF1 -5.66%, #8C68C3 56.74%, #6754A7 96.84%)",
							borderRadius: "50%",
						}}
						onClick={handleStartRecording}
						onKeyUp={handleStartRecording}
						tabIndex={0}
						role="button"
						aria-label="Start Conversation"
					>
						<img src={Logo} alt="Start Recording" />
					</div>
					<Typography>Start Case</Typography>
				</Grid>
			)}
		</>
	);
});

export default AssessmentAndDiagnostics;
