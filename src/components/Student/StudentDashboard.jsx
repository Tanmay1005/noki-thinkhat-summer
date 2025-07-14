import { Grid, useMediaQuery } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsername } from "../../redux/slices/topbarSlice";

import {
	NokiInteract,
	OSCE,
	RecentPractices,
	RecommendedCases,
	TrainupHeader,
	VideoCard,
} from "../StudentDashboard";

const StudentDashbaord = () => {
	const reduxDispatch = useDispatch();
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const personData = useSelector((state) => state?.auth?.personData);
	const videoLink =
		"https://storage.googleapis.com/noki_public/formd/Formd_Demo_Student_Eng_V003.mp4";

	const slides = [
		{
			videoLink: videoLink,
			videoTitle: "Formd Demo Video",
			videoLength: "09:44",
		},
	];

	useEffect(() => {
		if (personData?.id) {
			reduxDispatch(setUsername(personData?.name));
		}
		return () => {
			reduxDispatch(setUsername(""));
		};
	}, [personData?.id]);
	return (
		<>
			<Grid container height="100%">
				<Grid
					item
					sx={{
						width: { md: "75%", sm: "100%" },
						flexDirection: "column",
						display: "flex",
						padding: "0.5rem",
						gap: "0.5rem",
						overflowY: "auto",
						overflowX: "hidden",
						height: { md: "calc(100vh - 60px)" },
					}}
				>
					<Grid item>
						<TrainupHeader />
					</Grid>

					<Grid item width="100%">
						<RecentPractices />
					</Grid>

					<Grid
						item
						width="100%"
						sx={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							gap: "1rem",
						}}
					>
						<RecommendedCases />
					</Grid>
					<Grid item width="100%">
						<OSCE />
					</Grid>
				</Grid>
				<Grid
					item
					className="d-flex flex-column"
					sx={{
						padding: "0.5rem",
						overflow: "hidden",
						gap: "0.5rem",
						height: { md: "100%" },
						width: { md: "25%", sm: "100%", xs: "100%" },
					}}
				>
					<Grid item className={isMobile ? "text-last" : ""}>
						<VideoCard slides={slides} />
					</Grid>
					<Grid item sx={{ height: { md: "100%" } }}>
						<NokiInteract />
					</Grid>
				</Grid>
			</Grid>
		</>
	);
};

export default StudentDashbaord;
