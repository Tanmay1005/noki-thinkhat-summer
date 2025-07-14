import { Box, Tab, Tabs, tabsClasses } from "@mui/material";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import UIButton from "components/ReusableComponents/UIButton";
import { convertCaseDetailsToString } from "helpers/common_helper";
// import { getStationConfigForCase } from "helpers/station_helpers";
import useStudentActionCollector from "hooks/useStudentActionCollector";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { a11yProps } from "../ReusableComponents/Tabs";
import GeneratingCDSS from "../SpeechComponents/GeneratingCDSS";

const CDSSAndRubricsTabs = () => {
	const [value, setValue] = useState(0);
	const [CDSSJson, setCDSSJson] = useState();
	const [requestTime, setRequestTime] = useState(0);
	const [loading, setLoading] = useState(false);
	const { isRecording, isPaused, recordingTime } = useSelector(
		(state) => state.speech,
	);
	const { stationMap } = useSelector((state) => state.stations);
	const { getValues } = useFormContext();
	const currentStationId = getValues("currentStationId");
	const cdss_request = getValues("cdss_request");
	const stationDetails = stationMap?.[currentStationId];
	// const config = getStationConfigForCase(stationDetails?.type);
	const description = getValues("description");
	// const caseVisibility = getValues("caseVisibilty");
	const rubrics = getValues(`stations.${currentStationId}.rubrics`);
	const { getStudentActions } = useStudentActionCollector();
	const caseDetails = {
		description: description ?? "",
	};
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

	const callCdssAPI = async () => {
		try {
			setLoading(true);
			const payload = {
				case_details: convertCaseDetailsToString(caseDetails),
				station_name: `${stationDetails?.type}`,
				rubrics,
			};
			const { transcript, notes } = getStudentActions();
			if (transcript?.length > 0) {
				payload.transcript = transcript;
			}
			if (notes) {
				payload.notes = notes;
			}
			if (!transcript && !notes) return;
			const response = await EXECUTE_PROMPT({
				prompt_code: "dynamic-cdss-prompt",
				payload,
			});
			setCDSSJson(response?.data);
			setRequestTime(recordingTime);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
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
	let rubricsHtml = null;
	if (rubrics?.length > 0) {
		rubricsHtml = convertRubricsToHtml(rubrics);
	}
	return (
		<>
			<div className="h-100 overflow-hidden d-flex flex-column rounded-bottom-4">
				<div>
					<Tabs
						value={value}
						onChange={handleChange}
						aria-label="encounter overview tabs"
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
						sx={{
							[`& .${tabsClasses.scrollButtons}`]: {
								"&.Mui-disabled": { opacity: 0.3 },
							},
							width: "100%",
							minHeight: "",
							padding: 0,
							margin: 0,
						}}
						TabIndicatorProps={{ style: { display: "none" } }}
					>
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
						{rubrics && (
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
						{cdss_request && (
							<Tab
								label="CDSS"
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
					</Tabs>
				</div>
				<div
					className="h-100 flex-1 overflow-auto p-2"
					style={{ backgroundColor: CardColor2 }}
				>
					{value === 0 && (
						<div
							className="col-12"
							dangerouslySetInnerHTML={{
								__html: caseDetails?.description,
							}}
						/>
					)}
					{rubrics && value === 1 && (
						<div
							className="col-12"
							dangerouslySetInnerHTML={{
								__html: rubricsHtml,
							}}
						/>
					)}
					{cdss_request && value === (rubrics ? 2 : 1) && (
						<div className="h-100 d-flex flex-column">
							<Box
								sx={{
									flexGrow: 1,
									overflowY: "auto",
								}}
							>
								<GeneratingCDSS
									isRecording={isRecording}
									CDSSJson={CDSSJson}
									requestTime={requestTime}
								/>
							</Box>
							<Box
								sx={{
									mt: 2,
									textAlign: "center",
								}}
							>
								<UIButton
									text="Show CDSS"
									variant="contained"
									onClick={refreshCdss}
									disabled={!isRecording || isPaused || loading}
									sx={{ textTransform: "capitalize" }}
								/>
							</Box>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default CDSSAndRubricsTabs;
