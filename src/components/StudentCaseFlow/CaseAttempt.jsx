import { Grid, Skeleton, Typography } from "@mui/material";
import { GET_ENCOUNTER, GET_OBSERVATION } from "adapters/noki_ed.service";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { FOCUSED_PHYSICAL_EXAMINATION } from "helpers/constants";
import useScoreGenerator from "hooks/useScoreGenerator";
import { memo, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CDSSAndRubricsTabs from "./CDSSAndRubricsTabs";
import CaseObjectiveCard from "./CaseObjectiveCard";
import DifferentialsAndDiagnosticTabs from "./DifferentialsAndDiagnosticTabs";
import EncounterOverviewPanel from "./EncounterOverview/EncounterOverviewPanel";
import Header from "./Header";
import Tracker from "./Tracker";
const style = {
	transform: "none",
	WebkitTransform: "none",
};

const CaseAttempt = ({ children, caseAttemptRef }) => {
	const { setValue, getValues, resetField } = useFormContext();
	const [loading, setLoading] = useState(false);
	const stationMap = useSelector((state) => state.stations?.stationMap);
	const attemptId = getValues("attemptId");
	const osceType = getValues("osceType");
	const encounterId = useWatch({ name: "student.encounterId" });
	const currentStationId = useWatch({ name: "currentStationId" });
	const stationType = stationMap?.[currentStationId]?.type;
	const {
		errorMessage,
		isLoading,
		loadingText,
		handlePauseRecording,
		handleResumeRecording,
		handleStopRecording,
	} = useScoreGenerator(caseAttemptRef);
	const navigate = useNavigate();
	const getObservation = async () => {
		try {
			setLoading(true);
			const response = await GET_OBSERVATION({
				attemptId: attemptId,
			});
			const resource = response?.data?.entries?.[0]?.resource;
			const notes = resource?.note?.[0]?.text || "";
			const ddx = JSON.parse(resource?.code?.text) || {};
			setValue("student.notes", notes);
			setValue("student.expertApproach.differentials", ddx);
			setValue("student.observationId", resource?.id);
		} catch (error) {
			console.error("Error fetching observation:", error);
		} finally {
			setLoading(false);
		}
	};
	const getEncounter = async () => {
		try {
			setLoading(true);
			const response = await GET_ENCOUNTER({
				attemptId: attemptId,
			});
			const resource = response?.data?.[0]?.resource;
			const encounterData =
				JSON.parse(resource?.extension?.[0]?.valueString) || {};
			if (Object.keys(encounterData).length > 0) {
				resetField("student.Current_Encounter_EHR", {
					defaultValue: encounterData,
				});

				setValue("student.encounterId", resource?.id);
			}
		} catch (error) {
			console.error("Error fetching observation:", error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		if (osceType === "multi" && attemptId) {
			setLoading(true);
			getObservation();
			getEncounter();
		}
	}, []);
	return (
		<>
			{errorMessage && (
				<UIModal
					open={Boolean(errorMessage)}
					displayCloseIcon={false}
					width={400}
				>
					<div className="modal-content">
						<div className="modal-body">
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5 style={{ fontWeight: "bold" }}>Are you sure?</h5>
								<span style={{ textAlign: "center" }}>{errorMessage}</span>
							</div>
						</div>
						<div className="d-flex justify-content-center align-items-center gap-2">
							<UIButton
								text="Try Again"
								variant="outlined"
								onClick={() => {
									navigate(0);
								}}
								sx={{
									width: "100%",
									textTransform: "capitalize !important",
								}}
							/>
							<UIButton
								text="Home"
								variant="contained"
								onClick={() => {
									navigate("/");
								}}
								sx={{
									width: "100%",
									textTransform: "capitalize !important",
								}}
							/>
						</div>
					</div>
				</UIModal>
			)}
			{isLoading && <div className="fullscreen-overlay" />}
			{isLoading ? (
				<div className="d-flex flex-column justify-content-center align-items-center h-100">
					<CommonProgress />
					<Typography>{loadingText}</Typography>
				</div>
			) : (
				<div className="h-100 d-flex flex-column gap-2 pb-1">
					<Header
						handlePauseRecording={handlePauseRecording}
						handleResumeRecording={handleResumeRecording}
						handleStopRecording={handleStopRecording}
					/>
					<Tracker />
					<div className="px-2 flex-1 h-100 overflow-auto">
						<Grid
							container
							spacing={1}
							gap={{ xs: 1, sm: 0 }}
							sx={{
								height: { xs: "100%", sm: "100%" },
							}}
						>
							{stationType === FOCUSED_PHYSICAL_EXAMINATION && (
								<Grid
									xs={12}
									component="div"
									sx={{
										minHeight: { xs: 300, sm: "80%" },
										maxHeight: { xs: 300, sm: "80%" },
									}}
								>
									{children}
								</Grid>
							)}
							<Grid
								item
								xs={12}
								sm={8}
								sx={{
									height: { xs: "auto", sm: "100%" },
									display: "flex",
									flexDirection: "column",
									gap: 1,
								}}
							>
								{stationType !== FOCUSED_PHYSICAL_EXAMINATION && (
									<Grid
										component="div"
										sx={{
											minHeight: { xs: 200, sm: "50%" },
											maxHeight: { xs: 200, sm: "50%" },
										}}
									>
										{children}
									</Grid>
								)}

								<Grid
									component="div"
									// className="border"
									sx={{
										minHeight: { xs: 300, sm: "75%" },
										flexGrow: 1,
									}}
								>
									{loading ? (
										<div className="h-100">
											<div className="d-flex gap-4 align-items-start h-20">
												{[1, 2, 3, 4, 5, 6, 7]?.map((item) => (
													<Skeleton
														key={`case-flow-layout-skeleton-${item}`} // This key will have 1,2,3,4,5,6,7 as values so it will be unique
														height={"100%"}
														width={90}
														className="p-0 my-2"
														sx={style}
														animation="wave"
													/>
												))}
											</div>
											<Skeleton
												height={"80%"}
												width={"100%"}
												className="p-0 m-0"
												sx={style}
												animation="wave"
											/>
										</div>
									) : (
										<EncounterOverviewPanel key={encounterId} />
									)}
								</Grid>
							</Grid>

							<Grid
								item
								xs={12}
								sm={4}
								sx={{
									height: { xs: "auto", sm: "100%" },
									display: "flex",
									flexDirection: "column",
									gap: 1,
								}}
							>
								<DifferentialsAndDiagnosticTabs />
								<Grid
									component="div"
									className="rounded-4 tab-bg-secondary"
									sx={{
										minHeight: { xs: 200, sm: "70%" },
									}}
								>
									<CaseObjectiveCard />
								</Grid>

								<Grid
									component="div"
									// className="border"
									sx={{
										minHeight: { xs: 200, sm: "50%" },
									}}
								>
									<CDSSAndRubricsTabs />
								</Grid>
							</Grid>
						</Grid>
					</div>
				</div>
			)}
		</>
	);
};

export default memo(CaseAttempt);
