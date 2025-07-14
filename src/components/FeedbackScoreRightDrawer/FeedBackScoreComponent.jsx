import FeedbackCircuits from "./FeedBackCircuits";
import FeedBackMultiStationCases from "./FeedBackMultiStationCases";

const FeedBackScoreComponent = ({ data, isMultiStation }) => {
	return (
		<>
			{isMultiStation ? (
				<FeedBackMultiStationCases data={data} />
			) : (
				<FeedbackCircuits circuitsData={data} />
			)}
		</>
	);
};

export default FeedBackScoreComponent;
