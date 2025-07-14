import { Close, Delete } from "@mui/icons-material";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Skeleton,
	Tooltip,
} from "@mui/material";
import {
	DELETE_FILE_FOR_INTEGRATED_CASE,
	GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID,
	UPLOAD_FILE_FOR_INTEGRATED_CASE,
} from "adapters/noki_ed.service";
import UIButton from "components/ReusableComponents/UIButton";
import UISelectField from "components/ReusableComponents/UISelectField";
import { useUserType } from "hooks/useUserType";
import CustomizedFileUploader from "pages/AiTutor/admin/FileDragDropUI";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const MAX_DOCUMENTS = 5; // Added constant for max documents
const ManageCaseDocuments = forwardRef(
	({ disabled = false, caseData = {} }, ref) => {
		const [open, setOpen] = useState(false);
		const [selectedDocuments, setSelectedDocuments] = useState([]);
		const [uploadedDocuments, setUploadedDocuments] = useState([]);
		const [initialSelectedDocuments, setInitialSelectedDocuments] = useState(
			[],
		);
		const [errors, setErrors] = useState({}); // Added for tracking errors
		const [loading, setLoading] = useState({
			resourceLoading: false,
			uploadResourceLoading: false,
			deleteResourceLoading: false,
		});
		const userRole = useUserType();
		const userID = useSelector((state) => state?.auth?.personData?.id);
		const [applicableType, setApplicableType] = useState([]);
		const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
		const stationMap = useSelector((state) => state?.stations?.stationMap);

		const openDeleteDialog = (data) => setDeleteDialogOpen(data);
		const closeDeleteDialog = () => setDeleteDialogOpen(false);

		const handleClickOpen = () => {
			setOpen(true);
		};

		const handleClose = () => {
			setOpen(false);
			setSelectedDocuments([]);
			setErrors({}); // Clear errors on close
		};

		const getUploadedResources = async (escapeLoading = false) => {
			try {
				if (!escapeLoading) {
					setLoading((prev) => ({ ...prev, resourceLoading: true }));
				}
				const response = await GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID(
					caseData?.fhir_questionnaire_id,
				);
				if (response?.data?.created_by) {
					setUploadedDocuments(response?.data);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading((prev) => ({ ...prev, resourceLoading: false }));
			}
		};

		useEffect(() => {
			if (caseData?.fhir_questionnaire_id) {
				getUploadedResources();
			}
		}, [caseData?.fhir_questionnaire_id]);

		useEffect(() => {
			if (caseData?.applicable_types?.length && !applicableType?.length) {
				setApplicableType(
					caseData?.applicable_types?.map((item) => ({
						value: item,
						label: stationMap?.[item]?.type,
					})),
				);
			}
		}, [caseData?.applicable_types?.length]);

		useEffect(() => {
			if (initialSelectedDocuments?.length && open) {
				setSelectedDocuments(initialSelectedDocuments);
			}
		}, [open]);

		const handleSaveResources = () => {
			if (!validateDocuments()) {
				return;
			}
			setInitialSelectedDocuments(selectedDocuments);
			handleClose();
		};

		const handleFileSelect = (file) => {
			// Check if we've reached the maximum number of documents
			if (selectedDocuments.length >= MAX_DOCUMENTS) {
				return;
			}

			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = (e) => {
				const dataURL = e.target.result;

				const newFileData = {
					rawData: file,
					url: dataURL,
					applicableStations:
						caseData?.applicable_types?.length === 1
							? [caseData?.applicable_types?.[0]]
							: [],
				};

				setSelectedDocuments((prev) => {
					// Filter out file with the same name
					const filtered = prev.filter((doc) => doc.rawData.name !== file.name);
					// Add the new file
					return [newFileData, ...filtered];
				});
			};
		};

		const handleApplicableTypeChange = (fileName, valueOrEvent, isMultiple) => {
			const selectedValues = isMultiple
				? valueOrEvent // already an array of selected options
				: [valueOrEvent?.target?.value]; // extract from event for single select

			const updateList = (list) =>
				list.map((doc) =>
					doc.rawData.name === fileName
						? {
								...doc,
								applicableStations: selectedValues,
							}
						: doc,
				);

			setSelectedDocuments((prev) => updateList(prev));
			setErrors((prev) => ({ ...prev, [fileName]: false }));
		};

		const validateDocuments = () => {
			const newErrors = {};
			let isValid = true;

			for (const doc of selectedDocuments) {
				if (!doc.applicableStations || doc.applicableStations.length === 0) {
					newErrors[doc.rawData.name] = true;
					isValid = false;
				}
			}

			setErrors(newErrors);
			return isValid;
		};

		const handleUploadResources = async (props) => {
			// Validate before upload
			if (!validateDocuments()) {
				return;
			}

			try {
				const documents = initialSelectedDocuments?.length
					? initialSelectedDocuments
					: selectedDocuments;
				if (
					!caseData?.fhir_questionnaire_id &&
					!initialSelectedDocuments?.length
				) {
					return;
				}
				const fhir_questionnaire_id = props?.fhir_questionnaire_id
					? props?.fhir_questionnaire_id
					: caseData?.fhir_questionnaire_id;
				const created_by = props?.created_by
					? props?.created_by
					: caseData?.created_by;
				setLoading((prev) => ({ ...prev, uploadResourceLoading: true }));
				const applicableStationsMap = documents?.reduce((acc, item) => {
					acc[item?.rawData?.name] = item?.applicableStations;
					return acc;
				}, {});

				// Build FormData
				const formData = new FormData();

				for (const item of documents) {
					formData.append("files", item.rawData);
				}

				formData.append(
					"applicableStations",
					JSON.stringify(applicableStationsMap),
				);
				formData.append("questionnaireId", fhir_questionnaire_id);
				formData.append("role", userRole.toLowerCase());
				formData.append("created_by", created_by);
				formData.append("updated_by", userID);

				const response = await UPLOAD_FILE_FOR_INTEGRATED_CASE(formData);

				if (response?.data?.success?.length) {
					setSelectedDocuments([]);
					setInitialSelectedDocuments([]);
					if (caseData?.fhir_questionnaire_id) {
						getUploadedResources(uploadedDocuments?.data?.length > 0);
						toast.success(
							`${selectedDocuments.length > 1 ? "Documents" : "Document"} Uploaded Successfully.`,
						);
					}
				}
			} catch (error) {
				console.error("Error uploading one or more files:", error.message);
				toast.error(
					error?.message
						? error?.message
						: "Something went wrong while uploading document.",
				);
			} finally {
				setLoading((prev) => ({ ...prev, uploadResourceLoading: false }));
			}
		};

		const handleResourceDelete = async () => {
			try {
				setLoading((prev) => ({ ...prev, deleteResourceLoading: true }));
				const payload = {
					name: deleteDialogOpen?.originalName,
					questionnaireId: caseData?.fhir_questionnaire_id,
					role: userRole.toLowerCase(),
					created_by: caseData?.created_by,
					updated_by: userID,
				};
				const _response = await DELETE_FILE_FOR_INTEGRATED_CASE(payload);
				setUploadedDocuments((prev) => ({
					...prev,
					data: prev.data.filter(
						(item) => item?.originalName !== deleteDialogOpen?.originalName,
					),
				}));
				toast.success("Document Deleted Successfully.");
				closeDeleteDialog();
			} catch (e) {
				console.error(e);
				toast.error(
					e?.message
						? e?.message
						: "Something went wrong while deleting document.",
				);
			} finally {
				setLoading((prev) => ({ ...prev, deleteResourceLoading: false }));
			}
		};

		const handleDeleteSelectedFile = (name) => {
			setSelectedDocuments((prev) =>
				prev?.filter((item) => item.rawData.name !== name),
			);
		};

		useImperativeHandle(ref, () => {
			return {
				handleSaveDocument: (props) => handleUploadResources(props),
			};
		});
		const getStationNames = (stations) =>
			stations?.map((station) => stationMap?.[station]?.type)?.join(", ");

		return (
			<>
				<UIButton
					className="p-2 px-4 rounded-pill"
					onClick={handleClickOpen}
					variant="contained"
					text="Manage Documents"
					disabled={disabled}
				/>
				<Dialog fullWidth maxWidth={"lg"} open={open} sx={{ height: "100%" }}>
					<div className="d-flex flex-column h-100 overflow-hidden">
						<div className="d-flex justify-content-between align-items-center fs-5 py-2 mx-3">
							<div>Manage Document for Case.</div>
							<div>
								<IconButton onClick={handleClose}>
									<Close />
								</IconButton>
							</div>
						</div>
						<div className="card-bg-secondary d-flex h-100 overflow-hidden gap-3 justify-content-between flex-1 p-3">
							<div className="w-50 gap-3 d-flex flex-column">
								<div className="main-bg-color p-2 shadow-sm rounded rounded-4">
									<CustomizedFileUploader
										handleChange={handleFileSelect}
										fileTypes={["JPG", "JPEG", "PNG", "SVG"]}
										fileUploadText="Format: jpg, jpeg, png, svg & Max file size: 5MB"
										errorText="Unsupported file type. Only JPG, JPEG, PNG, or SVG allowed."
										maxSize={5}
										disabled={selectedDocuments.length >= MAX_DOCUMENTS} // Disable when limit reached
									/>
									{selectedDocuments.length >= MAX_DOCUMENTS && (
										<div className="text-danger mt-2">
											Maximum {MAX_DOCUMENTS} documents can be uploaded at once.
										</div>
									)}
								</div>
								{caseData?.fhir_questionnaire_id ? (
									<SelectedDocumentsCard
										selectedDocuments={selectedDocuments}
										errors={errors}
										applicableType={applicableType}
										caseData={caseData}
										handleDeleteSelectedFile={handleDeleteSelectedFile}
										handleApplicableTypeChange={handleApplicableTypeChange}
									/>
								) : (
									<></>
								)}
							</div>
							{caseData?.fhir_questionnaire_id ? (
								<div className="w-50 main-bg-color p-2 shadow-sm rounded-3 pb-1 overflow-hidden">
									<div className="fs-5" style={{ color: "#5840BA" }}>
										Uploaded Documents
									</div>
									<div
										className="card-bg-secondary rounded-3 overflow-auto"
										style={{ height: "95%" }}
									>
										{loading?.resourceLoading ? (
											<div className="d-flex flex-column gap-2 m-2">
												<Skeleton
													variant="rounded"
													width={"100%"}
													height={60}
												/>
												<Skeleton
													variant="rounded"
													width={"100%"}
													height={60}
												/>
												<Skeleton
													variant="rounded"
													width={"100%"}
													height={60}
												/>
											</div>
										) : uploadedDocuments?.data?.length ? (
											uploadedDocuments?.data?.map((item) => (
												<div
													key={item?.rawData?.name}
													className="main-bg-color rounded-1 m-2 p-2 shadow-sm"
												>
													<div className="d-flex justify-content-between align-items-baseline">
														<div>
															<div>
																<span className="fw-bold">Filename :</span>{" "}
																{item?.originalName}
															</div>
															<div>
																<span className="fw-bold">
																	Applicable Stations :
																</span>
																{getStationNames(item?.applicableStations)}
															</div>
														</div>
														<div>
															<IconButton
																onClick={() => {
																	openDeleteDialog(item);
																}}
															>
																<Delete />
															</IconButton>
														</div>
													</div>

													<div style={{ height: "400px" }}>
														<img
															src={item?.url}
															alt="Resource Loading..."
															width={"100%"}
															height={"100%"}
														/>
													</div>
												</div>
											))
										) : (
											<div className="main-bg-color rounded-1 m-2 p-2 shadow-sm">
												No File Found.
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="w-50 overflow-auto d-flex ">
									<SelectedDocumentsCard
										selectedDocuments={selectedDocuments}
										errors={errors}
										applicableType={applicableType}
										caseData={caseData}
										handleDeleteSelectedFile={handleDeleteSelectedFile}
										handleApplicableTypeChange={handleApplicableTypeChange}
									/>
								</div>
							)}
						</div>
						<div className="py-2 mx-3 d-flex justify-content-end gap-2">
							<UIButton
								text="Cancel"
								onClick={handleClose}
								disabled={
									loading?.resourceLoading ||
									loading?.deleteResourceLoading ||
									loading?.uploadResourceLoading
								}
							/>
							{caseData?.fhir_questionnaire_id ? (
								<UIButton
									text={
										loading?.uploadResourceLoading ? "Uploading..." : "Upload"
									}
									onClick={handleUploadResources}
									variant="contained"
									disabled={
										!selectedDocuments?.length ||
										loading?.resourceLoading ||
										loading?.deleteResourceLoading ||
										loading?.uploadResourceLoading
									}
								/>
							) : (
								<UIButton
									text="Save"
									onClick={handleSaveResources}
									variant="contained"
									disabled={
										(initialSelectedDocuments?.length === 0 &&
											selectedDocuments?.length === 0) ||
										(JSON.stringify(initialSelectedDocuments) ===
											JSON.stringify(selectedDocuments) &&
											selectedDocuments?.length ===
												initialSelectedDocuments?.length)
									}
								/>
							)}
						</div>
					</div>
				</Dialog>

				<Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
					<DialogTitle>Delete Document</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Are you sure you want to delete{" "}
							<strong>{deleteDialogOpen?.originalName}</strong>? This action
							cannot be undone.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<UIButton
							onClick={closeDeleteDialog}
							disabled={loading?.deleteResourceLoading}
							text="Cancel"
						/>
						<UIButton
							onClick={handleResourceDelete}
							color="error"
							variant="contained"
							disabled={loading?.deleteResourceLoading}
							text={loading?.deleteResourceLoading ? "Deleting..." : "Delete"}
						/>
					</DialogActions>
				</Dialog>
			</>
		);
	},
);
const SelectedDocumentsCard = ({
	selectedDocuments,
	errors,
	applicableType,
	caseData,
	handleDeleteSelectedFile,
	handleApplicableTypeChange,
}) => {
	return (
		<div className="w-100 main-bg-color border p-2 d-flex flex-column shadow-sm rounded-3 overflow-auto ">
			<div className="fs-5" style={{ color: "#5840BA" }}>
				Selected Documents ({selectedDocuments.length}/{MAX_DOCUMENTS})
			</div>
			<div className="h-100 overflow-auto card-bg-secondary rounded-3 mt-1">
				{selectedDocuments?.length ? (
					selectedDocuments?.map((item) => (
						<div
							key={item?.rawData?.name}
							className="main-bg-color rounded-1 m-2 p-2 shadow-sm"
							style={{
								border: errors[item.rawData.name] ? "1px solid #d32f2f" : "",
							}}
						>
							<div className="d-flex justify-content-between align-items-center">
								<Tooltip title={item?.rawData?.name} arrow>
									<div
										className="w-75 text-truncate"
										style={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{item?.rawData?.name}
									</div>
								</Tooltip>
								<IconButton
									onClick={() => handleDeleteSelectedFile(item?.rawData?.name)}
								>
									<Delete />
								</IconButton>
							</div>
							<div className="d-flex mb-1 w-100 justify-content-between align-items-baseline">
								<div className="w-100">
									<UISelectField
										options={applicableType}
										multiple={caseData?.applicable_types?.length > 1}
										isRequired={true}
										name="applicableStations"
										label="Applicable Station Types"
										value={item?.applicableStations}
										onChange={(eventOrValue) => {
											handleApplicableTypeChange(
												item.rawData.name,
												eventOrValue,
												caseData?.applicable_types?.length > 1,
											);
										}}
										error={errors[item.rawData.name]}
										errorMessage={
											errors[item.rawData.name]
												? "Please select applicable stations"
												: ""
										}
									/>
								</div>
							</div>
							<div style={{ height: "200px" }}>
								<img
									src={item?.url}
									alt="Resource Loading..."
									width={"100%"}
									height={"100%"}
								/>
							</div>
						</div>
					))
				) : (
					<div className="main-bg-color rounded-1 m-2 p-2 shadow-sm">
						No file Selected
					</div>
				)}
			</div>
		</div>
	);
};
export default ManageCaseDocuments;
