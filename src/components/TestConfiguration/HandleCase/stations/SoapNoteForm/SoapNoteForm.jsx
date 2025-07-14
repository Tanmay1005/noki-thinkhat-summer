// SoapNoteForm.jsx
import { Box, Typography } from "@mui/material";
import CommonStationForm, {
	GenericExplanationForm,
} from "../CommonStationForm";
import { SoapNoteTabs } from "./SoapNoteTabs";

const SoapNoteForm = ({ selectedStation = {} }) => {
	return (
		<>
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
				<Box className="my-3">
					<SoapNoteTabs
						fieldName={`stations.${selectedStation?.value}.expertApproach.soapNote`}
					/>
				</Box>
				<GenericExplanationForm selectedStation={selectedStation} />
			</div>
		</>
	);
};

export default SoapNoteForm;
