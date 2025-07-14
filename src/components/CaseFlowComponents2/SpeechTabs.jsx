import { Box, Tab, Tabs } from "@mui/material";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import { CustomScrollButton } from "components/CaseFlowComponents/CaseTabsCard";
import { convertCaseDetailsToString } from "helpers/common_helper";
import { getStationConfigForCase } from "helpers/station_helpers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TabPanel, { a11yProps } from "../ReusableComponents/Tabs";
import UICard from "../ReusableComponents/UICard";
import RefreshButton from "../ReusableComponents/buttons/RefreshButton";
import GeneratingCDSS from "../SpeechComponents/GeneratingCDSS";
import LiveTranscript from "../SpeechComponents/LiveTranscript";
import ProgressBarCard from "./ProgressBarCard";

const SpeechTabs = ({ caseDetails, stationDetails }) => {
	const [value, setValue] = useState(0);
	const [CDSSJson, setCDSSJson] = useState();
	const [requestTime, setRequestTime] = useState(0);
	const config = getStationConfigForCase(stationDetails?.type);
	const { isRecording, isPaused, recordingTime, transcription } = useSelector(
		(state) => state.speech,
	);

	const handleChange = (_event, newValue) => {
		setValue(newValue);
	};

	const themeMode = useSelector((state) => state.app.theme);
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";

	const isPublic = caseDetails?.visibility === "public";

	useEffect(() => {
		if (isRecording) {
			setValue(isPublic ? 1 : 0);
		}
	}, [isRecording, isPublic]);

	useEffect(() => {
		if (
			isPublic &&
			config.cdss &&
			recordingTime % 10 === 0 &&
			recordingTime !== 0 &&
			!isPaused
		) {
			callCdssAPI();
		}
	}, [recordingTime, isPaused, isPublic]);
	let caseObjectives = caseDetails?.fhirQuestionnaire?.item?.find((item) => {
		return item?.linkId === "case-objectives";
	});

	if (caseObjectives) {
		caseObjectives = JSON.parse(caseObjectives?.text);
		caseObjectives = caseObjectives?.objectives?.map(
			(objective) => objective?.value,
		);
	}

	const callCdssAPI = async () => {
		try {
			const mappedString = transcription?.length
				? transcription
						.map((t) => `${t?.speakerText}`)
						.join(", ")
						.trim()
				: "";
			// if (!mappedString) return;
			const response = await EXECUTE_PROMPT({
				prompt_code: "dynamic-cdss-prompt",
				payload: {
					case_details: convertCaseDetailsToString(caseDetails),
					transcript: mappedString,
					station_name: `${stationDetails?.type}`,
					station_objectives: `${caseObjectives || stationDetails.objectives}`,
				},
			});
			setCDSSJson(response?.data);
			setRequestTime(recordingTime);
		} catch (e) {
			console.error(e);
		}
	};

	const refreshCdss = async () => {
		await callCdssAPI();
	};

	const convertRubricsToHtml = (rubrics) => {
		if (!rubrics) return "";
		let html = "";
		rubrics.map((rubric) => {
			html += `<strong>${rubric?.category} :</strong>`;
			rubric?.criteria?.map((c) => {
				html += `<li style="margin-left: 24px;">${c}</li>`;
			});
			html += "<br>";
		});
		return html;
	};
	const rubrics = caseDetails?.fhirQuestionnaire?.item?.find(
		(item) => item.linkId === "rubrics",
	);
	let rubricsHtml = null;
	if (rubrics) {
		rubricsHtml = convertRubricsToHtml(JSON.parse(rubrics?.text).rubrics);
	}
	return (
		<>
			{config?.objectives && (
				<div className="col-12 mb-3">
					<ProgressBarCard
						stationDetails={stationDetails}
						CDSSJson={CDSSJson}
						caseDetails={caseDetails}
						caseObjectives={caseObjectives}
						onRefresh={refreshCdss}
					/>
				</div>
			)}

			<UICard
				customBodyClasses="p-0 border-0"
				customClasses="p-0 border-0"
				sx={{ border: "none" }}
				CardBody={
					<Box sx={{ width: "100%", border: "none" }}>
						<Tabs
							value={value}
							onChange={handleChange}
							aria-label="basic tabs example"
							scrollButtons="auto"
							allowScrollButtonsMobile
							fullWidth
							variant="scrollable"
							ScrollButtonComponent={CustomScrollButton}
							sx={{
								width: "100%",
							}}
							TabIndicatorProps={{ style: { display: "none" } }}
						>
							{config.caseDetails && (
								<Tab
									label="Case Details"
									key="speech-tab-case-details"
									{...a11yProps(0)}
									fullWidth
									sx={{
										fontWeight: 600,
										fontSize: "12px",
										lineHeight: "27.28px",
										textTransform: "capitalize",
										"&.Mui-selected": {
											backgroundColor: CardColor2,
											"&:hover": {
												backgroundColor: CardColor2,
											},
											borderRadius: "16px 16px 0 0",
										},
									}}
								/>
							)}
							{config.rubrics && rubrics && (
								<Tab
									label="Rubrics"
									key="speech-tab-rubrics"
									fullWidth
									{...a11yProps(1)}
									sx={{
										fontWeight: 600,
										fontSize: "12px",
										lineHeight: "27.28px",
										textTransform: "capitalize",
										"&.Mui-selected": {
											backgroundColor: CardColor2,
											"&:hover": {
												backgroundColor: CardColor2,
											},
											borderRadius: "16px 16px 0 0",
										},
									}}
								/>
							)}
							{isPublic && config.cdss && (
								<Tab
									label={
										<Box display="flex" alignItems="center" gap={1}>
											CDSS
											<RefreshButton
												onRefresh={refreshCdss}
												disabled={!isRecording || isPaused}
											/>
										</Box>
									}
									{...a11yProps(rubrics ? 2 : 1)}
									key="speech-tab-cdss"
									sx={{
										fontWeight: 600,
										fontSize: "12px",
										lineHeight: "27.28px",
										textTransform: "capitalize",
										"&.Mui-selected": {
											backgroundColor: CardColor2,
											"&:hover": {
												backgroundColor: CardColor2,
											},
											borderRadius: "16px 16px 0 0",
										},
									}}
								/>
							)}
							{config?.transcript && (
								<Tab
									label="Transcript"
									{...a11yProps(isPublic && rubrics ? 3 : 2)}
									key="speech-tab-transcript"
									sx={{
										fontWeight: 600,
										fontSize: "12px",
										lineHeight: "27.28px",
										textTransform: "capitalize",
										"&.Mui-selected": {
											backgroundColor: CardColor2,
											"&:hover": {
												backgroundColor: CardColor2,
											},
											borderRadius: "16px 16px 0 0",
										},
									}}
								/>
							)}
						</Tabs>
						{config.caseDetails && (
							<TabPanel
								value={value}
								index={0}
								style={{
									backgroundColor: CardColor2,
									height: "clamp(300px, 50vh, 500px)",
								}}
							>
								<div
									className="row d-flex justify-content-center align-items-start h-100 overflow-auto"
									style={{ borderRadius: "10px" }}
								>
									<div
										className="col-12"
										dangerouslySetInnerHTML={{
											__html: caseDetails?.description,
										}}
									/>
								</div>
							</TabPanel>
						)}
						{config.rubrics && rubrics && (
							<TabPanel
								value={value}
								index={1}
								style={{
									backgroundColor: CardColor2,
									height: "clamp(300px, 50vh, 500px)",
								}}
							>
								<div
									className="row d-flex justify-content-center align-items-start h-100 overflow-auto"
									style={{ borderRadius: "10px" }}
								>
									<div
										className="col-12"
										dangerouslySetInnerHTML={{
											__html: rubricsHtml,
										}}
									/>
								</div>
							</TabPanel>
						)}
						{isPublic && config.cdss && (
							<TabPanel
								value={value}
								index={rubrics ? 2 : 1}
								style={{
									backgroundColor: CardColor2,
									height: "clamp(300px, 50vh, 500px)",
								}}
							>
								<GeneratingCDSS
									isRecording={isRecording}
									CDSSJson={CDSSJson}
									requestTime={requestTime}
								/>
							</TabPanel>
						)}
						{config.transcript && (
							<TabPanel
								value={value}
								index={isPublic && rubrics ? 3 : 2}
								style={{
									backgroundColor: CardColor2,
									height: "clamp(300px, 50vh, 500px)",
								}}
							>
								<LiveTranscript transcription={transcription} />
							</TabPanel>
						)}
					</Box>
				}
			/>
		</>
	);
};

export default SpeechTabs;
