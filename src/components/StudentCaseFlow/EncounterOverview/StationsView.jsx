import { UITabs } from "components/ReusableComponents/Tabs";
import CaseJsonToHtml from "helpers/CaseJsonToHtml";
import { isEmpty } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { useSelector } from "react-redux";

const StationsView = () => {
	const stationMap = useSelector((state) => state?.stations?.stationMap);
	const [stationList, setStationList] = useState([]);
	const [selectedStation, setSelectedStation] = useState();
	const isInitialized = useRef(false);
	const station = useWatch({ name: "applicable_types" });

	useEffect(() => {
		if (!isEmpty(station) && !isInitialized.current) {
			const stationIdList = station || [];
			const tempTabsValue = stationIdList.map((item) => ({
				value: item,
				label: stationMap?.[item]?.type,
			}));
			setStationList(tempTabsValue);
			setSelectedStation(tempTabsValue?.[0]);
			isInitialized.current = true;
		}
	}, [station]);

	const handleChange = (_event, newValue) => {
		const found = stationList.find((item) => item?.value === newValue);
		setSelectedStation(found);
	};

	return (
		<div className="d-flex flex-column h-100">
			<UITabs
				tabList={stationList?.map((item) => {
					return {
						label: (
							<div
								style={{
									display: "flex",
									alignItems: "center",
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
			<div className="flex-1 h-100 overflow-auto">
				<CaseJsonToHtml
					name={`stations.${selectedStation?.value}`}
					// jsonData={getValues(`stations.${selectedStation?.value}`)}
				/>
			</div>
		</div>
	);
};

export default StationsView;
