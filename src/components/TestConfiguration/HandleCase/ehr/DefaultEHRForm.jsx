import { Grid, Typography } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import FormFieldController from "../sections/FormFieldController";

const DefaultEHRForm = ({ name = "" }) => {
	return (
		<div className="ehr-tab-style-case-creation">
			<Grid container className="p-2 px-3">
				<Grid
					item
					xs={12}
					className="mb-3 mt-2 d-flex justify-content-between align-items-center"
				>
					<Typography fontSize={"1.1rem"} fontWeight={"bold"}>
						Description
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<FormFieldController
						name={`${name}.description`}
						Component={CustomRichTextEditor}
						extraProps={{
							heightClass: "medium",
						}}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

export default DefaultEHRForm;
