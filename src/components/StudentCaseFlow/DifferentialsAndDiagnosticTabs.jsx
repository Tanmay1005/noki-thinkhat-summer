import { Box, Grid, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIRadioGroup from "components/ReusableComponents/UIRadioGroup";
import DiagnosticTestsList from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DiagnosticTestsList";
import DragableList from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DragableList";
import FormFieldController from "components/TestConfiguration/HandleCase/sections/FormFieldController";
import AccordionFormHelper from "components/TestConfiguration/HandleCase/stations/AccordionFormHelper";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	SOAP_NOTE,
} from "helpers/constants";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";

const DifferentialsAndDiagnosticTabs = () => {
	const { getValues, setValue } = useFormContext();
	const stationMap = useSelector((state) => state.stations.stationMap);
	const currentStationId = getValues("currentStationId");
	const applicable_types = useWatch({
		name: "applicable_types",
	});
	const differentials = useWatch({
		name: "student.expertApproach.differentials",
	});
	const orderTests = useWatch({
		name: "orderTests",
	});
	const startDiagnosticTest = useWatch({ name: "startDiagnosticTest" });

	const stationData = useWatch({
		name: "stations",
	});
	const finalDiagnosisFields =
		stationData?.[currentStationId]?.expertApproach?.finalDiagnosis?.options ||
		[];
	const stationType = stationMap?.[currentStationId]?.type;

	const isEditable = getValues("isCaseEditable");

	const isDiagnosticStation = stationType === DIAGNOSTIC_TESTS;
	const _isAssessmentPlan = stationType === ASSESSMENT_PLAN;
	const isMultiStation = applicable_types?.length > 1;
	const isSingleStation = applicable_types?.length === 1;

	const showDifferentialsButton = isDiagnosticStation && isSingleStation;

	const showDiagnosticTests =
		(isDiagnosticStation && isMultiStation && !orderTests) ||
		(isDiagnosticStation &&
			isSingleStation &&
			startDiagnosticTest &&
			!orderTests);

	const showDifferentials = !(isSingleStation && stationType === SOAP_NOTE);
	const disableDifferentialsAccess =
		isMultiStation && (isDiagnosticStation || stationType === SOAP_NOTE);
	return (
		<div>
			{showDiagnosticTests && (
				<Grid
					component="div"
					sx={{
						position: "relative",
						marginBottom: 1,
					}}
				>
					{/* tests ordered card based on station */}
					<AccordionFormHelper
						label="Your Ordered Diagnostic Tests"
						labelProps={{
							variant: "p",
							sx: { fontSize: "1rem" },
						}}
						backgroundColor="#F7F5FB"
						JSX={
							<>
								<DiagnosticTestsList
									name={"student.expertApproach"}
									isDisabled={!isEditable}
								/>
							</>
						}
					/>
				</Grid>
			)}
			<Grid
				component="div"
				sx={{
					position: "relative",
				}}
			>
				{!orderTests && showDifferentials ? (
					<AccordionFormHelper
						label="Your Selected Differentials"
						labelProps={{
							variant: "p",
							sx: { fontSize: "1rem" },
						}}
						backgroundColor="#F7F5FB"
						JSX={
							<>
								<DragableList
									name={"student.expertApproach"}
									isDisabled={
										!isEditable ||
										startDiagnosticTest ||
										disableDifferentialsAccess
									}
								/>
								{showDifferentialsButton && (
									<UIButton
										variant="contained"
										color="primary"
										size="medium"
										sx={{
											mt: 2,
											display:
												applicable_types.length > 1 || startDiagnosticTest
													? "none"
													: "block",
										}}
										text="proceed to tests"
										onClick={() => {
											setValue("startDiagnosticTest", true);
										}}
										fullWidth
										disabled={differentials?.length === 0}
									/>
								)}
							</>
						}
					/>
				) : orderTests ? (
					<Grid
						component={"div"}
						sx={{
							position: "relative",
							marginTop: 1,
							backgroundColor: "#F7F5FB",
							borderRadius: "12px",
						}}
					>
						<Box sx={{ padding: "16px" }}>
							<Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
								What is the correct diagnosis for this patient?
							</Typography>
							<FormFieldController
								name="student.expertApproach.finalDiagnosis.value"
								Component={UIRadioGroup}
								rules={{
									required: "Please select a diagnosis",
								}}
								extraProps={{
									options: finalDiagnosisFields.map((diagnosis) => ({
										label: diagnosis.name,
										value: diagnosis.name,
									})),
									row: false,
								}}
								disabled={!isEditable}
							/>
						</Box>
					</Grid>
				) : null}
			</Grid>
		</div>
	);
};

export default DifferentialsAndDiagnosticTabs;
