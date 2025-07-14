import { Grid, Typography } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	PATIENT_EDUCATION,
	PROCEDURES,
	PROFESSIONALISM,
	SOAP_NOTE,
} from "helpers/constants";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import FormFieldController from "../sections/FormFieldController";
const haveTranscriptStation = {
	[FOCUSED_HISTORY]: false,
	[FOCUSED_PHYSICAL_EXAMINATION]: true,
	[ASSESSMENT_PLAN]: true,
	[DIAGNOSTIC_TESTS]: true,
	[SOAP_NOTE]: true,
	[PROCEDURES]: true,
	[PATIENT_EDUCATION]: true,
	[PROFESSIONALISM]: true,
};
const Transcript = () => {
	const { control } = useFormContext();
	const stationMap = useSelector((state) => state?.stations?.stationMap);
	const applicableTypes = useWatch({
		control,
		name: "applicable_types",
	});
	return (
		<>
			{applicableTypes?.length === 1 &&
				haveTranscriptStation[stationMap?.[applicableTypes]?.type] && (
					<div className="secondary-bg-color m-3 rounded rounded-4 flex-grow-1">
						<Grid container className="p-2 px-3">
							<Grid
								item
								xs={12}
								className="mb-3 mt-2 d-flex justify-content-between align-items-center"
							>
								<Typography fontSize={"1.1rem"} fontWeight={"bold"}>
									Transcript
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<FormFieldController
									name="transcript"
									Component={CustomRichTextEditor}
									extraProps={{
										heightClass: "larger",
									}}
								/>
							</Grid>
						</Grid>
					</div>
				)}
		</>
	);
};

export default Transcript;
