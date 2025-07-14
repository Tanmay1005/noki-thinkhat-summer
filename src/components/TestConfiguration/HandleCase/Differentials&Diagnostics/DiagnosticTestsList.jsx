import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import { GET_ALL_FILE_USING_FILEID } from "adapters/noki_ed.service";
import GCSFile from "components/ReusableComponents/GCSFile";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useEffect, useState } from "react";
import {
	useController,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { themeColors } from "../stations/DiagnosticTestsForm";
import DiagnosticTestResults from "./DiagnosticTestResults";

const DiagnosticTestsList = ({
	name,
	fileSection = false,
	isDisabled = false,
}) => {
	const fieldName = `${name}.diagnostics`;
	const { control, setValue } = useFormContext();
	const {
		field: { value: values, onChange },
	} = useController({
		name: fieldName,
		control,
		defaultValue: [],
	});
	const { remove: removeIndex } = useFieldArray({
		control,
		name: fieldName,
	});
	const currentStationId = useWatch({ name: "currentStationId" });
	const stationData = useWatch({ name: "stations" });
	const tests =
		stationData?.[`${currentStationId}`]?.expertApproach?.tests || [];

	const [images, setImages] = useState({});
	const [selectedFileId, setSelectedFileId] = useState(null);
	const [selectedFileIndex, setSelectedFileIndex] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [showNoFilesMessage, setShowNoFilesMessage] = useState(false);
	const [selectedBox, setSelectedBox] = useState(values[0]?.loinc_num || null);
	const orderTests = useWatch({ name: "orderTests" });
	const _diagnosticTests = useWatch({
		name: "student.expertApproach.diagnostics",
	});

	// Helper function to check if file is an image
	const isImageFile = (filename) => {
		const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
		const extension = filename?.split(".")?.pop()?.toLowerCase();
		return imageExtensions.includes(extension);
	};

	const getAllFilesByFileId = async (fileId) => {
		try {
			if (!images?.[fileId]) {
				const response = await GET_ALL_FILE_USING_FILEID(fileId, "case");
				if (response?.status === 200) {
					const fileData = response?.data;
					if (fileData?.length > 0) {
						setImages((prevImages) => {
							return {
								...prevImages,
								[fileId]: fileData,
							};
						});
					} else {
						setImages((prevImages) => ({
							...prevImages,
							[fileId]: [],
						}));
					}
				}
			}
		} catch (error) {
			setImages((prevImages) => ({
				...prevImages,
				[fileId]: [],
			}));
			console.error("Error fetching file data:", error);
		}
	};

	useEffect(() => {
		if (values && values?.length > 0) {
			const firstTest = values[0];
			const findFile = tests.find(
				(test) => test.loinc_num === firstTest.loinc_num,
			);
			if (findFile?.fileId) {
				getAllFilesByFileId(findFile.fileId);
				setSelectedFileId(findFile.fileId);
				setShowNoFilesMessage(false);
			} else {
				setShowNoFilesMessage(true);
				setSelectedFileId(null);
			}
		}
	}, [values]);

	const removeTests = (index) => {
		removeIndex(index);
	};

	// Navigation functions for file viewer
	const handlePreviousFile = () => {
		const files = images[selectedFileId] || [];
		if (files.length > 0) {
			setSelectedFileIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
		}
	};

	const handleNextFile = () => {
		const files = images[selectedFileId] || [];
		if (files.length > 0) {
			setSelectedFileIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
		}
	};
	const getFileIcon = (fileName) => {
		const extension = fileName?.split(".").pop()?.toLowerCase();
		switch (extension) {
			case "pdf":
				return "📄";
			default:
				return "📎";
		}
	};
	const renderFileViewer = (file, fileId) => {
		if (!file) return null;
		const fileSplit = file.name.split("/");
		const name = fileSplit[fileSplit.length - 1];
		const fileName = name || file.originalName || file.fileName;
		const fileUrl = file.downloadUrl || file.url;
		if (isImageFile(fileName)) {
			return (
				<img
					id={fileName}
					src={fileUrl}
					alt={fileName}
					style={{
						width: "85%",
						height: "85%",
						objectFit: "contain",
						borderRadius: "8px",
					}}
				/>
			);
		}

		// For PDFs, show an embedded viewer or preview
		if (fileName?.toLowerCase().endsWith(".pdf")) {
			return (
				<div
					style={{
						width: "85%",
						height: "85%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#f5f5f5",
						borderRadius: "8px",
						border: "2px solid #e0e0e0",
					}}
				>
					<div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
					<Typography variant="h6" gutterBottom>
						{fileName}
					</Typography>
					<Typography variant="body2" sx={{ opacity: 0.7, marginBottom: 2 }}>
						PDF Document
					</Typography>
					{fileUrl && (
						<GCSFile
							text="View pdf"
							name={fileName}
							type="case"
							fileId={fileId}
						/>
					)}
				</div>
			);
		}

		// For other file types
		return (
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#f5f5f5",
					borderRadius: "8px",
					border: "2px solid #e0e0e0",
				}}
			>
				<div style={{ fontSize: "48px", marginBottom: "16px" }}>
					{getFileIcon(fileName)}
				</div>
				<Typography variant="h6" gutterBottom>
					{fileName}
				</Typography>
				<Typography variant="body2" sx={{ opacity: 0.7, marginBottom: 2 }}>
					Document File
				</Typography>
				{fileUrl && (
					<GCSFile
						text="View file"
						name={fileName}
						type="case"
						fileId={fileId}
					/>
				)}
			</div>
		);
	};

	const handleTestClick = async (item) => {
		const test = tests.find((test) => test.loinc_num === item.loinc_num);
		setSelectedBox(item?.loinc_num);
		if (test?.fileId) {
			setSelectedFileId(test?.fileId);
			setSelectedFileIndex(0);
			setShowNoFilesMessage(false);
			await getAllFilesByFileId(test?.fileId);
		} else {
			setShowNoFilesMessage(true);
			setSelectedFileId(null);
		}
	};
	const handleOrderTests = () => {
		// Order tests functionality to be implemented
		setValue("orderTests", true);
	};

	const handleDiagnosticTestsChange = (selectedItems) => {
		const transformedItems = selectedItems.map((item) => ({
			loinc_num: item?.loinc_num,
			testName: item?.long_common_name || item?.testName,
			id: item?.loinc_num,
		}));
		onChange(transformedItems);
	};
	return (
		<>
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
				<Box sx={{ height: "75%" }}>
					<DiagnosticTestResults
						name={fieldName}
						onSelectedItemsChange={handleDiagnosticTestsChange}
						selectedItems={values}
						isDisabled={isDisabled}
					/>
				</Box>
				{/*Footer */}
				<div className="d-flex flex-column mt-1" style={{ height: "20%" }}>
					{values.length > 0 && (
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
								{values.map((opt, index) => (
									<Chip
										key={`${opt?.fileId}-selected-${index + 1}`}
										label={opt?.testName}
										onDelete={() => {
											removeIndex(index);
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
										disabled={isDisabled}
									/>
								))}
							</Box>
						</>
					)}
				</div>
			</UIModal>

			<Box
				sx={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{orderTests && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
							flexShrink: 0,
						}}
					>
						<Typography variant="h6">Tests ordered</Typography>
						<UIButton
							text="order tests"
							variant="contained"
							onClick={() => setShowModal(true)}
							disabled={isDisabled}
						/>
					</Box>
				)}
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						gap: 1,
						flex: 1,
						height: "90%",
					}}
				>
					<Box
						sx={{
							borderRadius: "12px",
							background: "#F9F9F9",
							flex: fileSection ? "0 0 50%" : "1",
							height: "100%",
							width: fileSection ? "50%" : "100%",
						}}
					>
						<Box sx={{ width: "100%", height: "100%", overflowY: "auto" }}>
							{values && values?.length > 0 ? (
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										flexDirection: "column",
									}}
								>
									<Box
										sx={{
											display: "flex",
											justifyContent: "flex-start",
											alignItems: "center",
											flexDirection: "column",
											gap: 1,
											maxHeight: "80%",
											overflowY: "auto",
											scrollbarWidth: "thin",
											width: "100%",
											padding: 1,
										}}
									>
										{values.map((test, index) => (
											<Box
												key={`${test?.loinc_num}-${index}`}
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													background:
														orderTests && test?.loinc_num === selectedBox
															? "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)"
															: "#FFFFFF",
													color:
														orderTests && test?.loinc_num === selectedBox
															? "#FFFFFF"
															: "#000000",
													borderRadius: 2,
													padding: 1,
													boxShadow: 1,
													width: "100%",
												}}
												onClick={() => fileSection && handleTestClick(test)}
												style={{ cursor: "pointer" }}
											>
												<Typography variant="body2" sx={{ flexGrow: 1 }}>
													{test?.testName || test}
												</Typography>
												{!fileSection && (
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															removeTests(index);
														}}
														sx={{ ml: 1 }}
														disabled={isDisabled}
													>
														<CloseIcon fontSize="small" />
													</IconButton>
												)}
											</Box>
										))}
									</Box>
								</Box>
							) : (
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}
								>
									No diagnostic tests added yet.
								</Typography>
							)}
							{!fileSection && (
								<UIButton
									variant="contained"
									color="primary"
									size="medium"
									sx={{ mt: 2 }}
									text="Order Tests"
									onClick={handleOrderTests}
									fullWidth
									disabled={values?.length === 0}
								/>
							)}
						</Box>
					</Box>
					{/* Display files if available */}
					{fileSection && (
						<Box
							sx={{
								borderRadius: "12px",
								background: "#F9F9F9",
								flex: "0 0 50%",
								height: "100%",
								width: "50%",
							}}
						>
							<Box
								sx={{
									width: "100%",
									height: "100%",
									display: "flex",
									flexDirection: "column",
								}}
							>
								{/* <Typography variant="h6" sx={{ mb: 2 }}>
							Associated Files
						</Typography> */}
								{!showNoFilesMessage && images[selectedFileId]?.length > 0 ? (
									<Box
										sx={{
											flex: 1,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "28px",
											height: "100%",
										}}
									>
										<IconButton
											onClick={handlePreviousFile}
											size="small"
											sx={{
												backgroundColor: "transparent",
												color: "inherit",
												"&:hover": {
													backgroundColor: "transparent",
													color: "inherit",
												},
											}}
										>
											<ArrowBackIos />
										</IconButton>

										{/* File viewer content */}
										<div
											style={{
												width: "100%",
												height: "100%",
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											{renderFileViewer(
												images[selectedFileId][selectedFileIndex],
												selectedFileId,
											)}
										</div>

										{/* Right navigation arrow */}
										<IconButton
											onClick={handleNextFile}
											size="small"
											sx={{
												backgroundColor: "transparent",
												color: "inherit",
												"&:hover": {
													backgroundColor: "transparent",
													color: "inherit",
												},
											}}
										>
											<ArrowForwardIos />
										</IconButton>
									</Box>
								) : (
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											fontStyle: "italic",
											textAlign: "center",
											py: 2,
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										No files available. Click on a test item to load associated
										files.
									</Typography>
								)}
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</>
	);
};

export default DiagnosticTestsList;
