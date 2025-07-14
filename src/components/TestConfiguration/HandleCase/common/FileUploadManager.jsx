import { Grid, Typography } from "@mui/material";
import Image from "components/ReusableComponents/GCSImage";
import UIButton from "components/ReusableComponents/UIButton";
import { useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useFormContext, useWatch } from "react-hook-form";
// import { toast } from "react-toastify";
import useDeleteFile from "../manageCaseHelper";
import CaseFileUploader from "./CaseFileUploader";

const deleteIconStyle = {
	position: "absolute",
	top: 5,
	right: 5,
	background: "#fff",
	borderRadius: "50%",
	padding: "4px 10px",
	fontWeight: "bold",
	boxShadow: "0 1px 5px rgba(0,0,0,0.2)",
	zIndex: 20,
	cursor: "pointer",
};

const supportedViewTypes = ["JPG", "JPEG", "PNG", "SVG"];

const FileUploadManager = ({
	type = "case",
	name,
	sectionFileId,
	supportedFiles = ["JPG", "JPEG", "PNG", "SVG", "PDF"],
	buttonText = "Upload",
	disabled = false,
	isExisting = false,
}) => {
	const { getValues, setValue } = useFormContext();
	const { deleteSingleFile } = useDeleteFile();
	const isCaseEditable = getValues("isCaseEditable");

	// ✅ State is now a simple boolean, as you suggested.
	const [isUploading, setIsUploading] = useState(false);

	const files = useWatch({ name: name }) || [];

	// ✅ This function now just sets the boolean state.
	const onUploadStatus = (_fileId, value) => {
		setIsUploading(value);
	};

	const handleUploadSuccess = (_fileId, uploadedFile) => {
		setIsUploading(false);

		const currentFiles = getValues(name) || [];
		setValue(name, [uploadedFile[0], ...currentFiles]);
	};

	const handleDelete = async (e, doc) => {
		e.stopPropagation();
		if (isUploading) return;

		const response = await deleteSingleFile(
			sectionFileId,
			"case",
			doc.originalName,
			isExisting,
			doc?.isExisting,
			doc?.isExisting ? doc : {},
		);

		if (response) {
			const currentFiles = getValues(name) || [];
			const updatedFiles = currentFiles.filter(
				(d) => d.originalName !== doc.originalName,
			);
			setValue(name, updatedFiles);
		}
	};

	return (
		<div>
			{isCaseEditable && (
				<div className="d-inline-block">
					<CaseFileUploader
						fileId={sectionFileId}
						onUploadStatus={onUploadStatus}
						onUploadSuccess={handleUploadSuccess}
						supportedFiles={supportedFiles}
						disabled={disabled}
						name={name}
						type={type}
						isExisting={isExisting}
					>
						<UIButton
							className="secondary-bg-color rounded rounded-pill px-3"
							text={buttonText}
							// ✅ Button is now disabled based on the isUploading state.
							disabled={isUploading || disabled}
						/>
					</CaseFileUploader>
				</div>
			)}
			<Grid container spacing={2} className="mt-1">
				{/* ✅ Skeleton loader is shown based on the isUploading state. */}
				{isUploading && (
					<Grid item xs={12} sm={4}>
						{/* Skeleton Loader */}
						<div className="secondary-bg-color w-100 p-2 border rounded-3">
							<div className="d-flex gap-2 align-items-center">
								<div
									style={{ width: "60px", height: "60px", background: "#eee" }}
									className="rounded-2"
								>
									<div className="skeleton-loader w-100 h-100" />
								</div>
								<div>
									<Typography>Uploading...</Typography>
									<Typography variant="caption" color="textSecondary">
										Please wait
									</Typography>
								</div>
							</div>
						</div>
					</Grid>
				)}
				{files.map((doc, idx) => (
					<Grid key={doc.id || idx} item xs={12} sm={4}>
						<div
							className="secondary-bg-color w-100 p-2 border rounded-3"
							style={{ position: "relative", cursor: "pointer" }}
							onClick={() => {
								/* Viewer logic */
							}}
							onKeyDown={() => {}}
						>
							{isCaseEditable && (
								<span
									style={{
										...deleteIconStyle,
										color: isUploading ? "#D3D3D3" : "#d32f2f",
									}}
									onClick={(e) => handleDelete(e, doc)}
									onKeyDown={() => {}}
								>
									X
								</span>
							)}

							{/* File Preview */}
							<div className="d-flex gap-2 align-items-center">
								<div
									className="rounded-2 overflow-hidden"
									style={{ width: "60px", height: "60px" }}
								>
									{supportedViewTypes.includes(
										doc?.originalName?.split(".").pop()?.toUpperCase(),
									) ? (
										<Image
											key={doc?.originalName}
											style={{ height: "100%", width: "100%" }}
											fileId={sectionFileId}
											name={doc.originalName}
											type="case"
										/>
									) : (
										<div style={{ width: "80%", height: "100%" }}>
											<FileIcon
												extension={doc?.originalName?.split(".").pop()}
												{...defaultStyles[doc?.originalName?.split(".").pop()]}
											/>
										</div>
									)}
								</div>
								<div>
									<div style={{ wordBreak: "break-all" }}>
										{doc?.originalName || "Document"}
									</div>
									<div>{doc?.uploadedDate}</div>
								</div>
							</div>
						</div>
					</Grid>
				))}
			</Grid>
		</div>
	);
};

export default FileUploadManager;
