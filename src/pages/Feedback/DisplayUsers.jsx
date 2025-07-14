import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import SearchIcon from "@mui/icons-material/Search";
import {
	Box,
	Chip,
	IconButton,
	InputBase,
	Tooltip,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import { TextField } from "@mui/material";
import { GET_USERS_WITH_ATTEMPTS } from "adapters/noki_ed.service";
import { UPDATE_REQUEST_EXTENSION } from "adapters/noki_ed.service";
import DataTable from "components/DashboardWidgets/gridRenderer";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CustomTextField from "components/ReusableComponents/CustomTextField";
import UIButton from "components/ReusableComponents/UIButton";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import useDebounce from "hooks/useDebounce";
import { memo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import FeedbackEditableCircuits from "./FeedbackEditableCircuits";
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
		marginLeft: "0 !important",
		width: "auto",
	},
	display: "flex",
}));

// Memoized ActionMenu component
const ActionMenu = ({
	params,
	setSelectedCircuit,
	setSelectedCase,
	setMultiStationCase,
	setEditScoreOpen,
	setEmail,
}) => {
	const handleClick = (_event) => {
		const {
			attempts = [],
			multi_station_case_attempts = [],
			user_email,
		} = params.row;
		if (attempts.length > 0) {
			const { case_id, circuit_id } = attempts[0];
			setMultiStationCase(null);
			if (case_id) {
				setSelectedCircuit(null);
				setSelectedCase(attempts[0]);
			} else if (circuit_id) {
				setSelectedCase(null);
				setSelectedCircuit(attempts[0]);
			}
		}

		if (multi_station_case_attempts.length > 0) {
			const multi_case = multi_station_case_attempts[0];
			if (multi_case) {
				setSelectedCircuit(null);
				setSelectedCase(null);
				setMultiStationCase(multi_case);
			}
		}
		setEmail(user_email);
		setEditScoreOpen(true);
	};
	const attempts = params.row?.attempts;
	const multi_station_case_attempts = params.row?.multi_station_case_attempts;
	let text = "";
	if (
		(attempts && attempts.length > 0) ||
		multi_station_case_attempts?.length > 0
	) {
		const { review_status } = attempts[0] || multi_station_case_attempts[0];
		if (review_status === "completed") {
			text = "View";
		}
	}
	const hasCompletedAttempt = attempts?.some(
		(attempt) =>
			attempt.status === "completed" || attempt.review_status === "completed",
	);

	const hasCompletedMultiStationCase = multi_station_case_attempts?.some(
		(attempt) =>
			attempt.status === "completed" || attempt.review_status === "completed",
	);

	return (
		<>
			<UIButton
				text={text || "Review"}
				onClick={handleClick}
				disabled={!(hasCompletedAttempt || hasCompletedMultiStationCase)}
			/>
		</>
	);
};

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

const StatBox = ({ stats }) => (
	<Box
		sx={{
			display: "flex",
			border: "1px solid #E2E8F0",
			borderRadius: 2,
			overflow: "hidden",
			width: "100%",
			backgroundColor: "#F7F5FB",
		}}
	>
		{stats.map(({ label, value, color }, idx) => (
			<Box
				key={label}
				sx={{
					width: "100%",
					textAlign: "center",
					py: 1,
					borderRight: idx < stats.length - 1 ? "1px solid #E2E8F0" : "none",
				}}
			>
				<Typography variant="caption" color="#4A5568">
					{label}
				</Typography>
				<Typography variant="h6" sx={{ color, fontWeight: 600 }}>
					{value ?? 0}
				</Typography>
			</Box>
		))}
	</Box>
);

// Memoized CustomHeader component
const CustomHeader = memo(
	({
		assignmentName,
		attemptStatus,
		searchTerm,
		onSearchChange,
		onFilterChange,
		usersCount,
	}) => {
		const CompletedCount =
			usersCount?.attemptsCompleted +
				usersCount?.multiStationCaseAttemptsCompleted || 0;
		const PendingCount =
			usersCount?.attemptsInProgress +
				usersCount?.multiStationCaseAttemptsInProgress || 0;
		const OverdueCount = usersCount?.count - (CompletedCount + PendingCount);

		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", lg: "row" },
					justifyContent: "space-between",
					alignItems: { xs: "stretch", md: "flex-start" },
					mb: 2,
					gap: 2,
				}}
			>
				<Box sx={{ mb: 3, width: { xs: "100%", sm: "50%" } }}>
					<Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
						{assignmentName}
					</Typography>
					<StatBox
						stats={[
							{
								label: "Total",
								value: usersCount?.count || 0,
								color: "#4A5568",
							},
							{
								label: "Completed",
								value: CompletedCount || 0,
								color: "#38A169",
							},
							{
								label: "Pending with Student",
								value: PendingCount || 0,
								color: "#FFA500",
							},
							{
								label: "Not Started",
								value: OverdueCount || 0,
								color: "#E53E3E",
							},
						]}
					/>
				</Box>

				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						alignItems: { xs: "stretch", sm: "flex-start", md: "center" },
						justifyContent: "center",
						gap: 3,
						flexWrap: "wrap",
					}}
				>
					<SearchBar
						value={searchTerm}
						onChange={(event) => onSearchChange(event.target.value)}
					/>
					<CustomTextField
						label="Filter by Status"
						options={[
							{ value: "to be reviewed", label: "To be Reviewed" },
							{ value: "pending from student", label: "Pending From Student" },
							{ value: "reviewed", label: "Reviewed" },
						]}
						value={attemptStatus}
						onChange={onFilterChange}
						width="33%"
						isNone={false}
					/>
				</Box>
			</Box>
		);
	},
);

const ExtendedDate = ({
	attempt_id,
	fhir_practitioner_id,
	reason,
	email,
	studentName,
	caseId,
	circuitId,
	data,
	refreshData,
}) => {
	const [openModal, setOpenModal] = useState(false);
	const [selectedDate, setSelectedDate] = useState(null);
	const [isRejecting, setIsRejecting] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const auth = useSelector((state) => state?.auth?.personData);

	const handleClick = () => setOpenModal(true);
	const handleClose = () => {
		setOpenModal(false);
		setSelectedDate(null);
		setIsRejecting(false);
		setRejectReason("");
	};

	const handleExtend = async (isRejected = false) => {
		if (!isRejected && !selectedDate) {
			toast.error("Please select a date to approve.");
			return;
		}

		if (!isRejected) {
			const today = new Date().toDateString();
			const selected = new Date(selectedDate).toDateString();
			if (new Date(selected) < new Date(today)) {
				toast.error("Invalid! Please choose a date i.e today or future.");
				return;
			}
		}

		const payload = {
			attempt_id,
			fhir_practitioner_id: fhir_practitioner_id || auth?.fhir_practitioner_id,
			reason,
			approved_by: auth?.id,
			approved_status: isRejected ? "rejected" : "accepted",
			email,
			studentName,
			case_id: caseId || undefined,
			circuit_id: circuitId || undefined,
			caseName: data?.case_name,
			circuitName: data?.circuit_name,
			...(!isRejected && {
				extended_time: dayjs(selectedDate).format("YYYY-MM-DD"),
			}),
			...(isRejected && {
				rejected_reason: rejectReason?.trim() || undefined,
			}),
		};

		try {
			await UPDATE_REQUEST_EXTENSION(payload);
			toast.success(
				`Extension ${isRejected ? "rejected" : "approved"} successfully`,
			);
			handleClose();
			if (typeof refreshData === "function") refreshData();
		} catch (error) {
			console.error("Extension update failed:", error?.response?.data || error);
			toast.error("Something went wrong");
		}
	};

	return (
		<>
			<Tooltip title="Requested For Date Extension">
				<IconButton
					onClick={handleClick}
					size="small"
					aria-label="Request date extension"
				>
					<RunningWithErrorsIcon
						fontSize="small"
						style={{ color: "#ff5733" }}
					/>
				</IconButton>
			</Tooltip>
			<UIModal
				open={openModal}
				width={400}
				displayCloseIcon={false}
				style={{ p: 2 }}
			>
				<div className="d-flex flex-column gap-3">
					<div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom">
						<h5 className="m-0 fw-bold">
							{isRejecting
								? "Rejection Reason (Optional)"
								: "Reason for Extension"}
						</h5>
						<button
							type="button"
							className="btn-close"
							aria-label="Close"
							onClick={handleClose}
						/>
					</div>
					{isRejecting ? (
						<Box
							sx={{
								backgroundColor: "#f1f1f1",
								borderRadius: 1,
								padding: 2,
							}}
						>
							<TextField
								fullWidth
								multiline
								minRows={3}
								label="Write rejection reason (optional)"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
							/>
						</Box>
					) : (
						<div className="d-flex flex-column gap-3">
							<Box
								sx={{
									backgroundColor: "#f7f7f7",
									borderRadius: 1,
									padding: 2,
									fontSize: "0.85rem",
								}}
							>
								<strong>Reason:</strong> {reason}
							</Box>
							<Box
								sx={{
									backgroundColor: "#f1f1f1",
									borderRadius: 1,
									padding: 2,
								}}
							>
								<UIDatePicker
									label="Select Extension Date"
									value={selectedDate}
									onChange={setSelectedDate}
									disablePast
									isRequired={false}
								/>
							</Box>
						</div>
					)}
					<div className="d-flex flex-row justify-content-center gap-2 mt-3">
						{isRejecting ? (
							<>
								<UIButton
									onClick={() => setIsRejecting(false)}
									variant="outlined"
									text="Go Back"
									size="medium"
									sx={{
										width: "100%",
										textTransform: "capitalize !important",
									}}
								/>
								<UIButton
									onClick={() => handleExtend(true)}
									variant="outlined"
									text="Reject"
									size="medium"
									color="error"
									sx={{
										width: "100%",
										textTransform: "capitalize !important",
									}}
								/>
							</>
						) : (
							<>
								<UIButton
									onClick={() => setIsRejecting(true)}
									variant="outlined"
									text="Reject"
									size="medium"
									sx={{
										width: "100%",
										color: "red",
										borderColor: "red",
										textTransform: "capitalize !important",
										"&:hover": {
											backgroundColor: "#ffe6e6",
											borderColor: "red",
										},
									}}
								/>
								<UIButton
									onClick={() => handleExtend(false)}
									variant="contained"
									text="Approve"
									size="medium"
									color="success"
									sx={{
										width: "100%",
										textTransform: "capitalize !important",
									}}
								/>
							</>
						)}
					</div>
				</div>
			</UIModal>
		</>
	);
};

// Memoized ModalContent component

const DisplayUsers = ({
	group,
	caseId,
	circuitId,
	_isMultiStation,
	assessmentName,
}) => {
	const [tableLoading, setTableLoading] = useState(false);
	const [groupUsers, setGroupUsers] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [attemptStatus, setAttemptStatus] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(0);
	const [pageSize] = useState(10);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const debouncedStatus = useDebounce(attemptStatus, 500);
	const [rowCount, setRowCount] = useState(0);
	const [cache, setCache] = useState({});
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [selectedCase, setSelectedCase] = useState(null);
	const [multiStationCase, setMultiStationCase] = useState(null);
	const [email, setEmail] = useState("");
	const [editScoreOpen, setEditScoreOpen] = useState(false);
	const [sortField, setSortField] = useState([]);
	const [usersCount, setUsersCount] = useState([]);
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});
	const chipStyles = {
		color: "#fff",
		borderRadius: "4px",
		height: "1.5rem",
	};
	const chipColors = {
		"to be reviewed": "#4CAF50",
		"pending from student": "#FF8C34",
		reviewed: "#9C9C9C",
	};

	useEffect(() => {
		setPage(0);
		setSearchTerm("");
		setAttemptStatus("");
		setSelectedRows([]);
		setGroupUsers([]);
		setCache({});
	}, [group?.id, caseId, circuitId]);

	const getAttemptStatus = {
		"to be reviewed": "todo",
		"pending from student": "pending",
		reviewed: "completed",
	};

	// Add a function to generate cache key
	const getCacheKey = useCallback(
		(pageNum) => {
			return `${pageNum}_${debouncedSearchTerm}_${debouncedStatus}_${group?.id}_${caseId}_${circuitId}`;
		},
		[debouncedSearchTerm, debouncedStatus, group?.id, caseId, circuitId],
	);

	useEffect(() => {
		setCache({});
		setPaginationModel((prev) => ({ ...prev, page: 0 }));
	}, [debouncedSearchTerm, debouncedStatus, group?.id, circuitId, caseId]);

	const getUsersList = async (force = false) => {
		if (!group?.id) return;
		try {
			const currentCacheKey = getCacheKey(page);

			// Check cache first with the new cache key
			if (!force && cache[currentCacheKey]) {
				setGroupUsers(cache[currentCacheKey]);
				return;
			}

			setTableLoading(true);
			const response = await GET_USERS_WITH_ATTEMPTS({
				...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
				...(debouncedStatus && { status: getAttemptStatus[debouncedStatus] }),
				...(caseId && { caseId: caseId }),
				...(circuitId && { circuitId: circuitId }),
				...(sortField &&
					sortField[0]?.field === "user_name" && {
						...sortField[0],
						field: "name",
					}),
				page: page,
				pageSize: pageSize,
				groupId: group.id,
			});
			const usersCount = response?.data || [];
			setUsersCount(usersCount);

			// Store in cache using the new cache key
			setCache((prev) => ({
				...prev,
				[currentCacheKey]: response.data.data,
			}));

			setGroupUsers(response.data.data);
			setRowCount(response.data.count);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to fetch Students");
		} finally {
			setTableLoading(false);
		}
	};
	useEffect(() => {
		getUsersList();
	}, [
		group,
		caseId,
		circuitId,
		debouncedSearchTerm,
		debouncedStatus,
		page,
		paginationModel.page,
		sortField,
	]);
	const handlePageChange = useCallback((newPage) => {
		setPaginationModel(newPage);
		setPage(newPage.page);
	}, []);

	const handleSearchChange = useCallback((newValue) => {
		setSearchTerm(newValue);
		setPage(0);
	}, []);
	const handleFilterChange = useCallback((event) => {
		setAttemptStatus(event.target.value);
		setPage(0);
	}, []);
	const onSortModelChange = (field) => {
		setSortField(field);
		setCache({});
		setPaginationModel((prev) => ({ ...prev, page: 0 }));
		setPage(0);
	};
	const handleRenderComponent = () => {
		setPage(0);
		setSearchTerm("");
		setAttemptStatus("");
		setSelectedRows([]);
		setGroupUsers([]);
		setCache({});
		getUsersList(true);
	};
	const columns = [
		{
			field: "user_name",
			headerName: "Name",
			flex: 1,
			sortable: true,
			disableColumnMenu: true,
			width: 150,
		},
		{
			field: "user_email",
			headerName: "Email",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			width: 200,
		},
		{
			field: "status",
			headerName: "Status",
			flex: 0.5,
			sortable: false,
			disableColumnMenu: true,
			width: 150,
			renderCell: (params) => {
				let label = "Pending from student";

				const attempt = params?.row?.attempts?.[0];
				const multiStationAttempt =
					params?.row?.multi_station_case_attempts?.[0];

				const reviewStatus =
					attempt?.review_status || multiStationAttempt?.review_status;

				if (reviewStatus === "completed") {
					label = "Reviewed";
				} else if (reviewStatus === "todo") {
					label = "To be Reviewed";
				}
				return (
					<Chip
						label={label}
						sx={{
							...chipStyles,
							backgroundColor: chipColors[label?.toLowerCase()],
							width: "100%",
						}}
					/>
				);
			},
		},
		{
			field: "actions",
			headerName: "Actions",
			flex: 0.5,
			sortable: false,
			disableColumnMenu: true,
			width: 100,
			renderCell: (params) => {
				const isPending =
					params?.row?.request_extensions?.[0]?.approved_status === "pending";
				const attempt = params?.row?.attempts?.[0];
				const multiStationAttempt =
					params?.row?.multi_station_case_attempts?.[0];
				const attemptId = attempt?.id || multiStationAttempt?.id;

				return (
					<>
						{" "}
						{!isPending ? (
							<ActionMenu
								params={{ ...params, groupId: group.id }}
								setSelectedCircuit={setSelectedCircuit}
								setEditScoreOpen={setEditScoreOpen}
								setSelectedCase={setSelectedCase}
								setMultiStationCase={setMultiStationCase}
								setEmail={setEmail}
							/>
						) : (
							<ExtendedDate
								attempt_id={attemptId}
								fhir_practitioner_id={
									params?.row?.request_extensions?.[0]?.fhir_practitioner_id
								}
								reason={
									params?.row?.request_extensions?.[0]?.reason ||
									"No reason provided"
								}
								caseId={params?.row?.request_extensions?.[0]?.case_id}
								circuitId={params?.row?.request_extensions?.[0]?.circuit_id}
								email={params?.row?.user_email}
								studentName={params?.row?.user_name}
								data={params.row}
								refreshData={handleRenderComponent}
							/>
						)}
					</>
				);
			},
		},
	];

	return (
		<div>
			<CreateWrapper open={editScoreOpen}>
				<FeedbackEditableCircuits
					setEditScoreOpen={setEditScoreOpen}
					circuitsData={selectedCircuit}
					caseData={selectedCase}
					multiStationCaseData={multiStationCase}
					email={email}
					handleRender={handleRenderComponent}
				/>
			</CreateWrapper>
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<CustomHeader
					assignmentName={assessmentName}
					groupName={group.name}
					isEditable={group?.isEditable}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					attemptStatus={attemptStatus}
					onSearchChange={handleSearchChange}
					onFilterChange={handleFilterChange}
					setAttemptStatus={setAttemptStatus}
					showDeleteButton={selectedRows.length > 0}
					usersCount={usersCount}
				/>

				<Box sx={{ flexGrow: 1 }}>
					<DataTable
						rows={groupUsers}
						columns={columns}
						paginationModel={paginationModel}
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
						sortModel={sortField}
						onSortModelChange={onSortModelChange}
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
			</Box>
		</div>
	);
};

export default DisplayUsers;
