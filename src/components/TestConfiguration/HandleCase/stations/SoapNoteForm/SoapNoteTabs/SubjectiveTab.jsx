// SubjectiveTab.jsx
import { Box, Typography } from "@mui/material";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "components/TestConfiguration/HandleCase/sections/FormFieldController";

const SubjectiveTab = ({ fieldName }) => {
	const basePath = `${fieldName}.Subjective`;
	return (
		<Box sx={{ padding: 2, borderRadius: 2 }}>
			<Box>
				<Typography fontWeight="bold">Chief Complaint</Typography>
				<p>The patient’s main concern in their own words or paraphrased.</p>
				<FormFieldController
					name={`${basePath}.Chief_Complaint`}
					Component={UIInputField}
					extraProps={{
						rows: 4,
						multiline: true,
					}}
					// disabled={isInputDisabled}
				/>
			</Box>
			<Box sx={{ mt: 2 }}>
				<Typography fontWeight="bold">Pertinent Review of Systems</Typography>
				<p>List only systems relevant to the patient’s current issue.</p>
				<FormFieldController
					name={`${basePath}.Pertinent_Review_of_Systems`}
					Component={UIInputField}
					extraProps={{ rows: 4, multiline: true }}
					// disabled={isInputDisabled}
				/>
			</Box>
			<Box sx={{ mt: 2 }}>
				<Typography fontWeight="bold">
					Pertinent PMH / Meds / Allergies / Social History
				</Typography>
				<p>Include only information that directly informs today’s visit.</p>
				<FormFieldController
					name={`${basePath}.Pertinent_PMH_Meds_Allergies_Social_History`}
					Component={UIInputField}
					extraProps={{ rows: 4, multiline: true }}
					// disabled={isInputDisabled}
				/>
			</Box>

			<Box
				sx={{
					width: "100%",
					borderRadius: "8px",
					borderWidth: "1px",
					gap: "10px",
					padding: "8px",
					background: "var(--info-banner-bgDanger)",
					border: "1px solid #EF000033",
					mt: 2,
					color: "var(--info-banner-textDanger)",
				}}
			>
				Do not copy-paste full ROS or PMH. This field is for clinical reasoning,
				not data regurgitation.
			</Box>
		</Box>
	);
};

export default SubjectiveTab;
