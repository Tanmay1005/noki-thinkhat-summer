import { Grid } from "@mui/material";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIInputField from "components/ReusableComponents/UIInputField";
import UISelectField from "components/ReusableComponents/UISelectField";
import FormFieldController from "../sections/FormFieldController";

const PatientOverview = ({ name = "" }) => {
	return (
		<div className="ehr-tab-style-case-creation">
			<Grid container spacing={2}>
				<Grid item xs={12} sm={4}>
					<FormFieldController
						name={`${name}.Full_Name`}
						label={"Full Name"}
						Component={UIInputField}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<FormFieldController
						name={`${name}.Date_Of_Birth`}
						label={"Date of Birth"}
						Component={UIDatePicker}
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<FormFieldController
						name={`${name}.Gender`}
						label={"Gender"}
						Component={UISelectField}
						extraProps={{
							options: [
								{ label: "Male", value: "male" },
								{ label: "Female", value: "female" },
								{ label: "Other", value: "other" },
							],
							multiple: false,
						}}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormFieldController
						name={`${name}.Encounter_Date`}
						label={"Encounter Date"}
						Component={UIDatePicker}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormFieldController
						name={`${name}.Visit_Type`}
						label={"Visit Type"}
						Component={UISelectField}
						extraProps={{
							options: [
								{ label: "Follow-up", value: "Follow-up" },
								{ label: "Initial", value: "Initial" },
							],
							multiple: false,
						}}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

export default PatientOverview;
