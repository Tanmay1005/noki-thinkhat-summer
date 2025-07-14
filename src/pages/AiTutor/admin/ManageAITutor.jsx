import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	LinearProgress,
	Skeleton,
} from "@mui/material";
import {
	DELETE_TUTOR_BY_ID,
	DOCUMENT_CONFIRM_UPLOAD,
	DOCUMENT_UPLOAD_REQUEST,
	GET_DOCUMENT_BY_TUTOR_ID,
	GET_TUTOR_DETAILS_BY_ID,
} from "adapters/ai_tutor.service";
import UIButton from "components/ReusableComponents/UIButton";
import ResourceList from "components/chat/admin/ResourceList";
import { hasEditPrivileges } from "helpers/common_helper";
import { useUserType } from "hooks/useUserType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomizedFileUploader from "./FileDragDropUI";

const ManageAITutor = () => {
	const [savedResources, setSavedResources] = useState([]);
	const [tutorDetails, setTutorDetails] = useState(null);
	const [deletedResourceId, setDeletedResourceId] = useState(null);
	const [loading, setLoading] = useState({
		tutorLoading: false,
		resourceLoading: false,
		fileUploading: false,
		deleteTutor: false,
	});
	const userID = useSelector((state) => state?.auth?.personData?.id);
	const userRole = useUserType();
	const hasEditPermissions = hasEditPrivileges(
		tutorDetails?.created_by,
		userRole,
		userID,
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const isAnyActionLoading =
		loading?.tutorLoading ||
		loading?.resourceLoading ||
		loading?.fileUploading ||
		loading?.deleteTutor;
	const { id } = useParams();
	const navigate = useNavigate();
	const openDeleteDialog = () => setDeleteDialogOpen(true);
	const closeDeleteDialog = () => setDeleteDialogOpen(false);

	const getTutorDetails = async () => {
		try {
			setLoading((prev) => ({ ...prev, tutorLoading: true }));
			const response = await GET_TUTOR_DETAILS_BY_ID(id);
			setTutorDetails(response?.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading((prev) => ({ ...prev, tutorLoading: false }));
		}
	};

	const getDocumentsByTutorId = async () => {
		try {
			setLoading((prev) => ({ ...prev, resourceLoading: true }));
			const response = await GET_DOCUMENT_BY_TUTOR_ID(id);
			setSavedResources(response?.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading((prev) => ({ ...prev, resourceLoading: false }));
		}
	};

	useEffect(() => {
		getTutorDetails();
		getDocumentsByTutorId();
	}, []);

	useEffect(() => {
		if (deletedResourceId) {
			const tempData = savedResources;
			const indexForDeleteResource = savedResources.findIndex(
				(item) => item?.id === deletedResourceId,
			);
			tempData?.splice(indexForDeleteResource, 1);
			setSavedResources(tempData);
			setDeletedResourceId(null);
		}
	}, [deletedResourceId]);

	const handleFileSelect = (file) => {
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);
		const fileData = {};
		reader.onload = (e) => {
			const arrayBuffer = e.target.result;
			const blobData = new Blob([arrayBuffer], { type: file.type });
			fileData.rawData = file;
			fileData.blobData = blobData;
			fileData.imgLink = arrayBuffer;
			handleUploadDocument(fileData);
		};
	};

	const handleUploadDocument = async (file) => {
		try {
			setLoading((prev) => ({ ...prev, fileUploading: true }));
			const contentType = file?.rawData?.type;
			const payload = {
				tutor_id: id,
				filename: file?.rawData?.name,
				content_type: contentType,
				created_by: tutorDetails?.created_by,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			};

			// Step 1: Request a signed URL
			const uploadResponse = await DOCUMENT_UPLOAD_REQUEST(payload);

			// Step 2: Upload the file to GCS using signed URL
			const uploadRes = await fetch(uploadResponse?.data?.signed_url, {
				method: "PUT",
				body: file?.blobData,
				headers: {
					"Content-Type": contentType,
				},
			});

			if (!uploadRes.ok) {
				const errorText = await uploadRes.text();
				throw new Error(
					`Upload failed: ${uploadRes.status} ${uploadRes.statusText}\n${errorText}`,
				);
			}

			// Step 3: Confirm the document upload
			const confirmPayload = {
				tutor_id: id,
				original_filename: file?.rawData?.name,
				gcs_path: uploadResponse?.data?.gcs_path,
				created_by: tutorDetails?.created_by,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			};
			const confirmResponse = await DOCUMENT_CONFIRM_UPLOAD(confirmPayload);

			setSavedResources((prev) => [confirmResponse?.data, ...prev]);

			// getDocumentsByTutorId();
			// setFile(null);
		} catch (e) {
			console.error("Upload failed:", e);
			toast.error(
				e?.message
					? e?.message
					: e
						? e
						: "Something Went Wrong While Upload Document.",
			);
		} finally {
			setLoading((prev) => ({ ...prev, fileUploading: false }));
		}
	};

	const handleTutorDelete = async () => {
		try {
			setLoading((prev) => ({ ...prev, deleteTutor: true }));
			const payload = {
				created_by: tutorDetails?.created_by,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			};
			const _response = await DELETE_TUTOR_BY_ID(id, payload);
			toast.success(`Tutor ${tutorDetails?.name} Deleted Successfully.`);
			navigate("/ai-tutor", { replace: true });
		} catch (e) {
			console.error(e?.message ? e?.message : e);
			toast.error(
				e?.message
					? e?.message
					: e
						? e
						: "Something Went Wrong While Delete Tutor.",
			);
		} finally {
			closeDeleteDialog();
			setLoading((prev) => ({ ...prev, deleteTutor: false }));
		}
	};

	return (
		<>
			<Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
				<DialogTitle>Delete Tutor</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete{" "}
						<strong>{tutorDetails?.name}</strong>? This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<UIButton
						onClick={closeDeleteDialog}
						disabled={isAnyActionLoading}
						text="Cancel"
					/>
					<UIButton
						onClick={handleTutorDelete}
						color="error"
						variant="contained"
						disabled={isAnyActionLoading}
						text="Delete"
					/>
				</DialogActions>
			</Dialog>
			<div className="card-bg-secondary h-100 overflow-auto p-2 px-3 d-flex flex-column gap-3">
				<div className="d-flex justify-content-between align-items-center">
					<div className="fs-5 d-flex align-items-center gap-1">
						Tutor |
						{loading?.tutorLoading ? (
							<Skeleton animation="wave" width={100} />
						) : (
							<div style={{ color: "#5840BA" }}>{tutorDetails?.name}</div>
						)}
					</div>
					<div className="d-flex gap-2 align-items-center">
						<div>
							<UIButton
								onClick={() => navigate("/ai-tutor")}
								disabled={isAnyActionLoading}
								text="Go Back"
							/>
						</div>
						{hasEditPermissions && (
							<div>
								<UIButton
									disabled={isAnyActionLoading}
									text="Delete"
									color="error"
									variant="contained"
									onClick={openDeleteDialog}
								/>
							</div>
						)}
					</div>
				</div>
				{loading?.fileUploading && (
					<div className="main-bg-color w-100 p-2 rounded-3 shadow shadow-sm">
						<div className="fs-5" style={{ color: "#5840BA" }}>
							Uploading Resource
						</div>
						<Box sx={{ width: "100%" }}>
							<LinearProgress />
						</Box>
					</div>
				)}
				<Grid
					container
					className="m-0 p-0 justify-content-between row-gap-3 h-100 w-100"
					spacing={2}
				>
					<Grid
						xs={12}
						md={7.95}
						className="main-bg-color d-flex flex-column gap-2 rounded-3 shadow shadow-sm p-2"
					>
						<div className="fs-5" style={{ color: "#5840BA" }}>
							Saved Resources
						</div>
						{loading?.resourceLoading ? (
							<div>
								<Skeleton animation="wave" width={"100%"} height={60} />
								<Skeleton animation="wave" width={"100%"} height={60} />
								<Skeleton animation="wave" width={"100%"} height={60} />
							</div>
						) : (
							<ResourceList
								savedResources={savedResources}
								setDeletedResourceId={setDeletedResourceId}
								tutorDetails={tutorDetails}
							/>
						)}
					</Grid>
					<Grid
						xs={12}
						md={3.95}
						className="main-bg-color p-2 rounded-3 shadow shadow-sm"
					>
						<CustomizedFileUploader
							disabled={isAnyActionLoading || !hasEditPermissions}
							handleChange={handleFileSelect}
						/>
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default ManageAITutor;
