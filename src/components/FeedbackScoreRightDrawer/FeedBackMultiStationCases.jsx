import AssessmentFeedback from "components/AssessmentFeedback/AssessmentFeedback";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getStations } from "../../redux/thunks/stations";

const FeedBackMultiStationCases = ({ data }) => {
	const [value, setValue] = useState(0);
	const [selectedStation, setSelectedStation] = useState(null);
	const stations = data?.selected_stations;
	const handleTabChange = (_event, newValue) => {
		setValue(newValue);
	};
	const stationMap = useSelector((state) => state.stations?.stationMap);
	const reduxDispatch = useDispatch();

	useEffect(() => {
		setSelectedStation(data);
		if (!stationMap) {
			reduxDispatch(getStations());
		}
	}, [value]);
	return (
		<>
			<div className="px-2 d-flex justify-content-between align-items-center mt-3">
				<UITabs
					scrollButtons="auto"
					tabList={stations?.map((station) => stationMap[station]?.type)}
					handleTabChange={handleTabChange}
					value={value}
					sx={{
						width: "max-content",
					}}
				/>
			</div>

			{selectedStation && (
				<div style={{ height: "100%" }}>
					{stations?.map((station, index) => (
						<TabPanel
							className="rounded-bottom-4 px-2 "
							value={value}
							index={index}
							key={`tab-${station}`}
						>
							<AssessmentFeedback
								circuitsData={data}
								caseData={data?.case}
								station={stationMap[station]?.id}
								displayBackButton={false}
							/>
						</TabPanel>
					))}
				</div>
			)}
		</>
	);
};

export default FeedBackMultiStationCases;
