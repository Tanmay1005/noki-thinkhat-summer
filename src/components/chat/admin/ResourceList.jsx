import UIButton from "components/ReusableComponents/UIButton";
import { hasEditPrivileges } from "helpers/common_helper";
import { useUserType } from "hooks/useUserType";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const { MoreVert } = require("@mui/icons-material");
const {
	IconButton,
	Menu,
	MenuItem,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} = require("@mui/material");
const {
	GENERATE_DOWNLOAD_URL,
	DELETE_DOCUMENT_BY_ID,
} = require("adapters/ai_tutor.service");
const dayjs = require("dayjs");
const { useState } = require("react");
const { FileIcon, defaultStyles } = require("react-file-icon");
// const { useParams } = require("react-router-dom");

function ResourceList({
	savedResources = [],
	setDeletedResourceId = () => {},
	tutorDetails = {},
}) {
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuItem, setMenuItem] = useState(null);
	const [isActionLoading, setActionLoading] = useState(false);
	const userID = useSelector((state) => state?.auth?.personData?.id);
	const userRole = useUserType();
	const hasEditPermissions = hasEditPrivileges(
		tutorDetails?.created_by,
		userRole,
		userID,
	);
	// const { id } = useParams();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const openDeleteDialog = () => setDeleteDialogOpen(true);
	const closeDeleteDialog = () => setDeleteDialogOpen(false);
	const handleMenuOpen = (event, item) => {
		setAnchorEl(event.currentTarget);
		setMenuItem(item);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setMenuItem(null);
	};

	const handleDownload = async () => {
		try {
			setActionLoading(true);
			const generateUrl = await GENERATE_DOWNLOAD_URL(menuItem?.gcs_path);
			window.open(generateUrl.data, "_blank", "noopener,noreferrer");
		} catch (e) {
			console.error("Download error", e);
			toast.error(
				e?.message || "Something Went Wrong While View/Download Document.",
			);
		} finally {
			setActionLoading(false);
			handleMenuClose();
		}
	};

	const handleDelete = async () => {
		try {
			setActionLoading(true);
			const payload = {
				created_by: tutorDetails?.created_by,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			};
			const response = await DELETE_DOCUMENT_BY_ID(menuItem.id, payload);
			setDeletedResourceId(response?.data?.id);
			toast.success(`${menuItem?.original_filename} Deleted Successfully`);
		} catch (e) {
			console.error("Delete error", e);
			toast.error(e?.message || "Something Went Wrong While Delete Document.");
		} finally {
			setActionLoading(false);
			closeDeleteDialog();
			handleMenuClose();
		}
	};

	return (
		<>
			<Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
				<DialogTitle>Delete Document</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete{" "}
						<strong>{menuItem?.original_filename}</strong>? This action cannot
						be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<UIButton
						onClick={closeDeleteDialog}
						disabled={isActionLoading}
						text="Cancel"
					/>
					<UIButton
						onClick={handleDelete}
						color="error"
						variant="contained"
						disabled={isActionLoading}
						text="Delete"
					/>
				</DialogActions>
			</Dialog>
			<div className="flex-grow-1 overflow-auto h-100">
				{savedResources?.length ? (
					savedResources.map((item) => (
						<div
							key={item?.original_filename}
							className="d-flex justify-content-between align-items-center p-2 mb-3 rounded-3"
							style={{ border: "1px solid #5d5fef" }}
						>
							<div className="d-flex align-items-center gap-2">
								<div style={{ height: "2rem", width: "2rem" }}>
									<FileIcon
										extension={item?.original_filename?.split(".").pop()}
										{...defaultStyles[
											item?.original_filename?.split(".").pop()
										]}
									/>
								</div>

								<div>
									<div className="fs-6">{item?.original_filename}</div>
									<div className="text-body-secondary">
										{dayjs(item?.updated_at)?.format("MM-DD-YYYY")}
									</div>
								</div>
							</div>

							<div className="d-flex align-items-center gap-2">
								<Chip
									label={item?.status || "PENDING"}
									size="small"
									sx={{
										backgroundColor:
											item?.status === "PROCESSED"
												? "#e3f2fd"
												: item?.status === "ERROR"
													? "#fdeded"
													: "#fff8e1",
										color:
											item?.status === "PROCESSED"
												? "#1976d2"
												: item?.status === "ERROR"
													? "#d32f2f"
													: "#f57c00",
										fontWeight: 500,
									}}
								/>
								<IconButton onClick={(e) => handleMenuOpen(e, item)}>
									<MoreVert />
								</IconButton>
							</div>
						</div>
					))
				) : (
					<div>No Resource Found.</div>
				)}

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
				>
					<MenuItem onClick={handleDownload} disabled={isActionLoading}>
						View / Download
					</MenuItem>
					{hasEditPermissions && (
						<MenuItem
							onClick={openDeleteDialog}
							disabled={
								isActionLoading ||
								menuItem?.status === "PENDING" ||
								menuItem?.status === "PROCESSING"
							}
						>
							Delete
						</MenuItem>
					)}
				</Menu>
			</div>
		</>
	);
}

// const downloadFile = async (path, _filename) => {
//     // const link = document.createElement("a");
//     // link.href = `https://storage.googleapis.com/${path}`; // or your signed URL logic
//     // link.download = filename;
//     // document.body.appendChild(link);
//     // link.click();
//     // document.body.removeChild(link);

//     const url =
//         `https://slicdemo.cloudh.enliv.com/slic/service/ehr/api/file/getSingleFileDownloadUrl/?fileName=${path}`;
//     window.open(url, '_blank', 'noopener,noreferrer');
// };

export default ResourceList;
