import { Grid, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import UIRadioGroup from "components/ReusableComponents/UIRadioGroup";
import FormFieldController from "../../sections/FormFieldController";

const SocialHistory = ({ name = "" }) => {
	return (
		<div className="d-flex flex-column gap-2">
			<Typography fontSize="1.25rem" fontWeight="400" color="#5840BA">
				Social History
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Any Addiction
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Please provide details about your Addiction
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Social_History.Addiction`}
						Component={UIInputField}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Sexual Activity/ Relationship Status
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Please provide details about your sexual activity.
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Social_History.Sexual_Activity`}
						Component={UIInputField}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Living Situation
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Please provide details about your living situation
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Social_History.Living_Situation`}
						Component={UIInputField}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Academic / occupational details
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Please provide details about your Academics and job status
					</Typography>
					<FormFieldController
						label="Description"
						name={`${name}.Social_History.Academic_Or_Occupational_Details`}
						Component={UIInputField}
						extraProps={{ rows: 4, multiline: true }}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Lifestyle
					</Typography>
					<Typography className="mb-2" color=" #5E5E5E" fontSize="12px">
						Following any diet or Exercise?
					</Typography>
					<div className="d-flex flex-column gap-2">
						<FormFieldController
							label="Diet"
							name={`${name}.Social_History.Lifestyle.Diet`}
							Component={UIRadioGroup}
							extraProps={{
								options: [
									{ value: "Yes", label: "Yes" },
									{ value: "No", label: "No" },
								],
							}}
						/>
						<FormFieldController
							label="Exercise"
							name={`${name}.Social_History.Lifestyle.Exercise`}
							Component={UIRadioGroup}
							extraProps={{
								options: [
									{ value: "Yes", label: "Yes" },
									{ value: "No", label: "No" },
								],
							}}
						/>
						<FormFieldController
							label="Other"
							name={`${name}.Social_History.Lifestyle.Other`}
							Component={UIInputField}
						/>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default SocialHistory;
