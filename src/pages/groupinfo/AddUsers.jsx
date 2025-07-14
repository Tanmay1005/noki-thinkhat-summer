import { MoreVert } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import {
	Box,
	Checkbox,
	FormControlLabel,
	IconButton,
	InputBase,
	Menu,
	MenuItem,
	Tooltip,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import {
	CREATE_USER_GROUP_ASSIGNMENTS_BULK,
	DELETE_USER_GROUP_ASSIGNMENTS_BULK,
	GET_USERS,
	GET_USERS_LIST,
} from "adapters/noki_ed.service";
import DataTable from "components/DashboardWidgets/gridRenderer";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import useDebounce from "hooks/useDebounce";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Styled components remain the same...
const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	right: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 2),
		paddingRight: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		[theme.breakpoints.up("sm")]: {
			width: "100%",
			"&:focus": {
				width: "30ch",
			},
		},
	},
}));

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	border: "1px solid #808C9E66",
	borderRadius: "10px",
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: "0 !important", // Override with !important
		width: "auto",
	},
	display: "flex",
}));

// Memoized ActionMenu component
const ActionMenu = memo(({ params, onDelete, selectedGroup }) => {
	const [anchorEl, setAnchorEl] = useState(null);

	const handleClick = (event) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleDelete = () => {
		handleClose();
		onDelete([params?.row?.id], params.groupId);
	};

	return (
		<>
			<Tooltip
				title={
					!selectedGroup?.isEditable &&
					"You cannot edit this group: It's created by another user"
				}
			>
				<IconButton
					onClick={selectedGroup.isEditable ? handleClick : () => {}}
					sx={{ color: !selectedGroup?.isEditable && "#D3D3D3" }}
				>
					<MoreVert />
				</IconButton>
			</Tooltip>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				<MenuItem onClick={handleDelete}>Remove</MenuItem>
			</Menu>
		</>
	);
});

// Memoized SearchBar component
const SearchBar = memo(({ value, onChange }) => (
	<Search>
		<StyledInputBase
			placeholder="Search for Students"
			inputProps={{ "aria-label": "search" }}
			value={value}
			onChange={onChange}
		/>
		<SearchIconWrapper>
			<SearchIcon />
		</SearchIconWrapper>
	</Search>
));

// Memoized CustomHeader component
const CustomHeader = memo(
	({
		groupName,
		isEditable,
		userCount,
		filter,
		onFilterChange,
		onAddClick,
		onDeleteSelected,
		showDeleteButton,
	}) => (
		<Box
			sx={{
				display: "flex",
				flexDirection: { xs: "column", md: "column", lg: "row" },
				justifyContent: "space-between",
				alignItems: { xs: "stretch", md: "flex-start" },
				mb: 3,
				gap: 2,
			}}
		>
			<Typography variant="h4">
				{groupName} ({userCount})
			</Typography>

			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					alignItems: { xs: "stretch", sm: "flex-start" },
					justifyContent: "center",
					gap: 2,
					flexWrap: "wrap",
				}}
			>
				<SearchBar
					value={filter}
					onChange={(event) => onFilterChange(event.target.value)}
				/>
				<Box
					sx={{
						display: "flex",
						gap: 2,
						flexDirection: { xs: "column", sm: "row" },
					}}
				>
					<UIButton
						text="Add Students"
						variant="contained"
						className="rounded rounded-3"
						size="medium"
						disabled={!isEditable}
						onClick={onAddClick}
						sx={{
							whiteSpace: "nowrap",
							backgroundColor: "#8d65b4",
							width: { xs: "100%", sm: "auto" },
						}}
					/>
					{showDeleteButton && (
						<UIButton
							text="Remove"
							variant="contained"
							className="rounded rounded-3"
							size="medium"
							onClick={onDeleteSelected}
							sx={{
								whiteSpace: "nowrap",
								backgroundColor: "#ce3a1b",
								"&:hover": {
									backgroundColor: "red",
								},
								width: { xs: "100%", sm: "auto" },
							}}
						/>
					)}
				</Box>
			</Box>
		</Box>
	),
);

// Memoized ModalContent component
const ModalContent = memo(
	({
		loading,
		users,
		control,
		onSubmit,
		checkedUsers,
		setCheckedUsers,
		setValue,
	}) => {
		if (loading) {
			return (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "400px",
					}}
				>
					<CommonProgress />
				</Box>
			);
		}
		if (!users?.length) {
			return (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "400px",
					}}
				>
					No Students to add
				</Box>
			);
		}

		const handleCheckboxChange = (event) => {
			const userId = event.target.value;
			const updatedValues = event.target.checked
				? [...checkedUsers, userId]
				: checkedUsers.filter((id) => id !== userId);
			setCheckedUsers(updatedValues);
			return updatedValues;
		};

		const handleSelectAllChange = (event) => {
			if (event.target.checked) {
				const allUserIds = users.map((user) => user.id.toString());
				const updatedValues = Array.from(
					new Set([...checkedUsers, ...allUserIds]),
				);
				setCheckedUsers(updatedValues);
				setValue("selectedUsers", updatedValues);
				return updatedValues;
			}
			const remainingValues = checkedUsers.filter(
				(id) => !users.some((user) => user.id.toString() === id),
			);
			setCheckedUsers(remainingValues);
			setValue("selectedUsers", remainingValues);
			return remainingValues;
		};

		return (
			<Box
				sx={{
					flexGrow: 1,
					overflowY: "auto",
					maxHeight: "550px",
				}}
			>
				<form onSubmit={onSubmit}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							px: 2,
							py: 0.5,
							borderRadius: "12px",
							backgroundColor: "#F9F9F9",
							mb: 2,
						}}
					>
						<FormControlLabel
							control={
								<Checkbox
									checked={
										users.length > 0 &&
										users.every((user) =>
											checkedUsers.includes(user.id.toString()),
										)
									}
									onChange={handleSelectAllChange}
								/>
							}
							label="Select All"
							sx={{ flexGrow: 1 }}
						/>
					</Box>
					{users.map((user) => (
						<Box
							key={user.id}
							sx={{
								display: "flex",
								alignItems: "center",
								px: 2,
								py: 0.5,
								borderRadius: "12px",
								backgroundColor: "#F9F9F9",
								mb: 2,
							}}
						>
							<Controller
								name="selectedUsers"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												{...field}
												value={user.id.toString()}
												checked={checkedUsers?.includes(user.id.toString())}
												onChange={(event) => {
													const value = handleCheckboxChange(event);
													field.onChange(value);
												}}
											/>
										}
										label={
											<Box>
												<Typography variant="body1">{user.name}</Typography>
												<Typography variant="body2" color="textSecondary">
													{user.email}
												</Typography>
											</Box>
										}
										sx={{ flexGrow: 1 }}
									/>
								)}
							/>
						</Box>
					))}
				</form>
			</Box>
		);
	},
);

const AddUsers = ({ group, onUpdateGroup }) => {
	const [tableLoading, setTableLoading] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [groupUsers, setGroupUsers] = useState([]);
	const [updateCount, setUpdateCount] = useState(
		group.user_group_assignments_aggregate.aggregate.count,
	);
	const [openDialog, setOpenDialog] = useState(false);
	const [allUsers, setAllUsers] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const { control, setValue, handleSubmit, reset } = useForm({
		selectedUsers: [],
	});
	const [filter, setFilter] = useState("");
	const [page, setPage] = useState(0);
	const [pageSize] = useState(10);
	const debouncedFilter = useDebounce(filter, 500);
	const [rowCount, setRowCount] = useState(0);
	const [cache, setCache] = useState({});
	const [modalFilter, setModalFilter] = useState("");
	const [checkedUsers, setCheckedUsers] = useState([]);

	// Reset states when group changes
	useEffect(() => {
		setPage(0);
		setFilter("");
		setSelectedRows([]);
		setGroupUsers([]);
		setCache({}); // Clear cache on group change
		setUpdateCount(group?.user_group_assignments_aggregate?.aggregate?.count);
	}, [group?.id]);

	const getUsersList = useCallback(
		async (force = false) => {
			if (!group?.id) return;

			try {
				// Check cache first
				if (
					!force &&
					cache[page] &&
					cache.groupId === group.id &&
					cache.filter === debouncedFilter
				) {
					setGroupUsers(cache[page]);
					return;
				}

				setTableLoading(true);
				const response = await GET_USERS({
					...(debouncedFilter && { filter: debouncedFilter }),
					page,
					pageSize,
					groupId: group.id,
				});

				setCache((prev) => ({
					...prev,
					[page]: response.data.data,
					groupId: group.id,
					filter: debouncedFilter,
				}));

				setGroupUsers(response.data.data);
				setRowCount(response.data.total);
			} catch (error) {
				console.error("Error fetching users:", error);
				toast.error("Failed to fetch Students");
			} finally {
				setTableLoading(false);
			}
		},
		[debouncedFilter, page, pageSize, group?.id, cache],
	);

	useEffect(() => {
		getUsersList();
	}, [getUsersList]);

	const fetchAllUsers = useCallback(async () => {
		if (!group?.id || !openDialog) return;

		try {
			setModalLoading(true);
			const response = await GET_USERS_LIST();
			const studentUsers = response?.data?.users?.filter(
				(user) =>
					user.role === "student" &&
					user.user_group_assignments.every(
						(assignment) => assignment.group_id !== group.id,
					),
			);
			setAllUsers(studentUsers);
		} catch (error) {
			console.error("Error fetching all students:", error);
			toast.error("Failed to fetch all students");
		} finally {
			setModalLoading(false);
		}
	}, [group?.id, openDialog]);

	useEffect(() => {
		if (openDialog) {
			fetchAllUsers();
		}
	}, [openDialog, fetchAllUsers]);

	const handleOpenDialog = useCallback(() => {
		setOpenDialog(true);
		setFilter("");
		setAllUsers([]);
		setCheckedUsers([]);
	}, []);

	const handleCloseDialog = useCallback(() => {
		reset();
		setOpenDialog(false);
		setAllUsers([]);
		setModalFilter("");
		setCheckedUsers([]);
	}, [reset]);

	const handlePageChange = useCallback((newPage) => {
		setPage(newPage.page);
	}, []);

	const deleteUserGroupAssignments = async (user_ids, group_id) => {
		if (!user_ids.length) return;

		try {
			setTableLoading(true);
			const response = await DELETE_USER_GROUP_ASSIGNMENTS_BULK({
				user_ids,
				group_id,
			});
			if (response.status === 200) {
				setUpdateCount((prev) => prev - user_ids.length);
				onUpdateGroup((prev) => prev - user_ids.length);
				if (user_ids.length > 1) {
					toast.success("Students removed from the group successfully!");
				} else {
					toast.success("Student removed from the group successfully!");
				}
				setSelectedRows([]);
				setCache({}); // Clear cache after deletion
				await getUsersList(true); // Force refresh
			} else {
				throw new Error("Failed to remove students");
			}
		} catch (error) {
			console.error("Error deleting students group assignments:", error);
			toast.error("Failed to remove students from the group.");
		} finally {
			setTableLoading(false);
		}
	};

	const handleDeleteSelected = () => {
		deleteUserGroupAssignments(selectedRows, group.id);
	};

	const handleFilterChange = useCallback((newValue) => {
		setFilter(newValue);
		setPage(0);
	}, []);

	const onSubmit = async (data) => {
		if (!data.selectedUsers?.length) {
			toast.warning("Please select at least one student");
			return;
		}

		setTableLoading(true);
		const selected = allUsers.filter((user) =>
			data.selectedUsers.includes(user.id.toString()),
		);

		const payload = {
			objects: selected.map((user) => ({
				user_id: user.id,
				group_id: group.id,
			})),
		};

		try {
			const response = await CREATE_USER_GROUP_ASSIGNMENTS_BULK(payload);
			handleCloseDialog();
			if (response) {
				setUpdateCount((prev) => prev + payload.objects.length);
				onUpdateGroup((prev) => prev + payload.objects.length);
				toast.success("Students added to the group successfully!");
				setCache({}); // Clear cache after adding users
				await getUsersList(true); // Force refresh
			}
		} catch (error) {
			console.error("Error adding users to group:", error);
			toast.error("Failed to add students to the group.");
		} finally {
			setTableLoading(false);
		}
	};

	const filteredModalUsers = useMemo(() => {
		return modalFilter
			? allUsers.filter(
					(user) =>
						user.name.toLowerCase().includes(modalFilter.toLowerCase()) ||
						user.email.toLowerCase().includes(modalFilter.toLowerCase()),
				)
			: allUsers;
	}, [modalFilter, allUsers]);

	const columns = [
		{
			field: "name",
			headerName: "Name",
			flex: 1,
			sortable: true,
			disableColumnMenu: true,
			width: 150,
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			width: 200,
		},
		{
			field: "actions",
			headerName: "Actions",
			flex: 0.5,
			sortable: false,
			disableColumnMenu: true,
			width: 100,
			renderCell: (params) => (
				<ActionMenu
					params={{ ...params, groupId: group.id }}
					onDelete={deleteUserGroupAssignments}
					selectedGroup={group}
				/>
			),
		},
	];

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<CustomHeader
				groupName={group.name}
				isEditable={group?.isEditable}
				userCount={updateCount}
				filter={filter}
				onFilterChange={handleFilterChange}
				onAddClick={handleOpenDialog}
				onDeleteSelected={handleDeleteSelected}
				showDeleteButton={selectedRows.length > 0}
			/>

			<Box sx={{ flexGrow: 1 }}>
				<DataTable
					rows={groupUsers}
					columns={columns}
					rowCount={rowCount}
					page={page}
					pageSize={pageSize}
					autoHeight
					checkboxSelection={group?.isEditable}
					disableRowSelectionOnClick
					loading={tableLoading}
					onRowSelectionModelChange={setSelectedRows}
					paginationMode="server"
					onPaginationModelChange={handlePageChange}
					rowSelectionModel={selectedRows}
					getRowId={(row) => row.id}
					sx={{
						borderRadius: "24px",
						overflow: "hidden",
						"& .MuiDataGrid-container--top [role=row]": {
							background: "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)",
							color: "white",
							"& .MuiDataGrid-root": {
								overflowX: "auto",
							},
						},
					}}
				/>
			</Box>

			<UIModal open={openDialog} handleClose={handleCloseDialog} width={600}>
				<Box
					sx={{
						bgcolor: "background.paper",
						width: "100%",
						boxSizing: "border-box",
						display: "flex",
						flexDirection: "column",
						height: "70vh",
					}}
				>
					<Typography
						variant="h5"
						gutterBottom
						sx={{
							py: 1,
							mt: -3,
							textAlign: "center",
						}}
					>
						Select Students
					</Typography>
					<Search sx={{ border: "none" }}>
						<StyledInputBase
							placeholder="Search for Student"
							inputProps={{ "aria-label": "search" }}
							value={modalFilter}
							onChange={(e) => setModalFilter(e.target.value)}
							sx={{
								borderBottom: "1px solid #808C9E66",
								"& .MuiInputBase-input": {
									width: "100%",
									"&:focus": {
										width: "100%",
									},
								},
							}}
						/>
						<SearchIconWrapper>
							<SearchIcon />
						</SearchIconWrapper>
					</Search>
					<ModalContent
						loading={modalLoading}
						users={filteredModalUsers}
						control={control}
						onSubmit={handleSubmit(onSubmit)}
						checkedUsers={checkedUsers}
						setCheckedUsers={setCheckedUsers}
						setValue={setValue}
					/>

					<Box
						sx={{
							textAlign: "center",
							borderTop: "1px solid #808C9E66",
						}}
					>
						<div className="flex-grow-1 d-flex gap-3 mt-3">
							<UIButton
								text="Cancel"
								size="large"
								className="flex-grow-1 rounded rounded-pill p-2"
								onClick={handleCloseDialog}
								disabled={modalLoading}
								sx={{ width: "50px" }}
							/>
							<UIButton
								text={!modalLoading && "Add Students"}
								variant="contained"
								size="large"
								className="flex-grow-1 rounded rounded-pill p-2"
								onClick={handleSubmit(onSubmit)}
								disabled={modalLoading || allUsers.length < 1}
								sx={{
									backgroundColor: "#5840BA",
									width: "50px",
								}}
							/>
						</div>
					</Box>
				</Box>
			</UIModal>
		</Box>
	);
};

export default AddUsers;
