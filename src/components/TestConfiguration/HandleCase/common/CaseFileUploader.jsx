import { UPLOAD_FILE_WITH_UUID } from "adapters/noki_ed.service";
import dayjs from "dayjs";
import { useUserType } from "hooks/useUserType";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useDeleteFile from "../manageCaseHelper";

const CaseFileUploader = ({
	disabled = false,
	fileId = "",
	onUploadStatus = () => {},
	onUploadSuccess = () => {},
	type = "case",
	supportedFiles = ["JPG", "JPEG", "PNG", "SVG", "PDF"],
	maxSize = "5",
	children = <></>,
	name = "",
	isExisting = false,
	...props
}) => {
	const userRole = useUserType();
	const [error, setError] = useState("");
	const userID = useSelector((state) => state?.auth?.personData?.id);
	const { getValues, setValue } = useFormContext();
	const { uploadNewFile } = useDeleteFile();

	const handleChange = async (file) => {
		try {
			setError("");
			onUploadStatus(fileId, true);
			const formData = new FormData();
			formData.append("files", file);
			formData.append("type", "case");
			formData.append("fileId", fileId);
			formData.append("role", userRole?.toLowerCase());
			formData.append("created_by", userID);
			formData.append("updated_by", userID);
			const currentFiles = getValues(name) || [];

			const isDuplicate = currentFiles.some(
				(doc) => doc.originalName === file?.name,
			);

			if (isDuplicate) {
				if (typeof window !== "undefined") {
					toast.error("File with the same name already exists.");
				}
				return;
			}
			const currentValue = getValues(`filesToProcess.${fileId}`);
			const deletedFiles = { ...(currentValue?.deleteFiles || {}) };
			const value = deletedFiles[file?.name];

			if (value?.isExisting) {
				onUploadSuccess(fileId, [value]);
				delete deletedFiles[file?.name];
				setValue(`filesToProcess.${fileId}`, {
					...(currentValue || {}),
					deleteFiles: deletedFiles,
				});
				return;
			}
			const response = await UPLOAD_FILE_WITH_UUID(formData);

			if (response?.data?.success?.length) {
				uploadNewFile(fileId, type, file?.name, isExisting);
				onUploadSuccess(
					fileId,
					response?.data?.success?.map((item) => ({
						...item,
						uploadedDate: dayjs().format("MM-DD-YYYY"),
						isExisting: false,
					})),
				);
			}
		} catch (e) {
			console.error("Upload error", e.message);
			toast.error(e.message || "Upload failed");
		} finally {
			onUploadStatus(fileId, false);
		}
	};
	return (
		<div className="file-uploader-size-helper">
			<FileUploader
				disabled={disabled}
				handleChange={handleChange}
				maxSize={maxSize}
				name="file"
				types={supportedFiles}
				onTypeError={(err) => {
					console.error("Unsupported file type:", err);
					setError(
						props?.errorText ||
							`Unsupported file type. Only ${supportedFiles?.join(", ")} allowed.`,
					);
				}}
				onSizeError={(err) => {
					console.error("Unsupported file size:", err);
					setError(`Document size can be ${maxSize}MB.` || err);
				}}
			>
				{children}
			</FileUploader>
			<p style={{ color: "#d32f2f" }}>{error}</p>
		</div>
	);
};

export default CaseFileUploader;
