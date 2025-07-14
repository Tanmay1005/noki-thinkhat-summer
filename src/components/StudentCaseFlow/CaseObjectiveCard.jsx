import { CircularProgress } from "@mui/material";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import ProgressBar from "components/ReusableComponents/ProgressBar";
import SwitchTabs from "components/ReusableComponents/Switchtabs";
import UIButton from "components/ReusableComponents/UIButton";
import UICheckbox from "components/ReusableComponents/UICheckbox";
import FormFieldController from "components/TestConfiguration/HandleCase/sections/FormFieldController";
import { convertCaseDetailsToString } from "helpers/common_helper";
import useStudentActionCollector from "hooks/useStudentActionCollector";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";

const EhrTab = [
	// { label: "Objectives", value: "Objectives" },
	{ label: "Notes", value: "Notes" },
];
const CaseObjectiveCard = () => {
	const { isRecording, isPaused } = useSelector((state) => state.speech);
	const [activeTab, setActiveTab] = useState(EhrTab[0].value);
	const [progress, setProgress] = useState(0);
	const [tabs, setTabs] = useState(EhrTab);
	const [loading, setLoading] = useState(false);
	const { getValues } = useFormContext();
	const caseData = getValues();
	const { stationMap } = useSelector((state) => state.stations);
	const { getStudentActions } = useStudentActionCollector();
	const currentStationId = getValues("currentStationId");
	const objectiveAutoCheck = getValues("objective_auto_check");
	const stationType = stationMap?.[currentStationId]?.type;
	const rubrics = caseData?.stations?.[currentStationId]?.rubrics || [];
	const caseObjectives =
		caseData?.stations?.[currentStationId]?.caseObjectives || [];
	const [checkedMap, setCheckedMap] = useState(() => {
		const map = {};
		caseObjectives.forEach((_item, index) => {
			map[index] = false;
		});
		return map;
	});

	const callObjectiveStatusAPI = async () => {
		try {
			setLoading(true);
			const payload = {
				case_details: convertCaseDetailsToString(caseData),
				station_name: stationType,
				rubrics,
				station_objectives: caseObjectives,
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
				prompt_code: Object.keys(notes || {})
					? "notes-based-objective-status"
					: "transcript-based-objective-status",
				payload,
			});
			const updatedMap = updateCheckboxMapFromCDSS(
				caseObjectives,
				response?.data?.objective_status,
			);
			setCheckedMap(updatedMap);
			setProgress(calculateProgressPercentage(updatedMap));
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const updateCheckboxMapFromCDSS = (objectivesList, objectiveStatusList) => {
		const updatedMap = {};
		const matchedObjectivesSet = new Set(
			objectiveStatusList
				?.filter((obj) => obj.status === "True")
				.map((obj) => obj.objective),
		);

		objectivesList?.forEach((obj, index) => {
			const label = obj?.value;
			updatedMap[index] = matchedObjectivesSet.has(label);
		});

		return updatedMap;
	};

	const calculateProgressPercentage = (checkedMap) => {
		const total = Object.keys(checkedMap).length;
		const completed = Object.values(checkedMap).filter(Boolean).length;
		return total === 0 ? 0 : Math.round((completed / total) * 100);
	};

	const handleTabChange = (_e, value) => {
		setActiveTab(value);
	};
	useEffect(() => {
		if (objectiveAutoCheck) {
			setTabs([{ label: "Objectives", value: "Objectives" }, ...EhrTab]);
		}
	}, [objectiveAutoCheck]);
	return (
		<div className="d-flex flex-column h-100">
			<div className="px-3 mb-1 py-1">
				<SwitchTabs
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={handleTabChange}
					customStyles={{ marginBottom: "0" }}
					tabStyles={{
						minHeight: "32px",
						padding: "6px 12px",
						fontSize: "0.8rem",
					}}
				/>
			</div>

			<div className="flex-grow-1 overflow-auto px-3">
				{activeTab === "Objectives" ? (
					<div className="d-flex flex-column h-100">
						<div className="px-2">
							<div>Progress</div>
							<ProgressBar percentage={progress} />
						</div>
						<div className="secondary-bg-color rounded-4 mt-2 overflow-auto flex-grow-1 p-3">
							{caseObjectives.map((obj, index) => (
								<div
									key={obj?.id || index}
									className="p-2 d-flex align-items-start gap-2"
								>
									<UICheckbox
										label={obj?.value || `Objective ${index + 1}`}
										checked={checkedMap[index]}
										onChange={(e) => e.preventDefault()}
										FormControlLabelStyles={{
											"& .MuiFormControlLabel-label": {
												fontSize: "1em",
												cursor: "default",
												display: "inline-flex",
												alignItems: "center",
												gap: "1em !important",
											},
										}}
										sx={{
											padding: 0,
											pointerEvents: "none",
											marginRight: "1em",
										}}
									/>
								</div>
							))}
						</div>
						<div className="d-flex justify-content-center p-2">
							<UIButton
								text="Show Completed Objectives"
								variant={"contained"}
								onClick={callObjectiveStatusAPI}
								disabled={!isRecording || isPaused || loading}
								endIcon={
									loading ? (
										<CircularProgress
											sx={{ color: "#fff" }}
											size={14}
											thickness={5}
										/>
									) : null
								}
							/>
						</div>
					</div>
				) : (
					<div className="p-2 secondary-bg-color">
						<FormFieldController
							name="student.notes"
							Component={CustomRichTextEditor}
							extraProps={{ heightClass: "medium" }}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default CaseObjectiveCard;
