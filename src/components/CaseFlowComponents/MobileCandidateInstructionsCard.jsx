import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from "@mui/material";
import { imageByType } from "helpers/imageHelper";
import { useSelector } from "react-redux";
import UICard from "../ReusableComponents/UICard";

const MobileCandidateInstructionsCard = ({ caseDetails }) => {
	const themeMode = useSelector((state) => state.app.theme);

	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";

	return (
		<Accordion
			style={{
				background: CardColor2,
				borderRadius: "10px",
				boxShadow: "none",
			}}
		>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls="panel1a-content"
				id="panel1a-header"
			>
				<Typography variant="h6">
					Instructions - Candidate Assessment
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<UICard
					customBodyClasses={"p-0"}
					customClasses={"border-0 p-3"}
					CardBody={
						<>
							<div>
								<div className="d-flex justify-content-center align-items-center">
									<div
										className={`${imageByType("cases", caseDetails)}`}
										style={{
											height: "150px",
											width: "150px",
											backgroundPosition: "center",
										}}
									/>
								</div>
								<div className="p-2">
									<strong className="m-2">Case Details: </strong>
									<div
										className="editInnerHtml p-1"
										dangerouslySetInnerHTML={{
											__html: caseDetails?.description,
										}}
									/>
								</div>
							</div>
						</>
					}
				/>
			</AccordionDetails>
		</Accordion>
	);
};

export default MobileCandidateInstructionsCard;
