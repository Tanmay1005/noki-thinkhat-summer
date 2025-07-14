import { Close } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Chip, Grid, IconButton, Typography } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
// import OptionsTree from "components/ReusableComponents/OptionsTree";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import UIRadioGroup from "components/ReusableComponents/UIRadioGroup";
import DiagnosticTestResults from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DiagnosticTestResults";
import { useCallback, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import DifferentialsResults from "../Differentials&Diagnostics/DifferentialsResults";
import DragableList from "../Differentials&Diagnostics/DragableList";
import FileUploadManager from "../common/FileUploadManager";
import useDeleteFile, { AddCustomValueHelper } from "../manageCaseHelper";
import FormFieldController from "../sections/FormFieldController";
import AccordionFormHelper from "./AccordionFormHelper";
import CommonStationForm, { GenericExplanationForm } from "./CommonStationForm";

export const themeColors = {
	primary: "#6938EF",
	lightGray: "#F9F9F9",
	gray: "#E0E0E0",
	selectedChipBg: "#F4F4F6",
};

const DiagnosticTestsForm = ({ selectedStation = {} }) => {
	const name = `stations.${selectedStation?.value}.expertApproach.differentials`;
	const { control, getValues } = useFormContext();
	const applicableTypes = useWatch({
		control,
		name: "applicable_types",
	});
	const {
		fields: differentialFields,
		append: appendDifferential,
		remove: removeDifferential,
	} = useFieldArray({
		control,
		name: name,
	});
	const isCaseEditable = getValues("isCaseEditable");
	const [showModal, setShowModal] = useState(false);
	const handleModalOpen = () => {
		setShowModal(true);
	};
	const handleAddDifferential = (item) => {
		appendDifferential({
			snomed_id: item?.id,
			concept_id: item?.concept_id,
			diagnosis: item?.diagnosis,
		});
	};

	const handleRemoveDifferential = (index) => {
		removeDifferential(index);
	};
	return (
		<div>
			<CommonStationForm selectedStation={selectedStation} />
			<div className="secondary-bg-color rounded rounded-4 mt-3 p-3">
				<Typography
					component="span"
					sx={{
						width: "33%",
						flexShrink: 0,
						fontWeight: "bold",
						fontSize: "1.1rem",
					}}
				>
					Expert Approach
				</Typography>
				<div className="my-3">
					{" "}
					{applicableTypes?.length === 1 && (
						<div className="mb-3">
							<div className="d-flex justify-content-between gap-2 mb-2">
								<Typography fontWeight="bold" mb={1}>
									Your Selected Differentials
								</Typography>
								{isCaseEditable && (
									<UIButton
										onClick={handleModalOpen}
										className="p-2 px-4 rounded-pill"
										text="Manage Differentials"
									/>
								)}
							</div>
							<UIModal
								open={showModal}
								handleClose={() => setShowModal(false)}
								width={800}
							>
								<div className="modal-body">
									<div className="d-flex flex-column justify-content-center align-items-start">
										<h6>Select Differentials</h6>
									</div>
								</div>
								<DifferentialsResults
									name={`stations.${selectedStation?.value}.expertApproach.differentials`}
									onAddTest={handleAddDifferential}
									onRemoveTest={handleRemoveDifferential}
								/>
								{/*Footer */}
								<div className="d-flex flex-column mt-1">
									{differentialFields.length > 0 && (
										<>
											<Typography fontWeight="bold" mb={1}>
												Your Selected Diagnostic Tests
											</Typography>
											<Box
												display="flex"
												flexWrap="wrap"
												gap={1}
												sx={{
													height: "auto",
													maxHeight: "10vh",
													overflowY: "auto",
													scrollbarWidth: "thin",
												}}
											>
												{differentialFields.map((opt, index) => (
													<Chip
														key={`${opt?.fileId}-selected-${index + 1}`}
														label={opt?.diagnosis}
														onDelete={() => {
															handleRemoveDifferential(index);
														}}
														deleteIcon={
															<CloseIcon
																sx={{
																	color: themeColors.primary,
																	fontSize: 12,
																}}
															/>
														}
														sx={{
															backgroundColor: themeColors.selectedChipBg,
															borderRadius: 2,
															fontSize: 14,
														}}
													/>
												))}
											</Box>
										</>
									)}
								</div>
							</UIModal>
							<DragableList
								name={`stations.${selectedStation?.value}.expertApproach`}
								onRemove={handleRemoveDifferential}
							/>
						</div>
					)}
					<DiagnosticTest selectedStation={selectedStation} />
					<FinalDiagnosis selectedStation={selectedStation} />
				</div>
				<GenericExplanationForm selectedStation={selectedStation} />
			</div>
		</div>
	);
};

const DiagnosticTest = ({ selectedStation = {} }) => {
	const name = `stations.${selectedStation?.value}.expertApproach.tests`;
	const methods = useFormContext();
	const { control, getValues } = methods;
	const {
		fields: testsFields,
		append: appendTest,
		remove: removeTest,
	} = useFieldArray({
		control,
		name: name,
	});
	// const testsFields = useWatch({
	// 	control,
	// 	name: name,
	// });
	const isCaseEditable = getValues("isCaseEditable");
	const [showModal, setShowModal] = useState(false);
	const { deleteAllFiles } = useDeleteFile();

	const handleAddTest = useCallback(
		(test) => {
			appendTest({
				loinc_num: test?.loinc_num,
				fileId: uuidv4(),
				testName: test?.testName,
				testInference: "",
				documents: [],
				isExisting: false,
			});
		},
		[appendTest],
	);

	const handleRemoveTest = useCallback(
		(index) => {
			removeTest(index);
		},
		[removeTest],
	);

	const handleDelete = (fileId, index, isExisting) => {
		const response = deleteAllFiles(fileId, "case", isExisting);
		if (response) {
			handleRemoveTest(index);
		}
	};

	// New callback to handle selected items from DiagnosticTestResults

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center">
				<Typography fontWeight={"bold"}>Recommended Tests</Typography>
				<div className="d-flex gap-2">
					{isCaseEditable && (
						<UIButton
							variant="contained"
							text="Manage Diagnostic Tests"
							onClick={() => setShowModal(true)}
							sx={{
								borderRadius: "12px",
								textTransform: "none",
								width: "fit-content",
								marginBottom: 2,
							}}
						/>
					)}
					<UIModal
						open={showModal}
						handleClose={() => {
							setShowModal(false);
						}}
						width={800}
						style={{
							height: "80%",
						}}
					>
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h6>Select Diagnostic Tests</h6>
						</div>
						<Box style={{ height: "75%" }}>
							<DiagnosticTestResults
								name={`stations.${selectedStation?.value}.expertApproach.tests`}
								onAddTest={handleAddTest}
								onRemoveTest={handleDelete}
							/>
						</Box>
						{/*Footer */}
						<div className="d-flex flex-column mt-1" style={{ height: "20%" }}>
							{testsFields.length > 0 && (
								<>
									<Typography fontWeight="bold" mb={1}>
										Your Selected Diagnostic Tests
									</Typography>
									<Box
										display="flex"
										flexWrap="wrap"
										gap={1}
										sx={{
											height: "auto",
											maxHeight: "10vh",
											overflowY: "auto",
											scrollbarWidth: "thin",
										}}
									>
										{testsFields.map((opt, index) => (
											<Chip
												key={`${opt?.fileId}-selected-${index + 1}`}
												label={opt?.testName}
												onDelete={() => {
													handleDelete(opt?.fileId, index);
												}}
												deleteIcon={
													<CloseIcon
														sx={{ color: themeColors.primary, fontSize: 12 }}
													/>
												}
												sx={{
													backgroundColor: themeColors.selectedChipBg,
													borderRadius: 2,
													fontSize: 14,
												}}
											/>
										))}
									</Box>
								</>
							)}
						</div>
					</UIModal>
				</div>
			</div>
			<div>
				{Array.isArray(testsFields) &&
					testsFields?.map((test, index) => {
						return (
							<Grid
								key={test.id}
								className="my-3"
								sx={{ position: "relative" }}
							>
								<AccordionFormHelper
									isExpanded={false}
									backgroundColor="#F9F8FE"
									label={test.testName || "test 1"}
									JSX={
										<div className="d-flex flex-column gap-3">
											<div>
												<Typography fontSize={"1rem"}>
													Textual Summarization(Inference)
												</Typography>
												<div className="secondary-bg-color">
													<FormFieldController
														Component={CustomRichTextEditor}
														name={`stations.${selectedStation?.value}.expertApproach.tests.${index}.testInference`}
													/>
												</div>
											</div>
											<div className="d-flex justify-content-between align-items-center">
												<Typography fontSize={"1rem"}>
													Upload Document
												</Typography>
											</div>

											<div className="w-100">
												<FileUploadManager
													name={`${name}.${index}.documents`}
													sectionFileId={test?.fileId}
													isExisting={test?.isExisting}
													showUploadButton={false}
												/>
											</div>

											{isCaseEditable && (
												<div className="text-center">
													<UIButton
														text="Remove Test"
														variant="contained"
														// disabled={}
														onClick={() =>
															handleDelete(
																test?.fileId,
																index,
																test?.isExisting,
															)
														}
													/>
												</div>
											)}
										</div>
									}
								/>
							</Grid>
						);
					})}
			</div>
		</div>
	);
};

const FinalDiagnosis = ({ selectedStation = {} }) => {
	const [insertFinalDiagnosisValue, setInsertFinalDiagnosisValue] =
		useState("");
	const [addDiagnosisErrorMessage, setAddDiagnosisErrorMessage] = useState("");
	const methods = useFormContext();
	const { control, trigger, getValues } = methods;
	const isCaseEditable = getValues("isCaseEditable");

	const {
		fields: finalDiagnosisFields,
		append: appendFinalDiagnosis,
		remove: removeFinalDiagnosis,
	} = useFieldArray({
		control,
		name: `stations.${selectedStation?.value}.expertApproach.finalDiagnosis.options`,
	});

	const watchedDiagnosis = useWatch({
		control,
		name: `stations.${selectedStation?.value}.expertApproach.finalDiagnosis.options`,
	});

	const handleAppendDiagnosis = () => {
		if (
			watchedDiagnosis?.some(
				(item) =>
					item?.name?.toLowerCase() ===
					insertFinalDiagnosisValue?.toLowerCase(),
			)
		) {
			setAddDiagnosisErrorMessage("Diagnosis already exists.");
			return;
		}
		appendFinalDiagnosis({ name: insertFinalDiagnosisValue?.trim() });
		setInsertFinalDiagnosisValue("");
		setAddDiagnosisErrorMessage("");

		const currentError = methods.getFieldState(
			`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.value`,
		)?.error;

		if (currentError) {
			trigger(
				`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.value`,
			);
		}
	};

	const handleRemoveDiagnosis = (index) => {
		const removedDiagnosis = watchedDiagnosis?.[index];

		removeFinalDiagnosis(index);

		const currentSelected = methods.getValues(
			`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.value`,
		);

		if (removedDiagnosis?.name === currentSelected) {
			methods.setValue(
				`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.value`,
				"",
			);
			methods.trigger(
				`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.value`,
			);
		}
	};

	return (
		<div>
			<Typography fontWeight={"bold"}>Final Diagnosis</Typography>

			<div className="d-flex align-items-center">
				<Grid container spacing={1} className="mt-2">
					<Grid item xs>
						<FormFieldController
							name={`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.value`}
							Component={UIRadioGroup}
							rules={{
								validate: (selectedValue) => {
									const options = methods.getValues(
										`stations.${selectedStation?.value}.expertApproach.finalDiagnosis.options`,
									);

									if (!options || options.length < 2) {
										return "At least two diagnosis options are required";
									}

									if (!selectedValue) {
										return "Please select a diagnosis";
									}

									return true;
								},
							}}
							extraProps={{
								options: finalDiagnosisFields.map((diagnosis) => ({
									label: diagnosis.name,
									value: diagnosis.name,
								})),
								row: false,
							}}
						/>
					</Grid>
				</Grid>
				{isCaseEditable && (
					<div className="d-flex flex-column gap-2 mt-1">
						{finalDiagnosisFields.map((diagnosis, index) => (
							<Grid item key={diagnosis?.id}>
								<IconButton
									onClick={() => handleRemoveDiagnosis(index)}
									size="small"
									// disabled={finalDiagnosisFields.length <= 2}
								>
									<Close fontSize="small" />
								</IconButton>
							</Grid>
						))}
					</div>
				)}
			</div>

			{finalDiagnosisFields?.length < 6 && (
				<div className="mt-3">
					<AddCustomValueHelper
						inputFieldLabel="Diagnosis"
						addButtonText="Add"
						value={insertFinalDiagnosisValue}
						setValue={setInsertFinalDiagnosisValue}
						setErrorMessage={setAddDiagnosisErrorMessage}
						onAdd={handleAppendDiagnosis}
						disabled={false}
					/>
				</div>
			)}

			{addDiagnosisErrorMessage && (
				<Typography sx={{ mt: 1 }} color="error">
					{addDiagnosisErrorMessage}
				</Typography>
			)}
		</div>
	);
};

export default DiagnosticTestsForm;
