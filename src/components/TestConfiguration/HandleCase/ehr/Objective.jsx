import { Grid, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "../sections/FormFieldController";

const inputBoxStyle = {
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

const Objective = ({ name = "" }) => {
	return (
		<div className="ehr-tab-style-case-creation overflow-auto h-100">
			<div>
				<Typography fontSize={"1.1rem"} fontWeight={"bold"}>
					Vital Signs
				</Typography>
				<Grid container className="mt-2">
					<Grid item xs={12} md={10} xl={8} container spacing={2}>
						{VitalSigns?.map((vital) => (
							<Grid key={vital?.name} item xs={12} sm={3}>
								{/* <Typography>{vital?.label}</Typography> */}
								<FormFieldController
									label={vital?.label}
									name={`${name}.Vital_Signs.${vital?.name}`}
									Component={UIInputField}
									extraProps={{
										type: vital?.inputFieldType,
										inputProps: vital?.inputProps || {},
									}}
								/>
							</Grid>
						))}
					</Grid>
				</Grid>
			</div>
			<div className="mt-4">
				<Typography fontSize={"1.1rem"} fontWeight={"bold"}>
					Physical Exam (by System)
				</Typography>
				<div className="mt-2">
					<Grid container spacing={2}>
						{PhysicalExams?.map((exam) => (
							<Grid key={exam?.name} item xs={12} sm={6}>
								<div className="border rounded-3 p-2 pb-0">
									<div className="border-bottom mb-1">
										<Typography className="pb-1" fontWeight="bold">
											{exam?.label}
										</Typography>
									</div>
									<FormFieldController
										name={`${name}.Physical_Exam.${exam?.name}`}
										Component={UIInputField}
										extraProps={{
											placeholder: `Enter ${exam?.label}...`,
											...inputBoxStyle,
										}}
									/>
								</div>
							</Grid>
						))}
					</Grid>
				</div>
			</div>
			<div className="mt-3 mb-1">
				<Typography fontSize={"1.1rem"} fontWeight={"bold"} className="mb-1">
					Any other symptoms
				</Typography>
				<div className="border rounded-3 p-2 pb-0">
					<FormFieldController
						name={`${name}.Physical_Exam.otherSymptoms`}
						Component={UIInputField}
						extraProps={{
							placeholder: "Enter Other Symptoms...",
							...inputBoxStyle,
						}}
					/>
				</div>
			</div>
		</div>
	);
};

const VitalSigns = [
	{
		name: "Temperature",
		label: "Temperature (°F)",
		inputFieldType: "number",
		inputProps: { min: 95, max: 105 },
	},
	{
		name: "Heart_Rate",
		label: "Pulse (bpm)",
		inputFieldType: "number",
		inputProps: { min: 40, max: 200 },
	},
	{
		name: "Respiratory_Rate",
		label: "Respiratory Rate",
		inputFieldType: "number",
		inputProps: { min: 8, max: 40 },
	},
	{
		name: "Blood_Pressure",
		label: "Blood Pressure (mmHg)",
		inputFieldType: "text",
	}, // Example: "120/80"
	{
		name: "Oxygen_Saturation",
		label: "SpO2 (%)",
		inputFieldType: "number",
		inputProps: { min: 70, max: 100 },
	},
	{
		name: "Weight",
		label: "Weight (kg)",
		inputFieldType: "number",
		inputProps: { min: 0, max: 500 },
	},
	{
		name: "Height",
		label: "Height (cm)",
		inputFieldType: "number",
		inputProps: { min: 0, max: 300 },
	},
];

const PhysicalExams = [
	{ name: "General_Appearance", label: "General Appearance" },
	{ name: "GI", label: "Gastrointestinal (GI)" },
	{ name: "GU", label: "Genitourinary (GU)" },
	{ name: "MSK", label: "Musculoskeletal (MSK)" },
	{ name: "HEENT_Neck", label: "HEENT / Neck" },
	{ name: "Neurological", label: "Neurological" },
	{ name: "Cardiovascular", label: "Cardiovascular" },
	{ name: "Skin", label: "Skin" },
	{ name: "Respiratory", label: "Respiratory" },
	{ name: "Psych", label: "Psychiatric" },
];

export default Objective;
