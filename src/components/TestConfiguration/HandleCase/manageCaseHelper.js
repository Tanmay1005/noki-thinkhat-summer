import { TextField } from "@mui/material";
import {
	DELETE_ALL_FILE_USING_FILEID,
	DELETE_SINGLE_FILE_USING_FILEID,
} from "adapters/noki_ed.service";
// import {
// 	DELETE_ALL_FILE_USING_FILEID,
// 	DELETE_SINGLE_FILE_USING_FILEID,
// } from "adapters/noki_ed.service";
import UIButton from "components/ReusableComponents/UIButton";
import { isGivenValueEmpty, jsonToHtml } from "helpers/common_helper";
import { isArray, isObject } from "lodash";
// import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

export const visibilityOptions = [
	{ value: "private", label: "Test" },
	{ value: "public", label: "Practice" },
];

export const AddCustomValueHelper = ({
	addButtonText = "Add EHR Tab",
	inputFieldLabel = "Add tab",
	value,
	setErrorMessage,
	setValue,
	onAdd,
	disabled = false,
}) => {
	const { getValues } = useFormContext();
	const isCaseEditable = getValues("isCaseEditable");
	const handleInputChange = (e) => {
		const value = e.target.value;
		// Allow only alphanumeric characters
		const alphanumericValue = value.replace(/[^a-zA-Z0-9 ]/g, "");

		setErrorMessage("");
		setValue(alphanumericValue);
	};

	const handleKeyDown = (e) => {
		// Check if Enter key is pressed
		if (e.key === "Enter" && value?.trim()) {
			onAdd();
		}
	};

	return (
		<>
			{isCaseEditable ? (
				<div className="d-flex justify-content-between align-items-center gap-2">
					<TextField
						label={inputFieldLabel}
						variant="outlined"
						size="small"
						fullWidth
						value={value}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown} // Add the onKeyDown event listener
						disabled={disabled}
					/>

					<div>
						<UIButton
							variant="contained"
							color="primary"
							text={addButtonText}
							onClick={onAdd}
							disabled={!value?.trim() || disabled}
						/>
					</div>
				</div>
			) : (
				<></>
			)}
		</>
	);
};

export const transformTopLevelKeys = (obj) => {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		if (!isGivenValueEmpty(value)) {
			const transformedKey = key
				.split("_")
				.map((word) => word.toUpperCase())
				.join(" ");
			acc[transformedKey] =
				isObject(value) || isArray(value) ? jsonToHtml(value) : value;
		}
		return acc;
	}, {});
};

const useDeleteFile = () => {
	// const [loadingAllFileId, setLoadingAllFileId] = useState(null);
	// const [loadingSingleFile, setLoadingSingleFile] = useState(null);
	const { setValue, getValues } = useFormContext();

	const deleteAllFiles = (fileId, type, isExisting = false) => {
		try {
			const currentValue = getValues(`filesToProcess.${fileId}`) || {};

			setValue(`filesToProcess.${fileId}`, {
				type,
				isExisting,
				deleteAll: true,
				deleteFiles: { ...(currentValue.deleteFiles || {}) },
				newUploads: { ...(currentValue.newUploads || {}) },
			});
			return true;
		} catch (e) {
			console.error(e?.message);
			return false;
		}
	};

	const deleteSingleFile = (
		fileId,
		type,
		name,
		isExisting = false,
		isFileExisting = false,
		data = {},
	) => {
		try {
			const currentValue = getValues(`filesToProcess.${fileId}`) || {};
			const newUploads = { ...(currentValue.newUploads || {}) };

			// Delete the file from newUploads
			delete newUploads[name];

			setValue(`filesToProcess.${fileId}`, {
				type,
				isExisting,
				deleteAll: false,
				deleteFiles: {
					...(currentValue.deleteFiles || {}),
					[name]: {
						isExisting: isFileExisting,
						...data,
					},
				},
				newUploads,
			});
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	};

	const uploadNewFile = (fileId, type, name, isExisting = false) => {
		const currentValue = getValues(`filesToProcess.${fileId}`) || {};
		const deleteFiles = { ...(currentValue.deleteFiles || {}) };

		// Remove file from deleteFiles
		delete deleteFiles[name];

		setValue(`filesToProcess.${fileId}`, {
			type,
			isExisting,
			deleteAllFiles: false,
			deleteFiles,
			newUploads: {
				...(currentValue.newUploads || {}),
				[name]: { isExisting: false },
			},
		});
	};

	return {
		// loadingAllFileId,
		// loadingSingleFile,
		deleteAllFiles,
		deleteSingleFile,
		uploadNewFile,
	};
};

export default useDeleteFile;

export const processFileDeletions = async (fileData, action) => {
	const deletePromises = [];

	for (const [fileid, details] of Object.entries(fileData || {})) {
		const { type, isExisting, deleteAll, deleteFiles, newUploads } = details;

		if (action === "SAVE") {
			if (deleteAll) {
				deletePromises.push(DELETE_ALL_FILE_USING_FILEID(fileid, type));
			} else if (deleteFiles && Object.keys(deleteFiles).length > 0) {
				for (const filename of Object.keys(deleteFiles)) {
					deletePromises.push(
						DELETE_SINGLE_FILE_USING_FILEID(fileid, type, filename),
					);
				}
			}
		} else if (action === "CANCEL") {
			if (!isExisting) {
				deletePromises.push(DELETE_ALL_FILE_USING_FILEID(fileid, type));
			} else {
				if (newUploads) {
					for (const filename of Object.keys(newUploads)) {
						deletePromises.push(
							DELETE_SINGLE_FILE_USING_FILEID(fileid, type, filename),
						);
					}
				}
				if (deleteFiles) {
					for (const [filename, fileInfo] of Object.entries(deleteFiles)) {
						if (fileInfo.isExisting === false) {
							deletePromises.push(
								DELETE_SINGLE_FILE_USING_FILEID(fileid, type, filename),
							);
						}
					}
				}
			}
		}
	}

	if (deletePromises.length === 0) {
		return;
	}

	try {
		await Promise.all(deletePromises);
	} catch (error) {
		console.error("An error occurred during file deletion:", error);
		// throw new Error(`Failed to process file deletions. ${error.message}`);
	}
};
