import StationTracker from "components/CaseFlowComponents2/StepperBar";
import { useWatch } from "react-hook-form";
import { useSelector } from "react-redux";

const Tracker = () => {
	const { stationMap } = useSelector((state) => state.stations);
	const nextStationDetails = useWatch({
		name: "nextStationDetails",
		defaultValue: {},
	});
	const osceType = useWatch({
		name: "osceType",
	});
	const timeTaken = useWatch({
		defaultValue: 0,
		name: "timeTaken",
	});
	const currentStationId = useWatch({
		name: "currentStationId",
	});
	const maxTime = stationMap?.[currentStationId]?.time_limit * 60;
	let props = {};
	switch (osceType) {
		case "circuit":
			{
				const { totalCases, unAttemptedCase } = nextStationDetails;

				props = {
					totalCases: totalCases,
					activeStep: totalCases - unAttemptedCase + 1,

					completedCase: totalCases - unAttemptedCase,
				};
			}
			break;
		case "case":
		case "station":
			props = {
				totalCases: 1,
				activeStep: 1,
				completedCase: 0,
				stages: [stationMap?.[currentStationId]?.type],
			};
			break;
		case "multi":
			{
				const { completed_stations = [], selected_stations } =
					nextStationDetails;
				props = {
					totalCases: selected_stations?.length,
					activeStep: (completed_stations?.length || 0) + 1,
					completedCase: completed_stations?.length || 0,
					stages: selected_stations?.map(
						(station) => stationMap?.[station]?.type,
					),
				};
			}
			break;
	}
	return (
		<div className="card-bg-secondary p-2">
			<StationTracker {...props} percentage={(timeTaken / maxTime) * 100} />
		</div>
	);
};

export default Tracker;
