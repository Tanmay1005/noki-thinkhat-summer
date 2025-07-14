// SubjectiveTab.jsx
import { Box, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "components/TestConfiguration/HandleCase/sections/FormFieldController";

const AssessmentTab = ({ fieldName }) => {
	const basePath = `${fieldName}.Assessment`;
	return (
		<Box sx={{ padding: 2, borderRadius: 2 }}>
			<Box>
				<Typography fontWeight="bold">Problem List / Diagnoses</Typography>
				<p>
					Provide a concise, numbered list of current issues. Use ICD-style
					impressions or descriptive clinical terms.
				</p>
				<FormFieldController
					name={`${basePath}.Problem_List_Diagnoses`}
					Component={UIInputField}
					extraProps={{ rows: 4, multiline: true }}
				/>
			</Box>

			<Box
				sx={{
					width: "100%",
					borderRadius: "8px",
					borderWidth: "1px",
					gap: "10px",
					padding: "8px",
					background: "var(--info-banner-background)",
					border: "1px solid #5D5FEF33",
					mt: 2,
					color: "var(--info-banner-text)",
				}}
			>
				For wellness visits, include entries like “General health maintenance”
				or “Pre-college physical.
			</Box>

			<Box sx={{ mt: 2 }}>
				<Typography fontWeight="bold">Clinical Reasoning</Typography>
				<p>
					Briefly explain how the subjective and objective findings support your
					diagnosis.
				</p>
				<FormFieldController
					name={`${basePath}.Clinical_Reasoning`}
					Component={UIInputField}
					extraProps={{ rows: 4, multiline: true }}
				/>
			</Box>
		</Box>
	);
};

export default AssessmentTab;
