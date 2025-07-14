// SubjectiveTab.jsx
import { Box, Typography } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "components/TestConfiguration/HandleCase/sections/FormFieldController";

const ObjectiveTab = ({ fieldName }) => {
	const basePath = `${fieldName}.Objective`;
	return (
		<Box sx={{ padding: 2, borderRadius: 2 }}>
			<Box>
				<Typography fontWeight="bold">Vital Signs</Typography>
				<p>
					Include only if values are provided or relevant to today’s assessment.
				</p>
				<FormFieldController
					name={`${basePath}.Vitals`}
					Component={CustomRichTextEditor}
					extraProps={{ rows: 4, multiline: true }}
				/>
			</Box>
			<Box sx={{ mt: 2 }}>
				<Typography fontWeight="bold">
					Physical Exam – Pertinent Findings
				</Typography>
				<p>
					Structured by system; include only findings relevant to this
					encounter, both normal and abnormal.
				</p>
				<FormFieldController
					name={`${basePath}.Physical_Exam_Pertinent_Findings`}
					Component={UIInputField}
					extraProps={{ rows: 4, multiline: true }}
				/>
			</Box>
			<Box sx={{ mt: 2 }}>
				<Typography fontWeight="bold">Diagnostic Results</Typography>
				<p>
					Include only relevant lab, imaging, or other diagnostic results if
					available.
				</p>
				<FormFieldController
					name={`${basePath}.Diagnostic_Results`}
					Component={UIInputField}
					extraProps={{ rows: 4, multiline: true }}
				/>
			</Box>
		</Box>
	);
};

export default ObjectiveTab;
