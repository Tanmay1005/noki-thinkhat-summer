import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Grid, IconButton, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import FileUploadViewer from "../common/FileUploadViewer";
import FormFieldController from "../sections/FormFieldController";

const ClinicalReasoning = ({ name = "" }) => {
	const methods = useFormContext();
	const { control } = methods;

	// useFieldArray for Treatment
	const {
		fields: treatmentFields,
		append: appendTreatment,
		remove: removeTreatment,
	} = useFieldArray({
		control,
		name: `${name}.Plan.Treatment`,
	});
	const isFormEditable = useWatch({ control, name: "isCaseEditable" });

	const handleAddTreatment = () => {
		appendTreatment({
			Rx: "",
			Procedures: "",
		});
	};

	const handleRemoveTreatment = (index) => {
		removeTreatment(index);
	};

	const customBorderStyle = {
		rows: 4,
		multiline: true,
		variant: "standard",
		customStyle: {
			"& .MuiInput-root": {
				"&::before": {
					borderBottom: "0px !important",
				},
				"&::after": {
					borderBottom: "0px !important",
				},
			},
		},
	};

	return (
		<div className="ehr-tab-style-case-creation overflow-auto">
			<Grid container spacing={2} direction="column">
				<Grid item xs={12}>
					<Typography variant="h5" gutterBottom>
						Assessment
					</Typography>
					<Typography variant="h6" gutterBottom>
						Clinical Summary
					</Typography>

					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						Include main symptoms, test results, and your differential
						diagnosis.
					</Typography>
					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Assessment.Clinical_Summary`}
							Component={UIInputField}
							extraProps={{
								placeholder:
									"List possible diagnoses and summarize relevant clinical details...",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Differential Diagnosis
					</Typography>

					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						List potential diagnoses based on the clinical summary.
					</Typography>

					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Assessment.Differential_Diagnosis`}
							Component={UIInputField}
							extraProps={{
								placeholder: "Enter each diagnosis on a new line",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Primary Diagnosis
					</Typography>

					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						State the most likely or confirmed diagnosis.
					</Typography>
					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Assessment.Primary_Diagnosis`}
							Component={UIInputField}
							extraProps={{
								placeholder: "e.g., Type 2 Diabetes Mellitus",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Problem List
					</Typography>

					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						For wellness visits, list ongoing health issues or risk factors.
					</Typography>
					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Assessment.Problem_List`}
							Component={UIInputField}
							extraProps={{
								placeholder: "Enter each problem on a new line",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h5" gutterBottom>
						Plan
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Tests / Imaging
					</Typography>
					<Typography
						variant="p"
						gutterBottom
						sx={{ opacity: 0.7, marginBottom: "16px" }}
					>
						Document any ordered diagnostic tests or lab work.
					</Typography>
					<FileUploadViewer name={`${name}.Plan.Tests_Or_Imaging_Files`} />
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Treatment (Rx, Procedures)
					</Typography>
					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						Outline prescribed medications (Rx), procedures performed or
						planned, and other therapeutic interventions.
					</Typography>

					{treatmentFields.map((field, index) => (
						<div
							key={field.id}
							style={{ marginBottom: "16px", marginTop: "16px" }}
						>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={4}>
									<FormFieldController
										name={`${name}.Plan.Treatment.${index}.Rx`}
										label={"Rx (Medications)"}
										Component={UIInputField}
									/>
								</Grid>
								<Grid item xs={12} sm={4}>
									<FormFieldController
										name={`${name}.Plan.Treatment.${index}.Procedures`}
										label={"Procedures"}
										Component={UIInputField}
									/>
								</Grid>
								{treatmentFields.length > 1 && (
									<Grid item xs={12} sm={4}>
										<IconButton
											onClick={() => handleRemoveTreatment(index)}
											sx={{
												color: "red",
												marginTop: 1,
											}}
										>
											<DeleteOutlinedIcon />
										</IconButton>
									</Grid>
								)}
							</Grid>
						</div>
					))}

					{treatmentFields.length === 0 && handleAddTreatment()}
					{isFormEditable && (
						<UIButton
							variant="outlined"
							text="+ Add Medication"
							onClick={handleAddTreatment}
							sx={{
								borderRadius: "12px",
								textTransform: "none",
								marginTop: 2,
								width: "fit-content",
								alignSelf: "flex-start",
							}}
						/>
					)}
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Education provided
					</Typography>
					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						Summarize key information and instructions
					</Typography>
					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Plan.Education_Provided`}
							Component={UIInputField}
							extraProps={{
								placeholder:
									"e.g., Discussed signs of hypoglycemia and management",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Follow-up Instructions
					</Typography>
					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						Detail future appointments, monitoring plans, or specific actions
					</Typography>
					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Plan.Follow_Up_Instructions`}
							Component={UIInputField}
							extraProps={{
								placeholder: "e.g., Return to clinic in 2 weeks for BP check",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						Referrals (if any)
					</Typography>
					<Typography variant="p" gutterBottom sx={{ opacity: 0.7 }}>
						List any consultations or referrals
					</Typography>
					<div className="border rounded-3 p-2 pb-0">
						<FormFieldController
							name={`${name}.Plan.Referrals`}
							Component={UIInputField}
							extraProps={{
								placeholder:
									"e.g., Referral to Cardiology for uncontrolled hypertension",
								...customBorderStyle,
							}}
						/>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default ClinicalReasoning;
