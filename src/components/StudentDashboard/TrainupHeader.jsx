import InfoIcon from "@mui/icons-material/Info";
import { Box, IconButton, Typography } from "@mui/material";
import UITooltip from "components/ReusableComponents/UITooltip";
import { useState } from "react";
import { useSelector } from "react-redux";
import DashboardAvatar2 from "../../assets/NokiEd_Avatar.svg";
import LearnInFlash from "../ReusableComponents/LearnInFlash";
import TakeQuiz from "../ReusableComponents/TakeQuiz";

const TrainupHeader = () => {
	const personData = useSelector((state) => state?.auth?.personData);

	return (
		<>
			<Box
				sx={{
					display: "flex",
					gap: "1rem",
					padding: "0 0.5rem",
					flexWrap: "wrap",
					justifyContent: {
						sm: "center",
						xs: "center",
						md: "space-around",
						lg: "space-around",
					},
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<img
						style={{ width: "9rem", height: "9rem" }}
						src={DashboardAvatar2}
						alt="Dashboard Avatar"
					/>
					<Box>
						<Typography
							sx={{ fontSize: "2rem" }}
							color="primary"
							className="text-center"
						>
							Hello {personData?.name},
						</Typography>
						<div
							sx={{ fontSize: "1rem" }}
							className="text-center text-lg-start"
						>
							Let's gear up for the day!
						</div>
					</Box>
				</Box>
				{/* <Box className="gap-3" sx={{ display: "flex", alignItems: "center" }}>
					<HeaderQuickAction text="Learn in a Flash" type="flash" />
					<HeaderQuickAction text="Take a Quiz" type="quiz" />
				</Box> */}
			</Box>
		</>
	);
};

export default TrainupHeader;

const _HeaderQuickAction = ({ text = "", type = "" }) => {
	const [open, setOpen] = useState(false);
	const personData = useSelector((state) => state?.auth?.personData);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<div
				onClick={handleClickOpen}
				onKeyUp={() => {}}
				style={{ cursor: "pointer", fontSize: "1rem" }}
				className="rounded border border-primary rounded-pill p-2 px-3 d-flex align-items-center gap-2"
			>
				<div
					className={`${
						type === "flash" ? "learn-in-flash-icon" : "take-quiz-icon"
					}`}
				/>
				<div className="d-flex align-items-center gap-2">
					<div className="text-primary">{text}</div>
					{text === "Take a Quiz" && (
						<UITooltip
							tooltipContent={
								<div>
									<p>
										<strong>Average Quiz Score:</strong>{" "}
										{personData?.avg_quiz_score}
									</p>
									<p>
										<strong>Total Quiz Attempts:</strong>{" "}
										{personData?.total_quiz_attempts}
									</p>
								</div>
							}
						>
							<IconButton
								className="text-primary p-0 m-0"
								style={{ cursor: "pointer" }}
							>
								<InfoIcon />
							</IconButton>
						</UITooltip>
					)}
				</div>
			</div>
			{type === "flash" ? (
				<LearnInFlash
					open={open}
					handleClose={handleClose}
					flashCardCount={10}
					closeonBackdrop={false}
				/>
			) : (
				<TakeQuiz
					open={open}
					handleClose={handleClose}
					quizConfig={{ limit: 5 }}
				/>
			)}
		</>
	);
};
