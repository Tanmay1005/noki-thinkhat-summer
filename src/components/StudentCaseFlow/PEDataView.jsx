import { Box, Typography } from "@mui/material";
import AudioFileCarousel from "components/ReusableComponents/AudioCarousel";
import FileUploadViewer from "components/TestConfiguration/HandleCase/common/FileUploadViewer";
import { useFormContext, useWatch } from "react-hook-form";

const PEDataView = () => {
	const { getValues } = useFormContext();
	const currentStationId = getValues("currentStationId");
	const activePE = useWatch({
		name: "activePE",
	});
	const expertPE = getValues(
		`stations.${currentStationId}.expertApproach.PETests`,
	);
	const selectedPEIndex = expertPE?.findIndex(({ id }) => id === activePE?.id);

	return (
		<Box
			sx={{
				height: "100%",
				width: "100%",
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				background: "#fff",
				borderRadius: "12px",
				padding: "2em",
				gap: "1.5em",
			}}
		>
			{selectedPEIndex >= 0 ? (
				<>
					<Box sx={{ height: "10%" }}>
						<Typography fontSize="1rem">{expertPE?.[0]?.name} </Typography>
						<Box className="overflow-auto" maxHeight="5.5em">
							{expertPE?.[0]?.Textual_Summary}
						</Box>
					</Box>
					<Box sx={{ height: "70%" }}>
						<FileUploadViewer
							name={`stations.${currentStationId}.expertApproach.PETests.${selectedPEIndex}`}
							viewOnly
							height="100%"
						/>
					</Box>
					<Box sx={{ height: "20%" }}>
						<AudioFileCarousel
							name={`stations.${currentStationId}.expertApproach.PETests.${selectedPEIndex}`}
						/>
					</Box>
				</>
			) : (
				<Typography textAlign="center">
					{activePE?.id
						? "No Data found for the test"
						: "Selected Test Details are shown here"}
				</Typography>
			)}
		</Box>
	);
};

export default PEDataView;
