import { Close, DeleteOutline } from "@mui/icons-material";
import {
	CircularProgress,
	IconButton,
	MenuItem,
	TextField,
} from "@mui/material";
import { ADD_FLASH_CARDS, UPDATE_FLASH_CARDS } from "adapters/noki_ed.service";
import { EXECUTE_PROMPT } from "adapters/prompt.service";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import Disclaimer from "components/ReusableComponents/Disclaimer";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { specializations } from "helpers/constants";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
const specializationsMap = specializations?.reduce((acc, { value }) => {
	acc[value] = value;
	return acc;
}, {});
const AddQuestionJSX = ({ handleClose, handleRender, editMode, data }) => {
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isGenFactAILoader, setIsGenFactAILoader] = useState(false);
	const {
		control,
		handleSubmit,
		getValues,
		formState: { errors },
		reset,
	} = useForm({
		defaultValues: {
			questions: [
				{
					description: "",
					category: "",
				},
			],
		},
	});

	useEffect(() => {
		if (editMode) {
			const questionsData = [data];
			reset({ questions: questionsData });
		}

		return () => {
			reset();
		};
	}, []);

	const {
		fields: questions,
		append: appendQuestion,
		remove: removeQuestion,
	} = useFieldArray({
		control,
		name: "questions",
	});
	const handleFactGeneration = async () => {
		const values = getValues("questions");
		const isDirty = values.some((item) => item.description || item.category);
		if (isDirty) {
			setIsOpen(true);
			return;
		}
		handleFactGenerationHelper();
	};
	const handleFactGenerationHelper = async (isDirty = false) => {
		try {
			setLoading(true);
			setIsGenFactAILoader(true);
			const response = await EXECUTE_PROMPT({
				prompt_code: "flash-card-prompt",
			});
			const data = response?.data?.Facts?.map(({ Fact, Specialty }) => ({
				description: Fact,
				category: specializationsMap?.[Specialty]
					? Specialty
					: "Internal Medicine",
			}));
			const values = getValues("questions");
			if (isDirty) {
				reset({ questions: [...data, ...values] });
			} else {
				reset({ questions: data });
			}
		} catch {
			toast.error("Error generating facts");
		} finally {
			setIsGenFactAILoader(false);
			setLoading(false);
		}
	};
	const onSubmit = async (data) => {
		try {
			setLoading(true);
			const payload = data?.questions?.map((item) => ({
				...item,
				category: [item?.category],
			}));
			const editPayload = data?.questions.map(({ description, category }) => ({
				description,
				category: Array.isArray(category) ? category : [category],
			}))?.[0];

			if (editMode) {
				await UPDATE_FLASH_CARDS({
					id: data?.questions?.[0]?.id,
					payload: editPayload,
				});
				toast.success("Flash card updated Successfully");
			} else {
				await ADD_FLASH_CARDS(payload);
				if (payload?.length > 1) {
					toast.success("Flash cards Created Successfully");
				} else {
					toast.success("Flash card Created Successfully");
				}
			}

			handleRender();
			handleClose();
		} catch (err) {
			toast.error(err?.message || "Failed to Add Flash Card");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<UIModal open={isOpen} handleClose={() => setIsOpen(false)} width={400}>
				<div className="modal-content">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h5 style={{ fontWeight: "bold" }}>Are you sure?</h5>
							<span style={{ textAlign: "center" }}>
								Do you want to add to the existing data or replace it?
							</span>
						</div>
					</div>
					<div className="d-flex justify-content-center align-items-center mt-2 gap-2">
						{/* <UIButton
							text="Cancel"
							variant="outlined"
							onClick={() => {
								setIsOpen(false);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/> */}
						<UIButton
							text="Replace Current"
							variant="contained"
							onClick={() => {
								setIsOpen(false);
								reset({
									questions: [
										{
											description: "",
											category: "",
										},
									],
								});
								handleFactGenerationHelper();
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text="Add More"
							variant="contained"
							onClick={() => {
								setIsOpen(false);
								handleFactGenerationHelper(true);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<div className="p-4 d-flex justify-content-between align-items-center border-bottom">
				<div className="d-flex align-items-center gap-4">
					<IconButton
						style={{ marginBottom: "8px" }}
						color="primary"
						onClick={handleClose}
						disabled={loading}
					>
						<Close />
					</IconButton>
					<h4>{editMode ? "Update Flash Card" : "Add Flash Card"}</h4>
				</div>
				<UIButton
					text={editMode ? "Update" : "Save"}
					variant="contained"
					size="medium"
					disabled={loading}
					onClick={handleSubmit(onSubmit)}
				/>
			</div>

			<div className="m-3">
				<Disclaimer />
			</div>
			<div className="border border-1 rounded-4 ms-3 me-3">
				<form onSubmit={handleSubmit(onSubmit)} className="p-4">
					<div className="d-flex justify-content-between align-items-center flex-wrap">
						<h4>Flash Card</h4>
						{!editMode && (
							<UIButton
								onClick={handleFactGeneration}
								text="Generate Fact using FORMD AI"
								sx={{ marginBottom: "0.5rem", width: "fit-content" }}
								endIcon={
									isGenFactAILoader ? (
										<CircularProgress size={18} color="inherit" />
									) : null
								}
								disabled={loading}
							/>
						)}
					</div>
					{questions.map((question, qIndex) => (
						<div
							key={question.id}
							className="row m-1 p-2 my-2 rounded-3"
							style={{ background: "#f9f9f9" }}
						>
							<div className="col-md-12">
								<div className="d-flex justify-content-between align-items-center">
									<h5>Flash Card {qIndex + 1}</h5>
									<IconButton
										color="secondary"
										onClick={() => {
											removeQuestion(qIndex);
											toast.success("Flash Card removed successfully!");
										}}
										disabled={questions.length === 1 || loading}
									>
										<DeleteOutline />
									</IconButton>
								</div>
							</div>

							{/* Question Text */}
							<div className="col-md-9 mt-3">
								<Controller
									name={`questions.${qIndex}.description`}
									control={control}
									rules={{
										required: "* Description is required",
										validate: (value) =>
											value.trim() !== "" || "Description cannot be empty",
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label={
												<CustomFormLabel name="Description" required={true} />
											}
											variant="outlined"
											size="small"
											fullWidth
											disabled={loading}
											error={!!errors?.questions?.[qIndex]?.description}
											helperText={
												errors?.questions?.[qIndex]?.description?.message
											}
										/>
									)}
								/>
							</div>

							{/* Question Type */}
							<div className="col-md-3 mt-3">
								<Controller
									name={`questions.${qIndex}.category`}
									control={control}
									rules={{ required: "* Specialty is required" }}
									render={({ field }) => (
										<TextField
											{...field}
											label={
												<CustomFormLabel name="Specialty" required={true} />
											}
											variant="outlined"
											fullWidth
											size="small"
											select
											error={!!errors?.questions?.[qIndex]?.category}
											helperText={
												errors?.questions?.[qIndex]?.category?.message
											}
											disabled={loading}
										>
											{specializations?.map((item, idx) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												<MenuItem key={idx} value={item.value}>
													{item.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							</div>

							{qIndex === questions.length - 1 && !editMode && (
								<div className="py-2">
									<UIButton
										text="Add Flash Card"
										size="medium"
										variant="contained"
										// startIcon={<AddCircleOutline />}
										disabled={loading}
										onClick={() => {
											appendQuestion({
												description: "",
												category: "",
											});
										}}
									/>
								</div>
							)}
						</div>
					))}
				</form>
			</div>
		</>
	);
};

export default AddQuestionJSX;
