import { UITabs } from "components/ReusableComponents/Tabs";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	SOAP_NOTE,
} from "helpers/constants";
import { isEmpty } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import AssessmentAndPlanForm from "../stations/AssessmentAndPlanForm";
import DiagnosticTestsForm from "../stations/DiagnosticTestsForm";
import FocusedHistoryForm from "../stations/FocusedHistoryForm";
import FocusedPhysicalExaminationForm from "../stations/FocusedPhysicalExaminationForm";
import RestStationForm from "../stations/RestStationForm";
import SoapNoteForm from "../stations/SoapNoteForm/SoapNoteForm";

const componentMap = {
	[FOCUSED_HISTORY]: FocusedHistoryForm,
	[FOCUSED_PHYSICAL_EXAMINATION]: FocusedPhysicalExaminationForm,
	[ASSESSMENT_PLAN]: AssessmentAndPlanForm,
	[DIAGNOSTIC_TESTS]: DiagnosticTestsForm,
	[SOAP_NOTE]: SoapNoteForm,
};

const StationBasedFormBuilder = () => {
	const { control } = useFormContext();
	const { errors } = useFormState({ control });

	const stationMap = useSelector((state) => state?.stations?.stationMap);
	const [stationList, setStationList] = useState([]);
	const [selectedStation, setSelectedStation] = useState();
	const isInitialized = useRef(false);
	const stationData = useWatch({ control, name: "applicable_types" });

	useEffect(() => {
		if (!isEmpty(stationData) && !isInitialized.current) {
			const stationIdList = stationData || [];
			const tempTabsValue = stationIdList.map((item) => ({
				value: item,
				label: stationMap?.[item]?.type,
			}));
			setStationList(tempTabsValue);
			setSelectedStation(tempTabsValue?.[0]);
			isInitialized.current = true;
		}
	}, [stationData]);

	const handleChange = (_event, newValue) => {
		const found = stationList.find((item) => item?.value === newValue);
		setSelectedStation(found);
	};

	const hasStationError = (stationId) => {
		const stationErrors = errors?.stations?.[stationId];
		if (!stationErrors) return false;

		return (
			stationErrors?.caseObjectives?.some((obj) => obj?.value) ||
			stationErrors?.rubrics?.some(
				(rubric) => rubric?.category || rubric?.criteria?.some((crit) => crit),
			) ||
			!!stationErrors?.task ||
			!!stationErrors?.expertApproach?.finalDiagnosis?.value
		);
	};

	return (
		<div className="m-3">
			<UITabs
				tabList={stationList?.map((item) => {
					const isError = hasStationError(item.value);
					return {
						label: (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									color: isError ? "#d32f2f" : "inherit",
									fontWeight: isError ? "bold" : "normal",
								}}
							>
								{item?.label}
							</div>
						),
						value: item?.value,
					};
				})}
				value={selectedStation?.value}
				handleTabChange={handleChange}
				scrollButtons="auto"
				sx={{
					".MuiTabs-indicator": {
						backgroundColor: "#000",
					},
					display: stationList?.length === 1 ? "none" : "",
				}}
			/>

			<div className="my-3">
				{stationList.map((station) => {
					const Component = componentMap[station?.label];
					if (!Component) return <RestStationForm selectedStation={station} />;

					return (
						<div
							key={station.value}
							style={{
								display:
									selectedStation?.value === station.value ? "block" : "none",
							}}
						>
							<Component selectedStation={station} />
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default StationBasedFormBuilder;
