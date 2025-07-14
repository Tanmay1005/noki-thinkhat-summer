import { Close } from "@mui/icons-material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
	Checkbox,
	IconButton,
	ListItemText,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import {
	CREATE_BULK_QUIZ,
	GET_QUIZ_BY_ID,
	UPDATE_BULK_QUIZ,
} from "adapters/noki_ed.service";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import { stationType } from "constants.js";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import OptionsForQuiz from "./OptionsForQuiz";

const ManageQuiz = ({
	handleClose = () => {},
	handleRender = () => {},
	id = "",
}) => {
	const [loading, setLoading] = useState({
		dataLoading: false,
		formSubmission: false,
	});
	const {
		control,
		handleSubmit,
		setValue,
		getValues,
		reset,
		formState: { _isValid, isDirty },
	} = useForm({
		defaultValues: {
			quiz: {
				same: [
					{
						question: "",
						stations: [],
						options: [{ optionText: "" }, { optionText: "" }],
						correctAnswer: 0,
						shortDescription: "",
					},
				],
			},
		},
	});
	const { _append, remove, fields } = useFieldArray({
		control,
		name: "quiz.same",
	});
	// const handleAddQuestion = () => {
	// 	append({
	// 		question: "",
	// 		options: [{ optionText: "" }, { optionText: "" }],
	// 		stations: [],
	// 		correctAnswer: 0,
	// 		shortDescription: "",
	// 	});
	// };

	const getQuizData = async (id) => {
		try {
			const answerIndexMap = {
				A: 0,
				B: 1,
				C: 2,
				D: 3,
			};
			setLoading((prev) => ({ ...prev, dataLoading: true }));
			const response = await GET_QUIZ_BY_ID(id);
			const parsedOptions = JSON?.parse(response?.data?.options);
			const formattedOptions = Object?.keys(parsedOptions)?.map((key) => ({
				optionText: parsedOptions?.[key],
			}));

			const correctAnswerIndex = answerIndexMap?.[response?.data?.answer];
			const quizData = {
				question: response?.data?.question,
				station_type: response?.data?.station_type,
				options: formattedOptions,
				correctAnswer: correctAnswerIndex,
				shortDescription: response?.data?.description,
			};

			// setValue("quiz.same[0]", quizData);

			reset({ quiz: { same: [quizData] } });
		} catch (e) {
			toast.error(
				e.message ? e.message : "Something went wrong please try again later.",
			);
		} finally {
			setLoading((prev) => ({ ...prev, dataLoading: false }));
		}
	};

	useEffect(() => {
		if (id) {
			getQuizData(id);
		}
	}, [id]);

	const onSubmit = async (data) => {
		try {
			setLoading((prev) => ({ ...prev, formSubmission: true }));
			let payload = {
				questions: data?.quiz?.same?.map((questionObj) => {
					const options = JSON.stringify(
						questionObj.options.reduce((acc, option, idx) => {
							const label = String.fromCharCode(65 + idx);
							acc[label] = option.optionText;
							return acc;
						}, {}),
					);

					return {
						question: questionObj.question,
						options: options,
						answer: String.fromCharCode(65 + questionObj.correctAnswer),
						description: questionObj.shortDescription,
					};
				}),
			};
			let _response;

			if (id) {
				payload.questions[0].id = id;
				payload.questions[0].type = "radio";
				payload.questions[0].case_type = "General";
				payload.questions[0].station_type = data.quiz.same[0].station_type;
				payload.questions[0].case_id = null;
				payload.questions[0].station_id = null;
				payload.questions[0].circuit_id = null;
				_response = await UPDATE_BULK_QUIZ(payload.questions);
			} else {
				payload = {
					...payload,
					station_type:
						data?.quiz?.same[0]?.station_type?.length > 0
							? data?.quiz?.same[0]?.station_type
							: [],
				};
				_response = await CREATE_BULK_QUIZ(payload);
			}
			toast.success(`Question ${id ? "Updated" : "Created"} Successfully.`);
			handleRender();
			handleClose();
		} catch (error) {
			console.error("Error submitting quiz data", error);
			toast.error(error?.message);
		} finally {
			setLoading((prev) => ({ ...prev, formSubmission: false }));
		}
	};

	return (
		<div className="d-flex flex-column h-100">
			<div className="d-flex justify-content-between align-items-center mx-3 py-2">
				<div className="d-flex align-items-center gap-2">
					<IconButton
						fontSize="1.5rem"
						onClick={handleClose}
						className="p-0"
						disabled={loading?.dataLoading || loading?.formSubmission}
					>
						<Close sx={{ fontSize: "1.5rem", color: "rgba(88, 64, 186, 1)" }} />
					</IconButton>
					<Typography fontWeight="bold" fontSize={"1rem"}>
						{id ? "Update Quiz Question" : "Add Quiz Question"}
					</Typography>
				</div>
				<div className="d-flex gap-2">
					<UIButton
						variant="contained"
						className="p-2 px-4 rounded-pill"
						text={id ? "Update Quiz Question" : "Add Quiz Question"}
						onClick={handleSubmit(onSubmit)}
						disabled={
							loading?.dataLoading ||
							loading?.formSubmission ||
							(Boolean(id) && !isDirty)
						}
					/>
				</div>
			</div>
			<div className="flex-grow-1 border-top h-100 overflow-auto secondary-bg-color">
				{loading?.dataLoading ? (
					<div className="text-center mt-4">
						<CommonProgress />
					</div>
				) : (
					<form onSubmit={handleSubmit(onSubmit)} className="h-100">
						<div className="d-flex flex-column h-100">
							<Typography
								fontSize={"1.2rem"}
								fontWeight={"bold"}
								className="ms-3 m-2"
							>
								Quiz Question
							</Typography>
							<div className="flex-grow-1 h-100 overflow-auto mx-3">
								{fields?.map((field, index) => (
									<div key={`${field.id}-${index}`}>
										<div className="d-flex justify-content-between align-items-center mb-2 mt-2">
											<Typography className="mb-2" fontWeight={"bold"}>
												Question
											</Typography>
											<Controller
												name={`quiz.same.[${index}].station_type`}
												control={control}
												render={({ field, fieldState: { error } }) => (
													<TextField
														{...field}
														label="Select Applicable Stations"
														variant="outlined"
														fullWidth
														select
														multiple
														value={field.value || []}
														SelectProps={{
															multiple: true,
															renderValue: (selected) =>
																selected
																	.map((type) => {
																		const selectedStation = stationType.find(
																			(name) => name === type,
																		);
																		return selectedStation
																			? selectedStation
																			: type;
																	})
																	.join(", "),
														}}
														onChange={(e) => {
															field.onChange(e.target.value);
														}}
														size="small"
														sx={{ width: "30%" }}
														error={!!error}
														helperText={error ? error.message : ""}
													>
														{stationType?.map((item, idx) => (
															<MenuItem
																key={`station-item-${idx + 1}`}
																value={item}
															>
																<Checkbox
																	checked={field.value?.includes(item) || false}
																/>
																<ListItemText primary={item} />
															</MenuItem>
														))}
													</TextField>
												)}
											/>
										</div>
										<div className="d-flex gap-1 justify-content-between align-items-center mb-3">
											<Controller
												name={`quiz.same.[${index}].question`}
												control={control}
												defaultValue={field.text || ""}
												rules={{
													required: "Question cannot be empty",
													validate: (value) =>
														value.trim() !== "" || "Question cannot be empty",
												}}
												render={({ field, fieldState: { error } }) => (
													<TextField
														{...field}
														fullWidth
														label={
															<CustomFormLabel
																name="Enter Question"
																required={true}
															/>
														}
														error={!!error}
														helperText={error ? error.message : ""}
													/>
												)}
											/>
											{getValues("quiz.same")?.length > 1 && (
												<IconButton
													className="m-0 p-0"
													color="primary"
													size="large"
													onClick={() => remove(index)}
												>
													<DeleteForeverIcon
														sx={{ fontSize: "1.5rem" }}
														onClick={() => {
															remove(index);
															toast.success("Question Deleted Successfully.");
														}}
													/>
												</IconButton>
											)}
										</div>
										<OptionsForQuiz
											setValue={setValue}
											control={control}
											questionIndex={index}
											getValues={getValues}
											tabValue={"same"}
											disabled={loading?.dataLoading || loading?.formSubmission}
										/>
									</div>
								))}
								{/* Removing add quiz question option for now */}
								{/* {(getValues("quiz.same").length < 10 || !id) && (
								{getValues("quiz.same").length < 10 && !id && (
									<div className="mt-2">
										<UIButton
											variant="contained"
											text="Add Question"
											onClick={handleAddQuestion}
											size="large"
											disabled={
												!isValid ||
												loading?.dataLoading ||
												loading?.formSubmission
											}
										/>
									</div>
								)} */}
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default ManageQuiz;
