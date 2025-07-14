import { Tab, Tabs, tabsClasses } from "@mui/material";
import { a11yProps } from "components/ReusableComponents/Tabs";
import OldCarts from "components/TestConfiguration/HandleCase/common/OldCarts";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import EncounterSectionTabs from "./EncounterSectionTabs";
import StationsView from "./StationsView";
import TranscriptView from "./TranscriptView";

const componentMap = {
	Current_Encounter_EHR: EncounterSectionTabs,
	Past_Encounter_EHR: EncounterSectionTabs,
	stations: StationsView,
	transcript: TranscriptView,
	OLDCARTS: OldCarts,
};

const componentValueMap = {
	Current_Encounter_EHR: "student.Current_Encounter_EHR",
	Past_Encounter_EHR: "ehrData.Past_Encounter_EHR",
	stations: "stations",
	transcript: "transcript",
	OLDCARTS: "student",
};

const haveTranscriptStation = {
	[FOCUSED_HISTORY]: false,
	[FOCUSED_PHYSICAL_EXAMINATION]: true,
	[ASSESSMENT_PLAN]: true,
	[DIAGNOSTIC_TESTS]: true,
	[SOAP_NOTE]: true,
};

const EncounterOverviewPanel = () => {
	const location = useLocation();
	const pathname = location.pathname;
	const applicableTypes = useWatch({
		name: "applicable_types",
	});
	const currentStationId = useWatch({ name: "currentStationId" });
	const stationMap = useSelector((state) => state?.stations?.stationMap);

	const [tabsList, setTabsList] = useState([
		{ label: "Current Encounter", value: "Current_Encounter_EHR" },
		{ label: "Past Encounter", value: "Past_Encounter_EHR" },
		{ label: "Stations", value: "stations" },
		// { label: "Transcript", value: "transcript" },
		// { label: "OLD CARTS", value: "OLDCARTS" },
	]);

	useEffect(() => {
		let tempTabList = tabsList;
		if (pathname.startsWith("/attempt")) {
			tempTabList = tabsList?.filter((item) => item?.value !== "stations");
		}

		if (
			applicableTypes?.length === 1 &&
			haveTranscriptStation[stationMap?.[applicableTypes]?.type]
		) {
			tempTabList?.push({ label: "Transcript", value: "transcript" });
		}

		if (
			pathname.startsWith("/attempt") &&
			stationMap?.[currentStationId]?.type === FOCUSED_HISTORY
		) {
			tempTabList?.push({ label: "OLD & CARTS", value: "OLDCARTS" });
		}

		setTabsList([...tempTabList]);
	}, []);

	const [tabValue, setTabValue] = useState("Current_Encounter_EHR");

	const handleTabChange = (_e, value) => {
		setTabValue(value);
	};

	return (
		<div className="encounter-overview-panel-card d-flex flex-column gap-2 rounded-4 h-100">
			<div key={tabsList?.length}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					aria-label="encounter overview tabs"
					variant="scrollable"
					scrollButtons="auto"
					allowScrollButtonsMobile
					sx={{
						[`& .${tabsClasses.scrollButtons}`]: {
							"&.Mui-disabled": { opacity: 0.3 },
						},
						backgroundColor: "#fff",
						borderRadius: "35px",
						width: "100%",
						minHeight: "",
						padding: 0,
						margin: 0,
					}}
					TabIndicatorProps={{ style: { display: "none" } }}
				>
					{tabsList?.map((tab, index) => (
						<Tab
							key={`tab-${tab.label}-${index}`}
							label={tab.label}
							value={tab.value}
							{...a11yProps(index)}
							sx={{
								// backgroundColor: "#fff",
								fontWeight: 500,
								fontSize: "14px",
								textTransform: "capitalize",
								whiteSpace: "nowrap",
								minHeight: "auto",
								px: 2.5,
								"&.Mui-selected": {
									backgroundColor: "#5D5FEF",
									color: "white",
									"&:hover": {
										backgroundColor: "#5D5FEF",
									},
									borderRadius: "35px",
								},
							}}
						/>
					))}
				</Tabs>
			</div>
			<div className="flex-1 h-100 overflow-hidden">
				{tabsList?.map?.((tab) => {
					const Component = componentMap[tab?.value];
					const valueFrom = componentValueMap[tab?.value];

					return (
						<div
							className="h-100 overflow-auto"
							key={tab?.value}
							style={{
								display: tabValue === tab.value ? "block" : "none",
							}}
						>
							<Component
								view={tab?.value === "Past_Encounter_EHR"}
								name={valueFrom}
								formFieldName={valueFrom}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default EncounterOverviewPanel;
