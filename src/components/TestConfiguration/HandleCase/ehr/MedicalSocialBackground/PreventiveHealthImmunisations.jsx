import { Grid, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "../../sections/FormFieldController";

const PreventiveHealthImmunizations = ({ name = "" }) => {
	return (
		<div className="d-flex flex-column gap-2">
			<Typography fontSize="1.25rem" fontWeight="400" color="#5840BA">
				Preventive Health and Immunisations
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Preventive Health Tips
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						List your preventive health checks.
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Preventive_Health_And_Immunizations.Preventive_Health_Tips`}
						Component={UIInputField}
						extraProps={{ rows: 4, multiline: true }}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Immunisation Status
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Provide your recent vaccination details.
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Preventive_Health_And_Immunizations.Immunizations_Status`}
						Component={UIInputField}
						extraProps={{ rows: 4, multiline: true }}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

export default PreventiveHealthImmunizations;
