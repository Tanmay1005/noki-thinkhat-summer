import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
} from "@mui/material";
import UICheckbox from "components/ReusableComponents/UICheckbox";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UICard from "../ReusableComponents/UICard";
import RefreshButton from "../ReusableComponents/buttons/RefreshButton";

const ProgressBarCard = ({
	stationDetails,
	CDSSJson,
	caseDetails,
	caseObjectives,
	onRefresh,
}) => {
	const objectives = caseObjectives || stationDetails?.objectives;
	const taskItem = caseDetails?.fhirQuestionnaire?.item?.find(
		(item) => item?.linkId === "task",
	);
	const objective_status = CDSSJson?.objective_status || [];
	const themeMode = useSelector((state) => state.app.theme);
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const [expanded, setExpanded] = useState(true);
	const [checkboxStates, setCheckboxStates] = useState(
		objectives?.reduce((acc, objective) => {
			acc[objective] = false;
			return acc;
		}, {}),
	);
	const { isRecording, isPaused } = useSelector((state) => state.speech);

	useEffect(() => {
		setCheckboxStates((prevState) => {
			const updatedState = { ...prevState };
			let changed = false;
			for (const objective of objectives) {
				if (
					objective_status.some(
						(o) => o?.Objective === objective && o?.status === "True",
					) &&
					!updatedState[objective]
				) {
					updatedState[objective] = true;
					changed = true;
				}
			}
			return changed ? updatedState : prevState;
		});
	}, [objective_status, objectives]);

	const handleChange = () => {
		setExpanded((prev) => !prev);
	};

	return (
		<UICard
			customBodyClasses="p-0"
			customClasses="p-0 border-0"
			CardBody={
				<Accordion
					expanded={expanded}
					onChange={handleChange}
					style={{
						background: CardColor2,
						borderRadius: "10px",
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
						aria-controls="panel-content"
						id="panel-header"
					>
						<div>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								mb={1}
							>
								<h6 style={{ fontWeight: 600, margin: 0 }}>
									{caseObjectives ? "Case" : "Station"} Objectives
								</h6>
								<RefreshButton
									onRefresh={(e) => {
										e.stopPropagation();
										onRefresh();
									}}
									disabled={!isRecording || isPaused}
								/>
							</Box>
							<div
								className="col-12 text-info"
								dangerouslySetInnerHTML={{
									__html: taskItem
										? taskItem.text
										: stationDetails?.description,
								}}
							/>
							{caseDetails?.visibility !== "private" && (
								<div className="col-12 text-muted">
									These objectives will be marked complete by FORMD AI during
									the conversation.
								</div>
							)}
						</div>
					</AccordionSummary>

					<AccordionDetails>
						<div
							className="p-2"
							style={{ backgroundColor: "white", borderRadius: "10px" }}
						>
							{objectives?.map((objective) => {
								if (caseDetails.visibility === "private") {
									return (
										<div key={objective} style={{ marginBottom: "8px" }}>
											<li style={{ listStyle: "disc", marginLeft: "16px" }}>
												{objective}
											</li>
										</div>
									);
								}
								const isChecked = checkboxStates[objective];
								return (
									<UICheckbox
										key={objective}
										label={objective}
										checked={isChecked}
									/>
								);
							})}
						</div>
					</AccordionDetails>
				</Accordion>
			}
		/>
	);
};

export default ProgressBarCard;
