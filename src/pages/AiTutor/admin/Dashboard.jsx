import { MoreVert } from "@mui/icons-material";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Menu,
	MenuItem,
} from "@mui/material";
import { DELETE_TUTOR_BY_ID, GET_ALL_TUTORS } from "adapters/ai_tutor.service";
import DataTable from "components/DashboardWidgets/gridRenderer";
import UIButton from "components/ReusableComponents/UIButton";
import CreateTutor from "components/chat/admin/CreateTutor";
import { hasEditPrivileges } from "helpers/common_helper";
import { useUserType } from "hooks/useUserType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TutorDashboard = () => {
	const [tutorData, setTutorData] = useState([]);
	const [loading, setLoading] = useState(false);
	const getAllTutor = async () => {
		try {
			setLoading(true);
			const response = await GET_ALL_TUTORS();
			if (response?.data?.length) {
				setTutorData(response?.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getAllTutor();
	}, []);

	const navigate = useNavigate();

	const columns = [
		{
			field: "name",
			headerName: "Name",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
		},
		{
			field: "documents_count",
			headerName: "Files",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
		},
		{
			field: "created_by_user",
			headerName: "Created By",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
		},
		{
			field: "actions",
			headerName: "Actions",
			sortable: false,
			disableColumnMenu: true,
			flex: 0.5,
			renderCell: (params) => <ActionMenu params={params} />,
		},
	];

	const ActionMenu = ({ params }) => {
		const [anchorEl, setAnchorEl] = useState(null);
		const [loading, setLoading] = useState(false); // Add loading state
		const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
		const openDeleteDialog = () => setDeleteDialogOpen(true);
		const closeDeleteDialog = () => setDeleteDialogOpen(false);
		const userID = useSelector((state) => state?.auth?.personData?.id);
		const userRole = useUserType();
		const open = Boolean(anchorEl);
		const hasEditPermissions = hasEditPrivileges(
			params?.row?.created_by,
			userRole,
			userID,
		);

		const handleClick = (event) => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};

		const handleEdit = () => {
			navigate(`/ai-tutor/${params.row.id}`);
		};

		const handleDelete = async () => {
			try {
				setLoading(true);
				const payload = {
					created_by: params?.row?.created_by,
					updated_by: userID,
					role: userRole?.toLowerCase(),
				};
				const _response = await DELETE_TUTOR_BY_ID(params?.row?.id, payload);
				toast.success(`Tutor ${params?.row?.name} Deleted Successfully.`);
				navigate("/ai-tutor", { replace: true });
				setTutorData((prev) =>
					prev?.filter((item) => item?.id !== params?.row?.id),
				);
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
				handleClose();
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
							<strong>{params?.row?.name}</strong>? This action cannot be
							undone.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<UIButton
							onClick={closeDeleteDialog}
							disabled={loading}
							text="Cancel"
						/>
						<UIButton
							onClick={handleDelete}
							color="error"
							variant="contained"
							disabled={loading}
							text="Delete"
						/>
					</DialogActions>
				</Dialog>
				<IconButton onClick={handleClick}>
					<MoreVert />
				</IconButton>
				<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
					<MenuItem onClick={handleEdit} disabled={loading}>
						{`View${hasEditPermissions ? "/Edit" : ""}`}
					</MenuItem>
					{hasEditPermissions && (
						<MenuItem onClick={openDeleteDialog} disabled={loading}>
							Delete
						</MenuItem>
					)}
				</Menu>
			</>
		);
	};

	return (
		<>
			<div className="p-2 d-flex flex-column card-bg-secondary h-100 overflow-hidden">
				<div className="d-flex justify-content-between align-items-center">
					<div className="fs-5 fw-medium">Tutors</div>
					<div>
						<CreateTutor disabled={loading} />
					</div>
				</div>

				<DataTable
					rows={tutorData}
					columns={columns}
					pageSizeOptions={10}
					rowCount={tutorData?.length}
					paginationMode="server"
					loading={loading}
					sx={{
						borderRadius: "24px",
						overflow: "hidden",
						"& .MuiDataGrid-container--top [role=row]": {
							background: "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)",
							color: "white",
						},
					}}
					onRowDoubleClick={(params) => navigate(`/ai-tutor/${params.row.id}`)}
				/>
			</div>
		</>
	);
};

export default TutorDashboard;
