import { MoreVert, Tune } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";

import {
	Box,
	IconButton,
	InputBase,
	Menu,
	MenuItem,
	Tooltip,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import { Switch } from "@mui/material";
import AllScoresTabs from "components/AllScores/AllScoresTabs";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import Filter from "components/ReusableComponents/Filter";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import UIButton from "components/ReusableComponents/UIButton";
import useDebounce from "hooks/useDebounce";
import GroupManagement from "pages/GroupManagement";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	ACTIVATE_USER,
	DEACTIVATE_USER,
	GET_USERS,
} from "../../adapters/noki_ed.service";
import DataTable from "../../components/DashboardWidgets/gridRenderer";
import AddStudentJSX from "./AddStudent";
import EditStudentJSX from "./EditStudent";

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
		marginLeft: theme.spacing(1),
		width: "auto",
	},
	display: "flex",
}));

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
			width: "20ch",
			"&:focus": {
				width: "30ch",
			},
		},
	},
}));
const CustomHeader = ({
	filter,
	handleFilter,
	handleRender,
	showInactive,
	setShowInactive,
}) => {
	const [editMode, setEditMode] = useState(false);

	const handleOpen = () => {
		setEditMode(true);
	};

	const handleClose = () => {
		setEditMode(false);
	};
	return (
		<div className="d-flex justify-content-end align-items-end">
			<div className="d-flex justify-content-end align-items-center gap-3">
				<Search>
					<StyledInputBase
						placeholder="Search for user"
						inputProps={{ "aria-label": "search" }}
						value={filter}
						onChange={handleFilter}
					/>
					<SearchIconWrapper>
						<SearchIcon />
					</SearchIconWrapper>
				</Search>
				<Box display="flex" alignItems="center">
					<Typography
						variant="body1"
						sx={{
							fontWeight: "bold",
							marginRight: 1,
						}}
					>
						{showInactive ? "Inactive" : "Active"}
					</Typography>
					<Switch
						orientation="vertical"
						size="small"
						label="Toggle Me"
						color="secondary"
						checked={showInactive}
						onChange={setShowInactive}
					/>
				</Box>
				<UIButton
					text="Add User"
					variant="contained"
					className="rounded rounded-3"
					size="medium"
					onClick={handleOpen}
					sx={{ whiteSpace: "nowrap", backgroundColor: "#8d65b4" }}
				/>
				<CreateWrapper open={editMode}>
					<AddStudentJSX
						handleClose={handleClose}
						handleRender={handleRender}
					/>
				</CreateWrapper>
			</div>
		</div>
	);
};

// Create new UserManagementContent component
const UserManagementContent = ({ globalFilter }) => {
	// Move all state and handlers here from UserManagement component
	const [usersList, setUsersList] = useState([]);
	const [cache, setCache] = useState({});
	const [page, setPage] = useState(0);
	const [pageSize] = useState(10);
	const [sortField, setSortField] = useState([]);
	const [rowCount, setRowCount] = useState(0);
	const [filter, setFilter] = useState("");
	const [renderer, setRenderer] = useState(0);
	const [loading, setLoading] = useState(false);
	const [editUser, setEditUser] = useState(false);
	const [userDetails, setUserDetails] = useState("");
	const _theme = useSelector((state) => state?.app?.theme);
	const [showInactive, setShowInactive] = useState(false);
	const debouncedFilter = useDebounce(filter, 500);
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});
	const [openScores, setOpenScores] = useState(false);
	const [selectedPractitionerId, setSelectedPractitionerId] = useState(null);
	const handleRender = () => {
		setRenderer((prev) => prev + 1);
	};
	useEffect(() => {
		getUserList();
	}, [paginationModel.page, sortField]);

	useEffect(() => {
		getUserList(true, true);
	}, [globalFilter, showInactive, debouncedFilter]);

	useEffect(() => {
		if (renderer) {
			getUserList(true);
		}
	}, [renderer]);
	const handleFilter = (event) => {
		setFilter(event.target.value);
		setCache({});
		setPage(0);
	};
	const handlePageChange = (newModel) => {
		setPaginationModel(newModel);
		setPage(newModel.page);
	};
	const getRowId = (row) => row?.id;
	const handleClickOpenScores = (practitionerId) => {
		setSelectedPractitionerId(practitionerId);
		setOpenScores(true);
	};
	const getUserList = async (force = false, clearCache = false) => {
		try {
			setLoading(true);
			if (!force && cache[page] && cache.status === showInactive) {
				setUsersList(cache[page]);
				return;
			}
			const targetPage = clearCache ? 0 : page;
			const response = await GET_USERS({
				...(filter && { filter }),
				...sortField?.[0],
				...(globalFilter?.length > 0 && { role: globalFilter }),
				page: targetPage,
				pageSize,
				status: showInactive ? "Inactive" : "Active",
			});
			if (clearCache) {
				setCache({
					0: response?.data?.data,
					status: showInactive,
				});
				setPaginationModel((prev) => ({ ...prev, page: 0 }));
				setPage(0);
			} else {
				setCache((prev) => ({
					...prev,
					[page]: response?.data?.data,
					status: showInactive,
				}));
			}
			setUsersList(response?.data?.data);
			setRowCount(response?.data?.total);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};
	const onSortModelChange = (field) => {
		setSortField(field);
		setCache({});
		setPaginationModel((prev) => ({ ...prev, page: 0 }));
		setPage(0);
	};

	const columns = [
		{
			field: "name",
			headerName: "Name",
			sortable: true,
			disableColumnMenu: true,
			flex: 1,
		},
		{
			field: "email",
			headerName: "Email",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
		},
		{
			field: "role",
			headerName: "Role",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			renderCell: (params) => {
				if (params.value === "examiner") return "Teaching Staff";
				return params.value.charAt(0).toUpperCase() + params.value?.slice(1);
			},
		},
		{
			field: "updated_at",
			headerName: "Last Updated",
			sortable: true,
			disableColumnMenu: true,
			flex: 1,
			renderCell: (params) => {
				const date = new Date(params.value);
				return date.toLocaleString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				});
			},
		},
		{
			field: "actions",
			headerName: "Actions",
			sortable: false,
			disableColumnMenu: true,
			flex: 0.5,
			renderCell: (params) => (
				<ActionMenu
					params={params}
					handleClickOpenScores={handleClickOpenScores}
				/>
			),
		},
	];

	const ActionMenu = ({ params, handleClickOpenScores }) => {
		const [anchorEl, setAnchorEl] = useState(null);
		const [loading, setLoading] = useState(false); // Add loading state

		const open = Boolean(anchorEl);

		const handleClick = (event) => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};

		const handleEdit = () => {
			setFilter("");
			handleRender();
			setUserDetails(params.row);
			setEditUser(true);
		};

		const handleDeactivate = async () => {
			if (params?.row?.role === "admin") {
				return;
			}
			setLoading(true);
			const res = await DEACTIVATE_USER(params?.row?.id);
			if (res?.status === 200) {
				toast.success("User Deactivated Successfully");
				handleRender();
			}
			setLoading(false);
			handleClose();
		};
		const handleActivate = async () => {
			if (params?.row?.role === "admin") {
				return;
			}
			setLoading(true);
			const res = await ACTIVATE_USER(params?.row?.id);
			if (res?.status === 200) {
				toast.success("User Activated Successfully");
				handleRender();
			}
			setLoading(false);
			handleClose();
		};

		return (
			<>
				<IconButton onClick={handleClick}>
					<MoreVert />
				</IconButton>
				<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
					{params?.row?.status === "Active" && (
						<MenuItem onClick={handleEdit} disabled={loading}>
							Edit
						</MenuItem>
					)}

					<Tooltip
						title={
							params?.row?.role === "admin" &&
							"Admin cannot be deactivated, Please change the role to perform this action"
						}
					>
						<span>
							<MenuItem
								onClick={
									params?.row?.status === "Active"
										? handleDeactivate
										: handleActivate
								}
								disabled={loading || params?.row?.role === "admin"}
							>
								{loading
									? params?.row?.status === "Active"
										? "Deactivating..."
										: "Activating..."
									: params?.row?.status === "Active"
										? "Deactivate"
										: "Activate"}
							</MenuItem>
						</span>
					</Tooltip>
					{params?.row?.role === "student" &&
						params?.row?.status === "Active" && (
							<MenuItem
								onClick={() => {
									handleClickOpenScores(params?.row?.fhir_practitioner_id);
									handleClose();
								}}
							>
								Report Card
							</MenuItem>
						)}
				</Menu>
			</>
		);
	};

	return (
		<>
			<CustomHeader
				filter={filter}
				handleRender={handleRender}
				handleFilter={handleFilter}
				showInactive={showInactive}
				setShowInactive={(e) => setShowInactive(e.target.checked)}
			/>
			<DataTable
				rows={usersList}
				pageSizeOptions={pageSize}
				paginationModel={paginationModel}
				columns={columns}
				rowCount={rowCount}
				paginationMode="server"
				onPaginationModelChange={handlePageChange}
				loading={loading}
				sortModel={sortField}
				onSortModelChange={onSortModelChange}
				page={page}
				sx={{
					borderRadius: "24px",
					overflow: "hidden",
					"& .MuiDataGrid-container--top [role=row]": {
						background: "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)",
						color: "white",
					},
				}}
				getRowId={getRowId}
			/>
			<CreateWrapper open={editUser}>
				<EditStudentJSX
					handleClose={() => setEditUser(false)}
					handleRender={handleRender}
					details={userDetails}
				/>
			</CreateWrapper>
			<CreateWrapper open={openScores} handleClose={() => setOpenScores(false)}>
				<AllScoresTabs
					practitionerId={selectedPractitionerId}
					setOpenScores={setOpenScores}
				/>
			</CreateWrapper>
		</>
	);
};

const UserManagement = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const queryParams = new URLSearchParams(location.search);
	const initialTab = Number.parseInt(queryParams.get("group-tab")) || 0;

	const [value, setValue] = useState(initialTab);
	const [filter, setFilter] = useState([]);

	useEffect(() => {
		const tab = Number.parseInt(
			new URLSearchParams(location.search).get("group-tab"),
		);
		if (!Number.isNaN(tab) && tab !== value) {
			setValue(tab);
		}
	}, [location.search]);

	const handleTabChange = (_event, newValue) => {
		setValue(newValue);
		navigate(`?group-tab=${newValue}`, { replace: true });
	};

	return (
		<div
			className="position-relative"
			style={{ height: "100%", display: "flex", flexDirection: "column" }}
		>
			<div
				className="position-sticky top-0 bg-white d-flex
align-items-center justify-content-between"
				style={{ zIndex: 1000, paddingRight: "0.5rem" }}
			>
				<UITabs
					scrollButtons={false}
					tabList={["Users", "Groups"]}
					handleTabChange={handleTabChange}
					value={value}
					sx={{
						width: "max-content",
						marginLeft: "30px",
					}}
				/>
				{value === 0 && (
					<Filter
						list={[
							{ value: "admin", label: "Admin" },
							{ value: "student", label: "Student" },
							{ value: "examiner", label: "Teaching Staff" },
						]}
						handleFilter={(item) => {
							setFilter(item);
						}}
						buttonComponent={<UIButton text="Filters" endIcon={<Tune />} />}
						selectedItem={filter}
						isMultiSelect={true}
						clearSelection={() => setFilter([])}
					/>
				)}
			</div>

			<div className="overflow-auto h-100 flex-grow-1">
				<TabPanel
					className="rounded-bottom-4 px-2"
					value={value}
					index={0}
					key="key-0"
					style={{ height: "100%" }}
				>
					<UserManagementContent globalFilter={filter} />
				</TabPanel>
				<TabPanel
					className="rounded-bottom-4 px-2 h-100"
					value={value}
					index={1}
					key="key-1"
				>
					<GroupManagement />
				</TabPanel>
			</div>
		</div>
	);
};

export default UserManagement;
