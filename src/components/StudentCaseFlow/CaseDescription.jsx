import { Grid, Typography } from "@mui/material";
import { memo } from "react";
import { useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";
import CaseInteractionCard from "./CaseInteractionCard";
import CasePatientInfoCard from "./CasePatientInfoCard";
import EncounterOverviewPanel from "./EncounterOverview/EncounterOverviewPanel";

const CaseDescription = () => {
	const caseName = useWatch({
		name: "caseName",
	});
	const navigate = useNavigate();

	const handleNavigation = (event) => {
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			navigate(-1);
		}
	};

	return (
		<div className="d-flex flex-column p-2 pt-0 h-100 overflow-hidden">
			<div>
				<div
					className="d-flex gap-1 align-items-center"
					style={{ color: "#5840BA" }}
				>
					<img
						src={GoBackIcon}
						alt="loading.."
						onClick={handleNavigation}
						onKeyUp={handleNavigation}
						style={{ cursor: "pointer" }}
					/>
					<div style={{ fontSize: "1rem" }} className="fw-bold">
						Go Back
					</div>
				</div>
			</div>
			<div className="py-1">
				<Typography fontSize={"1.3rem"} fontWeight={"bold"}>
					{caseName}
				</Typography>
			</div>
			<div className="flex-1 h-100 overflow-auto">
				<Grid
					container
					spacing={1}
					sx={{
						gap: {
							xs: 1,
							sm: 0,
						},
					}}
					className="h-100"
				>
					<Grid
						item
						gap={1}
						xs={12}
						sm={8}
						className="h-100 d-flex flex-column"
					>
						<Grid
							item
							component="div"
							sx={
								{
									// maxHeight: {
									// 	xs: "50%",
									// 	sm: "100%",
									// },
									// overflow: {
									// 	xs: "hidden",
									// 	sm: "hidden",
									// },
								}
							}
						>
							<CasePatientInfoCard />
						</Grid>
						<Grid component="div" className="grow-1 h-100 overflow-hidden">
							<EncounterOverviewPanel />
						</Grid>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}
						sx={{
							height: {
								xs: "50%",
								sm: "100%",
							},
						}}
					>
						<div className="h-100 overflow-auto">
							<CaseInteractionCard />
						</div>
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default memo(CaseDescription);
