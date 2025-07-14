import { Grid, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "../../sections/FormFieldController";

const PastMedicalHistory = ({ name = "" }) => {
	return (
		<div className="d-flex flex-column gap-2">
			<Typography fontSize="1.25rem" fontWeight="400" color="#5840BA">
				Past Medical History
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Chronic Conditions
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Summarize key information and instructions
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Past_Medical_History.Chronic_Conditions`}
						Component={UIInputField}
						extraProps={{ rows: 4, multiline: true }}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Childhood Illness
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Add any major health issues from childhood.
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Past_Medical_History.Childhood_Illnesses`}
						Component={UIInputField}
						extraProps={{ rows: 4, multiline: true }}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

export default PastMedicalHistory;
