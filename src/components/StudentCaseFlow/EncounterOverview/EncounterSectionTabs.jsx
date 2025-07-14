import { Box, Tab, Tabs, tabsClasses } from "@mui/material";
// EncounterSectionTabs.tsx
import { useEffect, useState } from "react";

import { NoteOutlined } from "@mui/icons-material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
// --- icons (pick the ones you prefer) ---
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import FileUploadViewer from "components/TestConfiguration/HandleCase/common/FileUploadViewer";
import ClinicalReasoning from "components/TestConfiguration/HandleCase/ehr/ClinicalReasoning";
import DefaultEHRForm from "components/TestConfiguration/HandleCase/ehr/DefaultEHRForm";
import MedicalSocialBackground from "components/TestConfiguration/HandleCase/ehr/MedicalSocialBackground";
import Objective from "components/TestConfiguration/HandleCase/ehr/Objective";
import PatientOverview from "components/TestConfiguration/HandleCase/ehr/PatientOverview";
import Subjective from "components/TestConfiguration/HandleCase/ehr/Subjective";
import CaseJsonToHtml from "helpers/CaseJsonToHtml";
import { startCase } from "lodash";
import { useFormContext } from "react-hook-form";

const componentMap = {
	Patient_Overview: PatientOverview,
	Subjective: Subjective,
	Medical_And_Social_Background: MedicalSocialBackground,
	Objective: Objective,
	Clinical_Reasoning: ClinicalReasoning,
	documents: FileUploadViewer,
};

const IGNORABLE_TABS = [
	"Patient_Overview",
	"Subjective",
	"Medical_And_Social_Background",
	"Objective",
	"Clinical_Reasoning",
	"fileId",
	"documents",
	"isExisting",
];

export default function EncounterSectionTabs({ name = "", view = false }) {
	const { getValues } = useFormContext();
	const [selectedEHRTab, setSelectedEHRTab] = useState("Patient_Overview");
	const SelectedComponent = componentMap[selectedEHRTab] || DefaultEHRForm;
	const encounterTabsData = getValues(name);

	const [tabsConfig, setTabsConfig] = useState([
		{
			label: "Patient Overview",
			value: "Patient_Overview",
			icon: <PersonOutlineIcon />,
		},
		{
			label: "Subjective",
			value: "Subjective",
			icon: <AssignmentOutlinedIcon />,
		},
		{
			label: "Medical & Social\nBackground",
			value: "Medical_And_Social_Background",
			icon: <FolderSharedOutlinedIcon />,
		},
		{
			label: "Objective",
			value: "Objective",
			icon: <MedicalServicesOutlinedIcon />,
		},
		{
			label: "Clinical Reasoning",
			value: "Clinical_Reasoning",
			icon: <TimelineOutlinedIcon />,
		},
		{
			label: "Additional Documents",
			value: "documents",
			icon: <DescriptionOutlinedIcon />,
		},
	]);

	useEffect(() => {
		if (!encounterTabsData || typeof encounterTabsData !== "object") return;

		const extraKeys = Object.keys(encounterTabsData).filter(
			(item) => !IGNORABLE_TABS.includes(item),
		);

		// Get current tab values to avoid duplicates
		const existingTabValues = new Set(tabsConfig.map((tab) => tab.value));

		// Find only new tabs that are not already added
		const newTabs = extraKeys
			.filter((key) => !existingTabValues.has(key))
			.map((key) => ({
				label: startCase(key),
				value: key,
				icon: <NoteOutlined />,
			}));

		if (newTabs.length === 0) return; // 🔁 Nothing to add, skip update

		setTabsConfig((prev) => [...prev, ...newTabs]);
	}, []);

	return (
		<div className="h-100 d-flex flex-column">
			<Box>
				<Tabs
					value={selectedEHRTab}
					onChange={(_, v) => setSelectedEHRTab(v)}
					variant="scrollable"
					scrollButtons="auto"
					sx={{
						[`& .${tabsClasses.scrollButtons}`]: {
							"&.Mui-disabled": { opacity: 0.3 },
						},
					}}
					allowScrollButtonsMobile
					TabIndicatorProps={{ style: { display: "none" } }} // hide blue underline
				>
					{tabsConfig?.map(({ label, value, icon }, _idx) => (
						<Tab
							key={value}
							value={value}
							icon={icon}
							iconPosition="top"
							label={label}
							sx={{
								px: 2,
								whiteSpace: "pre-line",
								textTransform: "none",
								color: "text.primary",
								fontSize: "1em",
								svg: { fontSize: "1.5rem", mb: 0.5 },
								"&.Mui-selected": {
									bgcolor: "background.paper",
									borderRadius: "1rem 1rem 0 0",
									boxShadow: "0 -2px 4px rgba(0,0,0,0.05)",
									color: "#5D5FEF",
									svg: { color: "#5D5FEF" },
								},
								"&:hover": {
									bgcolor: "rgba(93,95,239,0.08)",
									borderRadius: "1rem 1rem 0 0",
								},
							}}
						/>
					))}
				</Tabs>
			</Box>
			<div className="flex-1 p-1 h-100 secondary-bg-color rounded-bottom-4 overflow-auto">
				{view ? (
					selectedEHRTab === "documents" ? (
						<FileUploadViewer viewOnly name={name} />
					) : (
						<CaseJsonToHtml
							key={`${name}.${selectedEHRTab}`}
							name={`${name}.${selectedEHRTab}`}
						/>
					)
				) : (
					<SelectedComponent
						viewOnly={selectedEHRTab === "documents"}
						name={
							selectedEHRTab === "documents"
								? name
								: `${name}.${selectedEHRTab}`
						}
					/>
				)}
			</div>
		</div>
	);
}
