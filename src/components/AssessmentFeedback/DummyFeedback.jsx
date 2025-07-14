import LockIcon from "@mui/icons-material/Lock";
import { Grid, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import CustomBarChart from "./CustomBarChart";

const DummyFeedback = () => {
	const appTheme = useSelector((state) => state?.app?.theme);
	const { caseScoreParsedJson, barChartData } = {
		caseScoreParsedJson: {
			"Overall Score": 3,
			timeTaken: 120,
			quizScore: {
				answeredCorrect: 2,
				totalQuestions: 3,
			},
		},
		barChartData: [
			{
				x: "NA",
				y: 1,
			},
			{
				x: "NA",
				y: 2,
			},
			{
				x: "NA",
				y: 3,
			},
			{
				x: "NA",
				y: 2,
			},
		],
	};
	return (
		<div style={{ position: "relative" }}>
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					zIndex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "1rem",
					// backgroundColor: "white",
					border: "5px solid rgb(237, 4, 4)",
					padding: "2rem",
					borderRadius: "1rem",
					boxShadow: "20px rgba(93, 7, 9, 0.1)",
				}}
			>
				<LockIcon sx={{ fontSize: "3rem", color: "rgb(237, 4, 4)" }} />
				<Typography
					variant="h5"
					textAlign="center"
					color="#444"
					fontWeight="500"
				>
					The feedback can be seen once the Teaching staff has reviewed it
				</Typography>
			</div>
			<div className="mx-1 mx-md-3" style={{ filter: "blur(10px)" }}>
				<div>
					<div className="mt-2">
						<div className="d-flex flex-column align-items-center ">
							<div className="mb-4 d-flex align-items-center justify-content-between gap-2">
								<div className="hurray-icon " />
								<Typography fontSize={"1.2rem"} textAlign={"center"}>
									Keep going, you are doing a great job!!
								</Typography>
							</div>
							<div className="d-flex text-center justify-content-center gap-3 gap-md-5">
								<div className="d-flex flex-column align-items-center">
									<Typography
										fontSize={{ xs: "1.3rem", md: "1.5rem" }}
										fontWeight={"510"}
									>
										Score
									</Typography>
									<Typography
										className="text-center"
										fontSize={{ xs: "2rem", md: "3rem" }}
										fontWeight={"bold"}
										sx={{
											color: "rgba(103, 186, 64, 1)",
										}}
									>
										{/* {caseScoreParsedJson?.["Overall Score"] || 0} / 5 */}
										Not Available
									</Typography>
								</div>
								<div className="d-flex flex-column align-items-center">
									<Typography
										fontSize={{ xs: "1.3rem", md: "1.5rem" }}
										fontWeight={"510"}
									>
										Time Taken
									</Typography>
									<Typography
										className="text-center"
										fontSize={{ xs: "2rem", md: "3rem" }}
										fontWeight={"bold"}
										sx={{
											color: "rgba(255, 114, 94, 1)",
										}}
									>
										{/* {convertSecToTime(caseScoreParsedJson?.timeTaken)} */}
										N/A
									</Typography>
								</div>
								{caseScoreParsedJson?.quizScore && (
									<div className="d-flex flex-column align-items-center">
										<Typography
											fontSize={{ xs: "1.3rem", md: "1.5rem" }}
											fontWeight={"510"}
										>
											Quiz Score
										</Typography>
										<Typography
											className="text-center"
											fontSize={{ xs: "2rem", md: "3rem" }}
											fontWeight="bold"
											sx={{
												color: "rgba(103, 186, 64, 1)",
											}}
										>
											{/* {`${caseScoreParsedJson?.quizScore?.answeredCorrect || 0}/${caseScoreParsedJson?.quizScore?.totalQuestions || 0}`} */}
											Not Available
										</Typography>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				{barChartData?.length > 0 && (
					<Grid
						container
						className="p-2 d-flex flex-column flex-md-row justify-content-between my-3 main-bg-color rounded rounded-4"
					>
						<Grid item xs={12}>
							<div
								style={{
									textAlign: "center",
									marginBottom: "10px",
									fontSize: "1rem",
									fontWeight: "bold",
								}}
							>
								Your Performance by Competency
							</div>
							<CustomBarChart data={barChartData} appTheme={appTheme} />
						</Grid>
					</Grid>
				)}
			</div>
		</div>
	);
};

export default DummyFeedback;
