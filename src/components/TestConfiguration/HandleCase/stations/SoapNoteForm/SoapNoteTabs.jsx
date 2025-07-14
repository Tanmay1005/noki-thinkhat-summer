// SoapNoteForm.jsx
import { Box, Typography } from "@mui/material";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import { useState } from "react";
import AssessmentTab from "./SoapNoteTabs/AssessmentTab";
import ObjectiveTab from "./SoapNoteTabs/ObjectiveTab";
import PlanTab from "./SoapNoteTabs/PlanTab";
import SubjectiveTab from "./SoapNoteTabs/SubjectiveTab";

const tabConfig = [
	{ label: "Subjective", value: 0, Component: SubjectiveTab },
	{ label: "Objective", value: 1, Component: ObjectiveTab },
	{ label: "Assessment", value: 2, Component: AssessmentTab },
	{ label: "Plan", value: 3, Component: PlanTab },
];

export const SoapNoteTabs = ({ fieldName }) => {
	const [tabIndex, setTabIndex] = useState(0);

	const handleTabChange = (_event, newValue) => setTabIndex(newValue);

	return (
		<Box>
			<Typography className="mt-2 mb-2" fontWeight="bold">
				SOAP Note
			</Typography>
			<UITabs
				tabList={tabConfig}
				value={tabIndex}
				handleTabChange={handleTabChange}
				selectedTabSx={{
					fontSize: "1em",
					lineHeight: "1.705em",
					textTransform: "capitalize",
					"&.Mui-selected": {
						backgroundColor: "var(--tab-bg-secondary)",
						"&:hover": { backgroundColor: "var(--tab-bg-secondary)" },
						borderRadius: "1em 1em 0 0",
					},
				}}
				sx={{
					".MuiTabs-indicator": { backgroundColor: "transparent" },
				}}
			/>
			{tabConfig.map(({ value, Component }) => (
				<TabPanel
					key={value}
					value={tabIndex}
					index={value}
					className="rounded card-bg-admin-table"
				>
					<Component fieldName={fieldName} />
				</TabPanel>
			))}
		</Box>
	);
};
