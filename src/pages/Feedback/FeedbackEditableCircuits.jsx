import EditableJson from "components/AssessmentFeedback/EditableJson";
// import EditableSummary from "components/AssessmentFeedback/EditableSummary";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";

const FeedbackCircuits = ({
	setEditScoreOpen,
	circuitsData,
	multiStationCaseData,
	caseData,
	handleRender,
	email,
}) => {
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const [value, setValue] = useState(0);
	const [selectedCase, setSelectedCase] = useState(null);
	const [disableTabs, setDisableTabs] = useState(false);
	const [dataChanged, setDataChanged] = useState(false);
	const [showPopup, setShowPopup] = useState(false);
	const [alertChange, setAlertChange] = useState(null);
	const stationMap = useSelector((state) => state.stations?.stationMap);
	const [title, setTitle] = useState("");
	const patient_id = multiStationCaseData?.case?.fhir_patient_id;

	// const email = caseData?.user_email || circuitsData?.user_email;
	const handleNavigation = (event) => {
		if (dataChanged) {
			setAlertChange("navigation");
			setShowPopup(true);
			return;
		}
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			setEditScoreOpen(false);
			handleRender();
		}
	};

	const handleTabChange = (_event, newValue) => {
		if (dataChanged) {
			setAlertChange({ tab: newValue });
			setShowPopup(true);
			return;
		}
		setValue(newValue);
	};
	const attemptId = circuitsData
		? circuitsData?.id
		: caseData?.id || multiStationCaseData?.id;
	let cases = [];
	let stations = [];
	if (circuitsData) {
		cases = circuitsData?.circuit?.circuit_station_cases?.reduce(
			(acc, station) => {
				if (station.case) {
					acc.push(station.case);
				}
				return acc;
			},
			[],
		);
	} else if (caseData) {
		cases = [caseData?.case];
	} else if (multiStationCaseData) {
		stations = multiStationCaseData?.selected_stations?.reduce(
			(acc, station) => {
				if (stationMap[station]?.type) {
					acc.push({ id: station, name: stationMap[station]?.type });
				}
				return acc;
			},
			[],
		);
	}

	useEffect(() => {
		if (cases?.length > 0) {
			setSelectedCase(cases[value]);
		}
		if (stations?.length > 0) {
			setSelectedCase(stations[value]);
		}
	}, [value]);

	let TabItems = [];
	if (cases?.length > 0) {
		TabItems = cases.map((caseItem) => caseItem.name);
	} else if (stations?.length > 0) {
		TabItems = stations.map((station) => station.name);
	}
	let items = [];
	if (cases?.length > 0) {
		items = cases;
	} else if (stations?.length > 0) {
		items = stations;
	}
	return (
		<div className="m-4">
			<UIModal
				open={showPopup}
				handleClose={() => setShowPopup(false)}
				width={400}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h6 style={{ fontWeight: "bold" }}>Are you sure?</h6>
							<span style={{ textAlign: "center" }}>
								All the changes will be unsaved. Do you want to proceed?
							</span>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="Cancel"
							variant="outlined"
							onClick={() => {
								setShowPopup(false);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
						<UIButton
							text="Proceed"
							onClick={() => {
								if (alertChange === "navigation") {
									setShowPopup(false);
									setEditScoreOpen(false);
									handleRender();
								} else if (!Number.isNaN(alertChange?.tab)) {
									setValue(alertChange.tab);
									setShowPopup(false);
								}
							}}
							variant="contained"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<div className="d-flex justify-content-between align-items-center">
				<div>
					<img
						src={GoBackIcon}
						alt="loading.."
						onClick={handleNavigation}
						onKeyUp={handleNavigation}
						style={{ cursor: "pointer" }}
					/>
					<span
						style={{ color: textColor, marginLeft: "5px", fontSize: "1.8vh" }}
					>
						{title}
					</span>
				</div>

				{/* <div
					style={{
						cursor: "pointer",
						fontSize: "1rem",
						border: "1px solid #5840BA",
						color: textColor,
					}}
					className="rounded rounded-pill p-2 px-3 d-flex align-items-center gap-2 me-3"
				>
					<div>Retake Assessment</div>
				</div> */}
			</div>
			<div className="px-2 d-flex justify-content-between align-items-center mt-3">
				<UITabs
					scrollButtons="auto"
					tabList={TabItems}
					handleTabChange={handleTabChange}
					value={value}
					sx={{
						width: "max-content",
					}}
					disabled={disableTabs}
				/>
			</div>

			{selectedCase && (
				<div style={{ height: "100%" }}>
					{items?.map((item, index) => (
						<TabPanel
							className="rounded-bottom-4 px-2 "
							value={value}
							index={index}
							key={`tab-${index + 1}`}
						>
							<EditableJson
								patientId={patient_id || item?.fhir_patient_id}
								attemptId={attemptId}
								{...(stations?.length > 0 && { station: item?.id })}
								type={stations?.length > 0 ? "multi-station-case" : "case"}
								setDisableTabs={setDisableTabs}
								setDataChanged={setDataChanged}
								setTitle={setTitle}
								email={email}
							/>
						</TabPanel>
					))}
				</div>
			)}
		</div>
	);
};

export default FeedbackCircuits;
