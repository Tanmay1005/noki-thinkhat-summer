import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMediaQuery } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { getIconByStationType } from "helpers/station_helpers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const StationsAccordionCard = ({ caseDetails, ...props }) => {
	const [stationsList, setStationsList] = useState();
	const [stationIdMap, setStationIdMap] = useState();
	const themeMode = useSelector((state) => state.app.theme);
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const navigate = useNavigate();
	const [showDialog, setShowDialog] = useState(false);
	const [selectedStation, setSelectedStation] = useState({});
	const [expanded, setExpanded] = useState(true);
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

	const handleChange = () => {
		setExpanded((prev) => !prev);
	};

	useEffect(() => {
		setStationsList(props?.stationsList);
		setStationIdMap(props?.stationIdMap);
	}, [props?.stationsList, props?.stationIdMap]);

	const check = (id) => {
		if (stationIdMap && id in stationIdMap) {
			return true;
		}
		return false;
	};

	const navigateToFeedbackPage = (id) => {
		navigate(`/feedback?scoreId=${stationIdMap[id]}`, {
			state: { navigateTo: -1 },
		});
	};

	const handleDialogOpen = (item) => {
		setShowDialog(true);
		setSelectedStation(item);
	};
	const handleDialogClose = () => {
		setShowDialog(false);
		setSelectedStation({});
	};
	return (
		<>
			<UIModal open={showDialog} handleClose={handleDialogClose} width={400}>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h6 style={{ fontWeight: "bold" }}>
								{check(showDialog?.id)
									? "Are you sure you want to retake? "
									: "Are you sure you want to proceed?"}
							</h6>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="cancel"
							onClick={handleDialogClose}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={check(selectedStation?.id) ? "Retake" : "ok"}
							onClick={() => {
								navigate(
									`/attempt?caseId=${caseDetails?.id}&stationId=${selectedStation?.id}&quiz=${props.isQuiz}`,
									{
										state: {
											totalCases: 1,
											unAttemptedCase: 1,
											type: "case",
											caseDetails: caseDetails,
											stationDetails: selectedStation,
											navigateTo: -2,
										},
									},
								);
							}}
							variant="contained"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<Accordion
				expanded={expanded}
				onChange={handleChange}
				sx={{
					width: "100%",
					padding: "0px",
					boxShadow: "none",
				}}
			>
				<AccordionSummary
					expandIcon={
						<ExpandMoreIcon
							color="primary"
							sx={{ fontSize: "clamp(24px, 5vw, 36px)" }}
						/>
					}
					aria-controls="panel1a-content"
					id="panel1a-header"
					sx={{
						backgroundColor: CardColor2,
						borderTopLeftRadius: "10px",
						borderTopRightRadius: "10px",
					}}
				>
					<div>
						<Typography
							color="primary"
							sx={{
								fontWeight: 400,
								lineHeight: "clamp(28px, 4vw, 36px)",
								fontSize: "clamp(16px, 2.5vw, 20px)",
							}}
						>
							Stations
						</Typography>
						<Typography
							sx={{ fontSize: "clamp(12px, 2vw, 14px)" }}
							color="textSecondary"
						>
							Please select the station you'd like to practice this case on.
						</Typography>
					</div>
				</AccordionSummary>
				<AccordionDetails
					sx={{
						backgroundColor: CardColor2,
						borderBottomLeftRadius: "10px",
						borderBottomRightRadius: "10px",
					}}
				>
					<div
						style={{
							backgroundColor: themeMode === "dark" ? "grey" : "white",
							borderRadius: "10px",
							padding: "10px",
						}}
					>
						{stationsList && stationsList.length > 0 ? (
							stationsList.map((item, index) => (
								<React.Fragment
									key={`stations-accordion-station-id-${item.id}`}
								>
									<div
										className="d-flex flex-wrap justify-content-between align-items-center gap-3"
										key={`stations-accordion-station-id-${item.id}`}
									>
										<div className="item d-flex  gap-2 align-items-center">
											<img
												src={getIconByStationType(item?.type)}
												alt="loading"
												style={{ height: "30px", width: "30px" }}
											/>

											<div>
												<Typography fontSize={14} marginTop={0.5}>
													{item?.type}
												</Typography>
											</div>
										</div>
										<div
											className={`item d-flex gap-2 justify-content-center align-items-center ${isMobile && "w-100"}`}
										>
											<UIButton
												text={
													check(item.id) ? "Retake Assessment" : "Role Play"
												}
												variant="contained"
												onClick={() => handleDialogOpen(item)}
											/>
											{check(item.id) && (
												<UIButton
													text="View Results"
													variant="outlined"
													onClick={() => navigateToFeedbackPage(item.id)}
												/>
											)}
										</div>
									</div>
									{index !== stationsList?.length - 1 && (
										<div
											style={{
												width: "2px",
												height: "35px",
												backgroundColor: " #A1AEBE",
												marginLeft: "14px",
												marginTop: "8px",
												marginBottom: "16px",
											}}
										/>
									)}
								</React.Fragment>
							))
						) : (
							<Typography variant="h6" align="center" color="textSecondary">
								Stations Not Found
							</Typography>
						)}
					</div>
				</AccordionDetails>
			</Accordion>
		</>
	);
};

export default StationsAccordionCard;
