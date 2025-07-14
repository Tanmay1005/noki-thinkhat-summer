import { Typography } from "@mui/material";
import OldCarts from "../common/OldCarts";
import CommonStationForm, { GenericExplanationForm } from "./CommonStationForm";

const FocusedHistoryForm = ({ selectedStation = {} }) => {
	return (
		<div>
			<CommonStationForm selectedStation={selectedStation} />
			<div className="secondary-bg-color rounded rounded-4 mt-3 p-3">
				<Typography
					component="span"
					sx={{
						width: "33%",
						flexShrink: 0,
						fontWeight: "bold",
						fontSize: "1.1rem",
					}}
				>
					Expert Approach
				</Typography>
				<div className="my-3">
					<OldCarts
						formFieldName={`stations.${selectedStation?.value}.expertApproach`}
					/>
				</div>
				<GenericExplanationForm selectedStation={selectedStation} />
			</div>
		</div>
	);
};

export default FocusedHistoryForm;
