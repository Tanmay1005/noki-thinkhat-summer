import { AddCircle, MoreVert } from "@mui/icons-material";
import {
	Box,
	IconButton,
	InputBase,
	Menu,
	MenuItem,
	Tooltip,
	Typography,
	styled,
} from "@mui/material";
import SidePanel from "components/ReusableComponents/SidePanel";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { hasEditPrivileges } from "helpers/common_helper";
import { useUserType } from "hooks/useUserType";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	DELETE_USER_GROUP,
	GET_ALL_USER_GROUPS,
} from "../adapters/noki_ed.service";
import CommonProgress from "../components/ReusableComponents/Loaders.jsx";
import AddUsers from "./groupinfo/AddUsers";
import GroupForm from "./groupinfo/GroupForm";

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 2),
		paddingRight: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		[theme.breakpoints.up("sm")]: {
			width: "20ch",
			"&:focus": {
				width: "30ch",
			},
		},
	},
}));

const GroupManagement = () => {
	const [groupsList, setGroupsList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [groupToDelete, setGroupToDelete] = useState(null);
	const theme = useSelector((state) => state?.app?.theme);
	const [filter, setFilter] = useState("");
	const [updateGroupCount, setUpdateGroupCount] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [deleteDialog, setDeleteDialog] = useState(false);
	const [buttonloading, setButtonloading] = useState(false);
	const [editDialog, setEditDialog] = useState(false);
	const [groupToEdit, setGroupToEdit] = useState(null);
	const [formMode, setFormMode] = useState(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const userRole = useUserType();
	const userID = useSelector((state) => state?.auth?.personData?.id);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const getGroupList = async (showLoading = true, forceSelectFirst = false) => {
		try {
			if (showLoading) setLoading(true);
			const response = await GET_ALL_USER_GROUPS();
			const groups = response?.data?.user_groups;

			const updatedGroups = groups?.map((group) => {
				const createdByID = group.created_by;

				const isEditable = hasEditPrivileges(createdByID, userRole, userID);

				return {
					...group,
					isEditable,
				};
			});
			setGroupsList(updatedGroups);

			// Set first group as selected if no group is selected or when the new group is created
			if ((forceSelectFirst || !selectedGroup) && groups.length > 0) {
				setSelectedGroup(updatedGroups[0]);
			}
		} catch (e) {
			console.error(e);
		} finally {
			if (showLoading) setLoading(false);
		}
	};

	useEffect(() => {
		getGroupList(true);
	}, []);

	useEffect(() => {
		if (updateGroupCount !== undefined) {
			getGroupList(false);
		}
	}, [updateGroupCount]);

	const handleClickGroup = (group) => {
		setSelectedGroup(group);
		setMobileOpen(false);
	};

	const handleOpenModal = () => {
		setFormMode("add");
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditDialog(false);
	};

	// Handle successful group creation
	const handleGroupCreated = async () => {
		await getGroupList(true, true);
		handleCloseModal();
		setMobileOpen(false);
	};

	const handleFilter = useCallback((event) => {
		setFilter(event.target.value);
	}, []);

	// Filter groups based on search input
	const filteredGroups = useMemo(() => {
		return filter
			? groupsList.filter((group) =>
					group.name.toLowerCase().includes(filter.toLowerCase()),
				)
			: groupsList;
	}, [filter, groupsList]);

	const handleOpenDelete = (group) => {
		setGroupToDelete(group);
		setDeleteDialog(true);
	};
	const handleCloseDelete = () => {
		setDeleteDialog(false);
	};
	const handleDelete = async () => {
		if (!groupToDelete?.id) {
			handleCloseDelete();
			return;
		}
		try {
			setButtonloading(true);
			const payload = {
				created_by: groupToDelete?.created_by,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			};
			const response = await DELETE_USER_GROUP(groupToDelete.id, payload);
			if (response?.data?.id) {
				toast.success("Group deleted successfully");
				await getGroupList(true, true);
			}
		} catch (error) {
			toast.error(error?.message || "Failed to delete group");
		} finally {
			setButtonloading(false);
			setGroupToDelete(null);
			setDeleteDialog(false);
		}
	};

	const handleOpenEdit = (group) => {
		setGroupToEdit(group);
		setFormMode("edit");
		setEditDialog(true);
	};

	const ActionMenu = ({ group, onDelete, onEdit }) => {
		const [anchorEl, setAnchorEl] = useState(null);

		const handleClick = (event) => setAnchorEl(event.currentTarget);
		const handleClose = () => setAnchorEl(null);

		const handleDelete = () => {
			handleClose();
			onDelete(group);
		};

		const handleEdit = () => {
			handleClose();
			onEdit(group);
		};

		return (
			<>
				<Tooltip
					title={
						!group?.isEditable &&
						"You cannot edit this group: It's created by another user"
					}
				>
					<IconButton
						onClick={group.isEditable ? handleClick : () => {}}
						sx={{ color: !group?.isEditable && "#D3D3D3" }}
					>
						<MoreVert />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleClose}
				>
					<MenuItem onClick={handleEdit}>Edit</MenuItem>
					<MenuItem onClick={handleDelete}>Delete</MenuItem>
				</Menu>
			</>
		);
	};

	const SidebarContent = useMemo(() => {
		return (
			<SidePanel.Container>
				{/* Header Section */}
				<SidePanel.Header title="Student Groups">
					<div className="d-flex align-items-center">
						<Box
							component="span"
							sx={{
								marginLeft: "12px",
								fontSize: "16px",
								fontWeight: 600,
								padding: "6px",
								backgroundColor: "#EDF2F7",
								borderRadius: "24px",
							}}
						>
							{groupsList.length}
						</Box>
						<Tooltip title="Add Group">
							<IconButton onClick={handleOpenModal}>
								<AddCircle sx={{ fontSize: 30, color: "#5840BA" }} />
							</IconButton>
						</Tooltip>
					</div>
					<GroupForm
						handleOpen={showModal || editDialog}
						handleClose={handleCloseModal}
						onGroupCreated={handleGroupCreated}
						currentGroups={groupsList.map((group) =>
							group?.name?.toLowerCase(),
						)}
						group={groupToEdit}
						mode={formMode}
					/>
				</SidePanel.Header>

				{/* Search Bar */}
				<SidePanel.SearchBar>
					<StyledInputBase
						placeholder="Search for Student Group"
						inputProps={{ "aria-label": "search" }}
						value={filter}
						onChange={handleFilter}
					/>
				</SidePanel.SearchBar>

				{/* Scrollable Group List */}
				<SidePanel.Body>
					{loading ? (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<CommonProgress />
						</Box>
					) : (
						<Box
							component="ul"
							sx={{
								listStyle: "none",
								padding: 0,
								margin: 0,
							}}
						>
							{filteredGroups?.length ? (
								filteredGroups.map((group) => (
									<div
										key={`div-${group.id}`}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Box
											component="li"
											key={group.id}
											onClick={() => handleClickGroup(group)}
											sx={{
												width: "100%",
												padding: "12px",
												maxHeight: "6rem",
												background:
													selectedGroup?.id === group.id
														? "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)"
														: theme === "dark"
															? "#333"
															: "#fff",
												color: selectedGroup?.id === group.id ? "#fff" : "#333",
												cursor: "pointer",
												borderRadius: "12px",
												marginBottom: "12px",
												// transition: "background-color 0.3s",
												"&:hover": {
													background:
														selectedGroup?.id === group.id
															? "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)"
															: theme === "dark"
																? "#444"
																: "linear-gradient(90deg, #6E40C125 0%, #8741CA65 100%)",
												},
											}}
										>
											<Typography
												sx={{
													fontSize: "14px",
													textAlign: "left",
												}}
											>
												{group.name}
											</Typography>
											<Typography
												sx={{
													color:
														selectedGroup?.id === group.id
															? "#d5d5d5"
															: "#5E5E5E",
													fontSize: "12px",
													textAlign: "left",
												}}
											>
												{group.user_group_assignments_aggregate.aggregate.count}
												{" members"}
											</Typography>
										</Box>
										<ActionMenu
											group={group}
											onDelete={handleOpenDelete}
											onEdit={handleOpenEdit}
										/>
									</div>
								))
							) : (
								<Typography className="mx-3">No Result Found</Typography>
							)}
						</Box>
					)}
				</SidePanel.Body>
			</SidePanel.Container>
		);
	}, [
		groupsList,
		showModal,
		editDialog,
		handleCloseModal,
		handleGroupCreated,
		groupToEdit,
		formMode,
		filter,
		handleFilter,
		filteredGroups,
		selectedGroup,
		handleClickGroup,
		handleOpenDelete,
		handleOpenEdit,
		loading,
		theme,
	]);

	return (
		<SidePanel>
			<SidePanel.Mobile
				open={mobileOpen}
				handleDrawerToggle={handleDrawerToggle}
			>
				{SidebarContent}
			</SidePanel.Mobile>
			{/* Desktop Sidebar */}
			<SidePanel.DeskTop>{SidebarContent}</SidePanel.DeskTop>
			{/* Main Content */}
			<SidePanel.Content>
				{selectedGroup && (
					<AddUsers group={selectedGroup} onUpdateGroup={setUpdateGroupCount} />
				)}
			</SidePanel.Content>
			<UIModal open={deleteDialog} handleClose={handleCloseDelete}>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<p style={{ fontWeight: "bold" }}>
								Are you sure you want to delete this group?
							</p>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="cancel"
							onClick={handleCloseDelete}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={buttonloading ? <CommonProgress /> : "Delete"}
							variant="contained"
							color="error"
							size="small"
							disable={buttonloading}
							onClick={handleDelete}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
		</SidePanel>
	);
};

export default GroupManagement;
