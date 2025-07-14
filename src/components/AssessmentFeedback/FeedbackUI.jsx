import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { isGivenValueEmpty } from "helpers/common_helper";
const JsonCard = ({ title, data }) => {
	const renderValue = (value) => {
		if (Array.isArray(value)) {
			return (
				<ul style={{ paddingLeft: "1rem", listStyleType: "disc" }}>
					{value?.map((item, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<li key={index} style={{ marginBottom: "0.5rem" }}>
							{typeof item === "string" ? item : renderValue(item)}
						</li>
					))}
				</ul>
			);
		}

		if (typeof value === "object" && value !== null) {
			return Object?.entries(value)?.map(([key, val]) => (
				<Box key={key} mb={2}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
						{key}
					</Typography>
					<Box pl={2}>{renderValue(val)}</Box>
				</Box>
			));
		}

		return <Typography variant="body1">{value}</Typography>;
	};

	return (
		<>
			<div className="d-flex justify-content-between align-items-center border-bottom m-0 pb-2">
				<Typography fontSize={"1.5rem"} fontWeight={550}>
					{title}
				</Typography>
			</div>
			<div className="mt-2 flex-1 overflow-auto">{renderValue(data)}</div>
		</>
	);
};

const exceptionalFields = [
	"Insights Dashboard",
	"Overall Score",
	"timeTaken",
	"quizScore",
	"In_Detail_Feedback",
	"Subjective",
	"Objective",
	"Assessment",
	"Plan",
	"OLDCARTS",
	"Physical_Examination_Comparison",
	"Differential_Comparison",
	"Diagnostic_Tests_Comparison",
	"Diagnosis_Selection",
];
const backGroundColors = [
	"rgba(251, 250, 255, 1)",
	"rgba(248, 255, 254, 1)",
	"rgba(252, 255, 248, 1)",
	"rgba(255, 254, 248, 1)",
	"rgba(255, 248, 255, 1)",
];
const FeedbackUI = ({ data }) => {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const safeData = Object.entries(data || {}).reduce((acc, [key, value]) => {
		if (!exceptionalFields?.includes(key) && !isGivenValueEmpty(value)) {
			acc[key] = value;
		}
		return acc;
	}, {});

	const calculateBackgroundColor = (index, itemsPerRow) => {
		const rowIndex = Math.floor(index / itemsPerRow);
		return backGroundColors[rowIndex % backGroundColors.length];
	};
	return (
		<>
			<Grid container gap={2} className="d-flex justify-content-between my-3">
				{Object.entries(safeData)?.map(([key, value], index) => {
					const itemsPerRow = isMobile ? 1 : 2;
					const backgroundColor = calculateBackgroundColor(index, itemsPerRow);
					return (
						<Grid
							key={`assessment-feedback-title-${key}`}
							item
							xs={12}
							md={5.8}
							lg={5.9}
							sx={{
								maxHeight: "400px",
								backgroundColor: `${backgroundColor} !important`,
							}}
							className="rounded d-flex flex-column rounded-4 p-2 px-3 main-bg-color"
						>
							<JsonCard title={key} data={value} />
						</Grid>
					);
				})}
			</Grid>
		</>
	);
};

export default FeedbackUI;
