import { Close } from "@mui/icons-material";
import {
	Alert,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	Radio,
	RadioGroup,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
	GET_RANDOM_QUIZ,
	UPDATE_QUIZ_SCORE,
} from "../../adapters/noki_ed.service";
import { set_person_details } from "../../redux/slices/authSlice";
import CustomCircularProgress from "./CustomCircularProgress";
import UIButton from "./UIButton";
import UIModal from "./UIModal";

const SkeltonLoader = () => (
	<ContentLoader
		height={"100%"}
		width={"100%"}
		backgroundColor="#f0f0f0"
		foregroundColor="#ecebeb"
	>
		<rect x="5%" y="5%" rx="10" ry="10" width="90%" height="5%" />
		<rect x="5%" y="13%" rx="10" ry="10" width="40%" height="5%" />
		<rect x="10%" y="25%" rx="10" ry="10" width="80%" height="10%" />
		<rect x="10%" y="43%" rx="10" ry="10" width="80%" height="10%" />
		<rect x="10%" y="61%" rx="10" ry="10" width="80%" height="10%" />
		<rect x="10%" y="79%" rx="10" ry="10" width="80%" height="10%" />
	</ContentLoader>
);

const TakeQuiz = ({
	open,
	handleClose,
	allMandatory = true,
	quizConfig,
	disableXButton = false,
	filter = {},
}) => {
	const [loading, setLoading] = useState(true);
	const [quizData, setQuizData] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState([]);
	const [error, setError] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [quizStartTime, setQuizStartTime] = useState(null);
	const [quizEndTime, setQuizEndTime] = useState(null);
	const personData = useSelector((state) => state?.auth?.personData);
	const reduxDispatch = useDispatch();

	function roundToOneDecimal(updatedAvgScore) {
		return Math.round(updatedAvgScore * 10) / 10;
	}
	const handleQuizScore = () => {
		const totalAttempts = personData?.total_quiz_attempts || 0;
		const currentAvgScore = personData?.avg_quiz_score || 0;
		const currentQuizScore = correctAnswers || 0;

		const updatedAvgScore =
			(currentAvgScore * totalAttempts + currentQuizScore) /
			(totalAttempts + 1);

		const payload = {
			user_id: personData?.id,
			avg_quiz_score: roundToOneDecimal(updatedAvgScore),
			total_quiz_attempts: totalAttempts + 1,
		};

		UPDATE_QUIZ_SCORE(payload)
			.then((response) => {
				if (response?.status === 200 && response?.data) {
					reduxDispatch(
						set_person_details({
							...personData,
							...response.data,
						}),
					);
				} else {
					console.error("Unexpected response status:", response?.status);
				}
			})
			.catch((error) => {
				console.error("Error updating user data:", error);
			});
	};

	const handleNext = () => {
		if (currentIndex === quizData?.length - 1) {
			if (answers[currentIndex]?.isFinalized) {
				handleQuizScore();
				setShowResults(true);
				return;
			}
			if (!allMandatory && !answers[currentIndex]?.value) {
				setQuizEndTime(Date.now());
				setShowResults(true);
				return;
			}
		}

		if (answers[currentIndex]?.value) {
			if (answers[currentIndex]?.isFinalized) {
				setCurrentIndex((prev) => prev + 1);
			} else {
				const updatedAnswers = [...answers];
				updatedAnswers[currentIndex] = {
					...updatedAnswers[currentIndex],
					isFinalized: true,
				};
				setAnswers(updatedAnswers);
				if (currentIndex === quizData?.length - 1) {
					setQuizEndTime(Date.now());
				}
			}
		} else {
			if (allMandatory) {
				setError({ [currentIndex]: "Please select an answer" });
			} else {
				setCurrentIndex((prev) => prev + 1);
			}
		}
	};

	const handlePrev = () => {
		setCurrentIndex((prev) => prev - 1);
	};

	const cleanupFunction = () => {
		setCurrentIndex(0);
		setQuizData([]);
		setAnswers([]);
		setError({});
		setShowResults(false);
		setQuizStartTime(null);
		setQuizEndTime(null);
	};

	const handleAnswerChange = (event) => {
		if (!answers[currentIndex]?.isFinalized) {
			const updatedAnswers = [...answers];
			updatedAnswers[currentIndex] = {
				value: event.target.value,
				isFinalized: false,
			};
			setAnswers(updatedAnswers);
			setError({});
		}
	};

	const getQuizData = async () => {
		setLoading(true);
		try {
			let response;
			if (filter?.stationType) {
				response = await GET_RANDOM_QUIZ({
					params: {
						...quizConfig,
						stationType: [filter.stationType],
					},
				});
			} else {
				response = await GET_RANDOM_QUIZ({
					params: quizConfig,
				});
			}
			const totalQuestions = response?.data?.get_random_questions || [];
			setQuizData(totalQuestions);

			if (totalQuestions.length < 5) {
				const additionalResponse = await GET_RANDOM_QUIZ({
					params: quizConfig,
				});
				const additionalQuestions =
					additionalResponse?.data?.get_random_questions || [];
				const filteredAdditionalQuestions = additionalQuestions.filter(
					(question) => {
						const isPresent = totalQuestions.find(
							(q) => q?.id === question?.id,
						);
						return !isPresent;
					},
				);
				setQuizData((prev) => [
					...prev,
					...filteredAdditionalQuestions.slice(0, 5 - totalQuestions.length),
				]);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
			setQuizStartTime(Date.now());
		}
	};

	useEffect(() => {
		if (open) {
			getQuizData();
		}
		return () => {
			cleanupFunction();
		};
	}, [open]);

	const formatTime = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const hoursText = hours > 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : "";
		const minutesText = minutes > 0 ? `${minutes} min` : "";
		const secondsText = `${seconds} sec`;

		return [hoursText, minutesText, secondsText].filter(Boolean).join(", ");
	};

	const totalTimeTaken = quizEndTime
		? formatTime(quizEndTime - quizStartTime)
		: "0 sec";

	const correctAnswers = answers?.filter(
		(ans, idx) => ans?.value === quizData?.[idx]?.answer,
	)?.length;

	const handleClickOption = (e, isFinalized) => {
		if (!isFinalized) {
			const radioButton = e.currentTarget.querySelector('input[type="radio"]');
			if (radioButton) {
				radioButton.click();
			}
		} else {
			e.preventDefault();
		}
	};

	const handleQuizClose = () => {
		handleClose({
			totalQuestions: quizData?.length,
			questionsAnswered: answers?.length,
			answeredCorrect: correctAnswers,
			timeTaken: totalTimeTaken,
		});
	};

	return !loading && quizData?.length < 1 ? (
		<UIModal open={open} handleClose={handleClose} width={350}>
			<div className="modal-content">
				<div className="modal-body">
					<div className="d-flex flex-column justify-content-center align-items-center">
						No Quiz questions available at this moment.
					</div>
				</div>
				<div className="d-flex justify-content-end align-items-center mt-2">
					<UIButton
						text="Close"
						variant="contained"
						onClick={handleClose}
						sx={{
							width: "fit-content",
							textTransform: "capitalize !important",
						}}
					/>
				</div>
			</div>
		</UIModal>
	) : (
		<Dialog
			fullWidth
			maxWidth="md"
			open={open}
			onClose={(_event, reason) => {
				if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
					handleClose();
				}
			}}
			PaperProps={{
				style: { height: loading && "65dvh", borderRadius: "25px" },
			}}
		>
			<DialogTitle className="d-flex border-bottom justify-content-between align-items-center m-0 p-0 pb-2 pt-2 mx-3">
				<div className="d-flex gap-1 align-items-center">
					<div className="take-quiz-icon" />
					<div>{showResults ? "Quiz Summary" : "Take a Quiz"}</div>
				</div>
				<div className="d-flex align-items-center gap-1">
					{
						<CustomCircularProgress
							size={90}
							thickness={22}
							fontSize="1.5rem"
							innerText={`${currentIndex + 1} / ${quizData?.length}`}
							textColor="primary"
							textWeight="bold"
							shadeCircleColor="rgba(242, 240, 249, 1)"
							valueCircleColor="rgba(88, 64, 186, 0.32)"
							value={
								loading
									? 0
									: currentIndex === quizData?.length - 1
										? 100
										: ((currentIndex + 1) / quizData?.length) * 100
							}
							loading={loading}
						/>
					}

					<IconButton
						edge="start"
						color="inherit"
						onClick={handleClose}
						aria-label="close"
						className="m-0 p-0"
						sx={{
							display: disableXButton ? "none" : "block",
						}}
					>
						<Close />
					</IconButton>
				</div>
			</DialogTitle>
			<DialogContent>
				{showResults ? (
					<div style={{ width: "90%", margin: "15px auto" }}>
						<div className="d-flex flex-column align-items-center my-5 w-100">
							<div className="mb-4 d-flex align-items-center justify-content-center gap-2">
								<div className="hurray-icon" />
								<Typography>
									Hurray! You have successfully completed the quiz!
								</Typography>
							</div>
							<div className="d-flex text-center flex-column flex-md-row justify-content-around w-100">
								<div>
									<Typography fontSize={"1.5rem"} fontWeight={"510"}>
										Time Taken
									</Typography>
									<Typography
										className="text-center"
										fontSize={"3rem"}
										fontWeight={"bold"}
										sx={{
											color: "rgba(255, 114, 94, 1)",
										}}
									>
										{totalTimeTaken}
									</Typography>
								</div>
								<div>
									<Typography fontSize={"1.5rem"} fontWeight={"510"}>
										Quiz Score
									</Typography>
									<Typography
										className="text-center"
										fontSize={"3rem"}
										sx={{
											color: "rgba(103, 186, 64, 1)",
										}}
									>
										{correctAnswers}/{quizData?.length}
									</Typography>
								</div>
							</div>
						</div>
					</div>
				) : (
					<>
						{loading ? (
							<div className="h-100">
								<SkeltonLoader />
							</div>
						) : (
							<div style={{ width: "90%", margin: "15px auto" }}>
								{quizData?.map((data, idx) => {
									if (currentIndex === idx) {
										return (
											<div key={`${data?.question}-${idx}`}>
												<Typography fontWeight={"bold"} className="mb-2">
													{currentIndex + 1}. {data?.question}
												</Typography>
												<RadioGroup
													onChange={handleAnswerChange}
													value={answers?.[currentIndex]?.value ?? " "}
												>
													{Object.entries(JSON?.parse(data?.options))?.map(
														([key, ques]) => {
															const isFinalized =
																answers[currentIndex]?.isFinalized;
															const selectedValue =
																answers[currentIndex]?.value;
															const correctValue = data.answer;

															// Determine background color based on the selected answer
															let backgroundColor = "";
															let checkBoxColor = "primary";
															if (isFinalized && selectedValue === key) {
																if (selectedValue === correctValue) {
																	backgroundColor = "rgba(220, 255, 203, 1)"; // Green for correct
																	checkBoxColor = "success";
																} else {
																	backgroundColor = "rgba(255, 0, 0, 0.1)"; // Red for incorrect
																	checkBoxColor = "error";
																}
															} else if (isFinalized && key === correctValue) {
																backgroundColor = "rgba(220, 255, 203, 1)"; // Green for correct
																checkBoxColor = "success";
															}

															return (
																<div
																	key={`quiz-option-outer-${key}`} // Key for outer div
																>
																	{" "}
																	<div
																		key={`quiz-option-inner-${key}`} // Key for inner div
																		className="my-2 ps-4 border rounded rounded-3 py-2"
																		style={{ backgroundColor }}
																		onKeyDown={(e) => {
																			handleClickOption(e, isFinalized);
																		}}
																		onClick={(e) => {
																			handleClickOption(e, isFinalized);
																		}}
																	>
																		<FormControlLabel
																			value={key ?? " "}
																			control={<Radio color={checkBoxColor} />}
																			label={ques}
																			onClick={(e) => {
																				if (isFinalized) {
																					e?.preventDefault();
																				}
																			}}
																		/>
																	</div>
																	{key === correctValue && isFinalized && (
																		<Typography
																			fontSize="0.9rem"
																			className="ms-5"
																		>
																			{selectedValue === key
																				? "Right Answer! "
																				: "Wrong Answer! "}
																			{data.description}
																		</Typography>
																	)}
																</div>
															);
														},
													)}
												</RadioGroup>
												{error?.[idx] && (
													<Alert severity="error">{error[idx]}</Alert>
												)}
											</div>
										);
									}
								})}
							</div>
						)}
					</>
				)}
			</DialogContent>
			<DialogActions className="d-flex justify-content-center mb-3">
				{!loading ? (
					!showResults ? (
						<>
							<UIButton
								text="Previous"
								onClick={handlePrev}
								disabled={currentIndex === 0}
							/>

							<UIButton
								text="Next"
								onClick={() => {
									if (allMandatory) {
									}
									handleNext();
								}}
								// disabled={selectedAnswer === "" && !showFeedback}
							/>
						</>
					) : (
						<>
							<UIButton text="Close" onClick={handleQuizClose} />
						</>
					)
				) : (
					""
				)}
			</DialogActions>
		</Dialog>
	);
};

export default TakeQuiz;
