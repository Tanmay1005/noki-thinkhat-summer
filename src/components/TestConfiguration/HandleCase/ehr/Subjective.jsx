import { Grid, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import OldCarts from "../common/OldCarts";
import FormFieldController from "../sections/FormFieldController";

const reviewKeys = [
	"General",
	"HEENT",
	"Cardiovascular",
	"Respiratory",
	"Gastrointestinal",
	"Genitourinary",
	"Musculoskeletal",
	"Neurological",
	"Integumentary",
	"Psychiatric",
	"Endocrine",
	"Hematologic_Lymphatic",
	"Immunologic",
];

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

const Subjective = ({ name = "" }) => {
	return (
		<div className="overflow-y-auto">
			<div className="p-4">
				<h5 className="mb-3" style={{ color: "#5D5FEF" }}>
					Chief Concern & Visit Context
				</h5>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<h5>Chief Complaint</h5>
						<p>Describe the main issue you are experiencing</p>
						<FormFieldController
							name={`${name}.Chief_Concern_And_Visit_Context.Chief_Complaint`}
							Component={UIInputField}
							extraProps={{ multiline: true, rows: 3 }}
						/>
					</Grid>
					<Grid item xs={12}>
						<h5>Reason for the Visit</h5>
						<p>Describe the clinical reason for this consultation</p>
						<FormFieldController
							name={`${name}.Chief_Concern_And_Visit_Context.Reason_For_Visit`}
							Component={UIInputField}
							extraProps={{ multiline: true, rows: 3 }}
						/>
					</Grid>
				</Grid>
			</div>
			<div className="p-4">
				<Typography variant="h5" className="mb-3" sx={{ color: "#5D5FEF" }}>
					History of the Present Illness
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<h5>Narrative with relevant symptom details</h5>
						<p>
							Describe the course and characteristics of the present illness
						</p>
						<FormFieldController
							name={`${name}.History_Of_Present_Illness.Narrative`}
							Component={UIInputField}
							extraProps={{ multiline: true, rows: 3 }}
						/>
					</Grid>
					<Grid item xs={12}>
						<h5>Symptom Overview & History</h5>
						<p>
							Describe the symptoms and characteristics of the present illness
						</p>
						<OldCarts
							formFieldName={`${name}.History_Of_Present_Illness.Symptom_Overview_And_History`}
							header="OLDCARTS Model"
							title=""
						/>
					</Grid>
				</Grid>
			</div>
			<div className="p-4">
				<Typography variant="h5" className="mb-3" sx={{ color: "#5D5FEF" }}>
					Review of Systems
				</Typography>
				<Grid container spacing={2}>
					{reviewKeys.map((key) => {
						const label = key.replace(/_/g, " ");
						const fieldName = `${name}.Review_Of_Systems.${key}`;
						return (
							<Grid key={key} item xs={12} sm={6}>
								<div className="border rounded-3 p-2 pb-0">
									<div className="border-bottom mb-1">
										<Typography className="pb-1" fontWeight="bold">
											{label}
										</Typography>
									</div>
									<FormFieldController
										name={fieldName}
										Component={UIInputField}
										extraProps={{
											placeholder: `Enter ${label}...`,
											...inputBoxStyle,
										}}
									/>
								</div>
							</Grid>
						);
					})}
				</Grid>
				<div className="mt-3 mb-1 border rounded-3 p-2 pb-0">
					<FormFieldController
						name={`${name}.Review_Of_Systems.Anyother`}
						Component={UIInputField}
						extraProps={{
							placeholder: "Please Specify if Any Other",
							...inputBoxStyle,
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default Subjective;
