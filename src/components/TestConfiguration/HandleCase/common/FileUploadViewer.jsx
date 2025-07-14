import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import GCSFile from "components/ReusableComponents/GCSFile";
import GCSImage from "components/ReusableComponents/GCSImage";
import UIButton from "components/ReusableComponents/UIButton";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import useDeleteFile from "../manageCaseHelper";
import CaseFileUploader from "./CaseFileUploader";

const FileUploadViewer = ({
	name,
	handleLoadingStatus,
	viewOnly = false,
	type = "case",
	height,
}) => {
	const fieldName = `${name}.documents`;
	const { setValue, getValues } = useFormContext();
	const files = useWatch({
		name: fieldName,
	});
	const isFormEditable = useWatch({ name: "isCaseEditable" });
	const fileId = getValues(`${name}.fileId`);
	const isExisting = getValues(`${name}.isExisting`);
	// State for file upload management
	const [uploadStatus, setUploadStatus] = useState(false);
	const [selectedFileIndex, setSelectedFileIndex] = useState(0);
	const { deleteSingleFile } = useDeleteFile();

	// File upload handlers
	const handleUploadStatus = (_fileId, isUploading) => {
		setUploadStatus(isUploading);
		handleLoadingStatus?.(isUploading);
	};
	const handleUploadSuccess = (_fileId, uploadedFiles) => {
		const updatedAttachments = [...uploadedFiles, ...(files || [])];
		setValue(fieldName, updatedAttachments);
		handleLoadingStatus?.(false);
	};

	// Helper function to check if file is an image
	const isImageFile = (fileName) => {
		const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
		const extension = fileName?.split(".").pop()?.toLowerCase();
		return imageExtensions.includes(extension);
	};

	// Helper function to get file icon for non-images
	const getFileIcon = (fileName) => {
		const extension = fileName?.split(".").pop()?.toLowerCase();
		switch (extension) {
			case "pdf":
				return "📄";
			default:
				return "📎";
		}
	};

	const handleRemoveAttachment = (index) => {
		try {
			const response = deleteSingleFile(
				fileId,
				"case",
				files?.[index]?.originalName,
				isExisting,
				files?.[index]?.isExisting,
				files?.[index]?.isExisting ? files?.[index] : {},
			);
			if (response) {
				const updatedAttachments = files.filter((_, i) => i !== index);
				setValue(fieldName, updatedAttachments);
				if (
					selectedFileIndex >= updatedAttachments.length &&
					updatedAttachments.length > 0
				) {
					setSelectedFileIndex(updatedAttachments.length - 1);
				} else if (updatedAttachments.length === 0) {
					setSelectedFileIndex(0);
				}
				// toast.success("Deleted Attachments Successfully");
			}
		} catch (error) {
			console.error("Error deleting attachment", error);
			toast.error("Error Deleting Attachment");
		}
	};

	// Navigation functions for file viewer
	const handlePreviousFile = () => {
		if (files.length > 0) {
			setSelectedFileIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
		}
	};

	const handleNextFile = () => {
		if (files.length > 0) {
			setSelectedFileIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
		}
	};

	const handleFileSelect = (index) => {
		setSelectedFileIndex(index);
	};

	// Function to render file viewer content
	const renderFileViewer = (file) => {
		if (!file) return null;

		const fileName = file.originalName || file.fileName;
		const fileUrl = file.downloadUrl || file.url;

		if (isImageFile(fileName)) {
			return (
				<GCSImage
					key={file.originalName}
					name={file.originalName}
					fileId={fileId}
					type={"case"}
					style={{
						width: "85%",
						height: "85%",
						// objectFit: "contain",
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
					<div style={{ fontSize: "48px" }}>📄</div>
					<Typography variant="h6" gutterBottom>
						{fileName}
					</Typography>
					{/* <Typography variant="body2" sx={{ opacity: 0.7, marginBottom: 2 }}>
						PDF Document
					</Typography> */}
					{fileUrl && (
						<GCSFile
							text="View PDF"
							name={file.originalName}
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
				{/* <Typography variant="body2" sx={{ opacity: 0.7, marginBottom: 2 }}>
					Document File
				</Typography> */}
				{fileUrl && (
					<GCSFile
						text="View Document"
						name={file.originalName}
						type="case"
						fileId={fileId}
					/>
				)}
			</div>
		);
	};

	const generateFileId = () => {
		if (!fileId) {
			const id = uuidv4();
			setValue(`${name}.fileId`, id);
			setValue(`${name}.isExisting`, false);
			return id;
		}
		return fileId;
	};
	return (
		<Grid container height={height || "400px"} width="100%" gap="1rem">
			{!viewOnly && (
				<Grid
					item
					sx={{ borderRadius: "12px", background: "#F9F9F9" }}
					xs={12}
					sm={5}
				>
					<Box
						padding={2}
						className="d-flex flex-column justify-content-between h-100"
					>
						<Box
							sx={{
								flex: 1,
								maxHeight: "320px",
								overflowY: "auto",
								borderRadius: "8px",
								padding: "8px",
								marginBottom: "12px",
							}}
						>
							{uploadStatus && (
								<Box
									className="secondary-bg-colo border"
									sx={{
										padding: "12px",
										borderRadius: "12px",
										marginBottom: "8px",
									}}
								>
									<Box
										className="d-flex align-items-center"
										sx={{ gap: "20px" }}
									>
										<div
											className="rounded-2"
											style={{
												width: "48px",
												height: "48px",
												background: "#eee",
											}}
										>
											<div className="skeleton-loader w-100 h-100" />
										</div>
										<div>
											<Typography>Uploading...</Typography>
											<Typography variant="caption" color="textSecondary">
												Please wait
											</Typography>
										</div>
									</Box>
								</Box>
							)}
							{files && files?.length > 0
								? files.map((file, index) => (
										<div
											key={`${file.originalName || file.fileName}-${index}`}
											onClick={() => handleFileSelect(index)}
											onKeyDown={(_e) => {
												handleFileSelect(index);
											}}
											style={{
												display: "flex",
												alignItems: "center",
												gap: "20px",
												padding: "12px",
												borderRadius: "12px",
												marginBottom: "8px",
												backgroundColor:
													selectedFileIndex === index ? "#5840BA" : "#f9f9f9",
												color:
													selectedFileIndex === index ? "#ffff" : "#252525",
												cursor: "pointer",
												transition: "all 0.2s ease",
												position: "relative",
											}}
										>
											<div
												style={{
													width: "48px",
													height: "48px",
													borderRadius: "4px",
													overflow: "hidden",
													border: "1px solid #ddd",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													backgroundColor: "#fff",
													flexShrink: 0,
												}}
											>
												{isImageFile(file.originalName || file.fileName) ? (
													<GCSImage
														fileId={fileId}
														name={file.originalName}
														type="case"
														style={{
															width: "100%",
															height: "100%",
															objectFit: "cover",
														}}
													/>
												) : (
													<span style={{ fontSize: "20px" }}>
														{getFileIcon(file.originalName || file.fileName)}
													</span>
												)}
											</div>

											{/* File details */}
											<div style={{ flex: 1, minWidth: 0 }}>
												<Typography
													variant="body2"
													fontWeight="600"
													sx={{
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
														fontSize: "16px",
													}}
												>
													{file.originalName || file.fileName}
												</Typography>
												<Typography
													variant="caption"
													sx={{ opacity: 0.7, fontSize: "14px" }}
												>
													{file.uploadedDate}
												</Typography>
											</div>

											{/* Remove button */}
											{!viewOnly && isFormEditable && (
												<IconButton
													onClick={() => {
														handleRemoveAttachment(index);
													}}
													size="small"
													disabled={uploadStatus}
													sx={{
														color:
															selectedFileIndex === index ? "#ffff" : "#d32f2f",
														"&:hover": {
															backgroundColor: "rgba(255, 0, 0, 0.1)",
														},
													}}
												>
													<DeleteOutlinedIcon fontSize="small" />
												</IconButton>
											)}
										</div>
									))
								: !uploadStatus && (
										<Box className="h-100 d-flex justify-content-center align-items-center">
											<Typography>No Files Uploaded Yet</Typography>
										</Box>
									)}
						</Box>
						<div key={fileId}>
							{!viewOnly && isFormEditable && (
								<CaseFileUploader
									fileId={generateFileId()}
									onUploadStatus={handleUploadStatus}
									onUploadSuccess={handleUploadSuccess}
									disabled={uploadStatus}
									name={`${name}.documents`}
									isExisting={isExisting}
									type={type}
								>
									<UIButton
										variant="contained"
										text="Upload Files"
										disabled={uploadStatus}
										sx={{
											borderRadius: "8px",
											textTransform: "none",
											width: "100%",
											padding: "12px",
										}}
									/>
								</CaseFileUploader>
							)}
						</div>
					</Box>
				</Grid>
			)}
			<Grid item xs={12} sm={viewOnly ? 12 : 6.5} height="100%">
				{files && files.length > 0 ? (
					<div
						style={{
							height: "100%",
							display: "flex",
							flexDirection: "column",
							backgroundColor: "#fff",
						}}
					>
						{/* File viewer content with navigation arrows */}
						<div
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "28px",
								height: "90%",
							}}
						>
							{/* Left navigation arrow */}
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
								disabled={files?.length < 2}
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
								{renderFileViewer(files[selectedFileIndex])}
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
								disabled={files?.length < 2}
							>
								<ArrowForwardIos />
							</IconButton>
						</div>

						{/* File counter at bottom */}
						{files.length > 1 && (
							<div
								style={{
									padding: "8px 16px",
									borderTop: "1px solid #e0e0e0",
									backgroundColor: "#f8f9fa",
									textAlign: "center",
									height: "10%",
								}}
							>
								<Typography variant="caption" sx={{ opacity: 0.7 }}>
									{selectedFileIndex + 1} of {files.length}
								</Typography>
							</div>
						)}
					</div>
				) : (
					<div
						style={{
							height: "100%",
							borderRadius: "8px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#ffff",
						}}
					>
						<div style={{ textAlign: "center", color: "#999" }}>
							<div style={{ fontSize: "48px", marginBottom: "16px" }}>🖼️</div>
							<Typography variant="body1">No files to preview</Typography>
							{!viewOnly && (
								<Typography variant="body2" sx={{ opacity: 0.7 }}>
									Upload files to see them here
								</Typography>
							)}
						</div>
					</div>
				)}
			</Grid>
		</Grid>
	);
};

export default FileUploadViewer;
