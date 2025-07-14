import { Search as SearchIcon } from "@mui/icons-material";
import {
	Badge,
	Box,
	Chip,
	Grid,
	InputBase,
	Paper,
	Skeleton,
	Stack,
	Tab,
	Tabs,
	Tooltip,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import {
	CREATE_OR_UPDATE_TEST_ASSIGNMENTS,
	GET_ASSIGNED_TEST_ASSIGNMENTS,
} from "adapters/noki_ed.service";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";
import DisplayUsers from "./DisplayUsers";

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
			"&:focus": { width: "30ch" },
		},
	},
}));

const SearchContainer = styled("div")(({ theme }) => ({
	position: "relative",
	border: "1px solid #808C9E66",
	borderRadius: "10px",
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
	width: "100%",
	display: "flex",
}));

const SearchBar = memo(({ value, onChange }) => (
	<SearchContainer>
		<StyledInputBase
			placeholder="Search for Assignments"
			inputProps={{ "aria-label": "search" }}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
		<SearchIconWrapper>
			<SearchIcon />
		</SearchIconWrapper>
	</SearchContainer>
));

const DisplayAssignments = ({ group }) => {
	const [assignments, setAssignments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);
	const [tab, setTab] = useState({ index: 0, value: "all" });
	const [search, setSearch] = useState("");
	const [intialLoading, setIntialLoading] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [newEndDate, setNewEndDate] = useState(null);
	// end_time: dayjs(end_time).format("YYYY-MM-DD"),
	const TAB_OPTIONS = [
		{ label: "All", value: "all" },
		{ label: "Current", value: "current" },
		{ label: "Upcoming", value: "future" },
		{ label: "Past", value: "completed" },
	];

	useEffect(() => {
		if (!group?.id) return;
		setTab({ index: 0, value: "all" });
	}, [group]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const params = { group_id: group.id };
			if (tab.value !== "all") params.assignmentStatus = tab.value;
			const res = await GET_ASSIGNED_TEST_ASSIGNMENTS(params);
			setAssignments(res?.data?.test_assignment || []);
			if (!intialLoading) setIntialLoading(true);
		} catch (err) {
			console.error(err);
			toast.error("Failed to load assignments");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!group?.id) return;
		fetchData();
		setSelected(null);
	}, [group, tab.value]);

	const handleTabChange = (_e, newIndex) =>
		setTab({ index: newIndex, value: TAB_OPTIONS[newIndex].value });

	const handleNavigation = () => setSelected(null);
	const totalStudents =
		group?.user_group_assignments_aggregate?.aggregate?.count;

	const list = useMemo(() => {
		if (!search.trim()) return assignments;
		const q = search.toLowerCase();
		return assignments.filter((r) =>
			(r.case?.name || r.circuit?.name || "").toLowerCase().includes(q),
		);
	}, [assignments, search]);

	const renderSkeletonCards = (count = 4) =>
		Array.from({ length: count }).map(() => {
			const uniqueKey = `sk-${Math.random().toString(36).substr(2, 9)}`;
			return (
				<Paper
					key={uniqueKey}
					variant="outlined"
					sx={{ p: 2, mb: 2, borderRadius: 3 }}
				>
					<Skeleton variant="text" width="60%" height={28} />
					<Skeleton variant="text" width="40%" height={20} />
					<Skeleton
						variant="rectangular"
						width="100%"
						height={60}
						sx={{ mt: 1 }}
					/>
				</Paper>
			);
		});

	if (!group?.id) return;

	if (!intialLoading && loading) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					minHeight: "300px",
				}}
			>
				<CommonProgress />
			</Box>
		);
	}

	if (selected)
		return (
			<CreateWrapper open>
				<Box sx={{ p: 3 }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<img
							src={GoBackIcon}
							alt="back"
							onClick={handleNavigation}
							onKeyUp={handleNavigation}
							style={{ cursor: "pointer" }}
						/>
						<Typography variant="h4" sx={{ color: "#5840BA", ml: 1 }}>
							Assignments
						</Typography>
					</Box>
					<DisplayUsers
						assessmentName={
							selected.case?.name || selected.circuit?.name || "Untitled"
						}
						group={selected.user_group}
						caseId={selected.case_id}
						circuitId={selected.circuit_id}
						isMultiStation={selected.case?.is_multi_station}
					/>
				</Box>
			</CreateWrapper>
		);

	return (
		<Box
			sx={{
				maxHeight: { xs: "none", md: "90%", xl: "100%" },
				px: { xs: 1, sm: 0 },
			}}
		>
			<Box sx={{ mb: 2 }}>
				<Typography
					variant="h4"
					sx={{ color: "#5840BA", mb: 1 }}
					fontWeight={600}
				>
					{group.name}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{assignments.length} Assignments&nbsp;|&nbsp;
					{totalStudents ?? 0} Members
				</Typography>
			</Box>

			<Stack
				direction={{ xs: "column", sm: "row" }}
				alignItems="center"
				justifyContent={{ xs: "flex-start", sm: "space-between" }}
				spacing={2}
				sx={{ mb: 2 }}
			>
				<Box
					sx={{
						width: { xs: "100%", sm: 400 },
						mb: { xs: 1, sm: 0 },
						flexShrink: 0,
					}}
				>
					{!intialLoading && loading ? (
						<Skeleton
							variant="rectangular"
							height={40}
							sx={{ borderRadius: "20px" }}
						/>
					) : (
						<Tabs
							value={tab.index}
							onChange={handleTabChange}
							aria-label="assignment tabs"
							variant="fullWidth"
							sx={{
								backgroundColor: "#F7F5FB",
								borderRadius: "35px",
								width: "100%",
								p: 0,
							}}
							TabIndicatorProps={{ style: { display: "none" } }}
						>
							{TAB_OPTIONS.map((tab, idx) => (
								<Tab
									key={`tab-${tab.label}-${idx}`}
									label={tab.label}
									disabled={loading}
									sx={{
										fontWeight: 500,
										fontSize: "14px",
										textTransform: "capitalize",
										borderRadius: "35px",
										"&.Mui-selected": {
											backgroundColor: "#5840BA",
											color: "white",
										},
									}}
								/>
							))}
						</Tabs>
					)}
				</Box>

				<Box
					sx={{
						width: { xs: "100%", sm: 260 },
						ml: { sm: "auto" },
					}}
				>
					<SearchBar value={search} onChange={setSearch} />
				</Box>
			</Stack>
			<Box sx={{ maxHeight: "80%", overflowY: "auto", pr: 1 }}>
				{loading ? (
					renderSkeletonCards()
				) : list.length ? (
					list.map((data) => {
						const title = data.case?.name || data.circuit?.name || "Untitled";
						const isCircuit = !data.case;
						const isMultiStation = Boolean(data.case?.is_multi_station);
						const chipLabel = isCircuit
							? "Circuit"
							: isMultiStation
								? "Full Case"
								: "Single Case";
						const chipColor = isCircuit
							? "warning"
							: isMultiStation
								? "success"
								: "info";
						const startDate = data.start_time
							? dayjs(data.start_time).format("DD MMM YYYY")
							: "--";
						const endDate = data.end_time
							? dayjs(data.end_time).format("DD MMM YYYY")
							: "--";

						return (
							<Box
								key={data.id}
								sx={{
									position: "relative",
									display: "inline-block",
									width: "100%",
								}}
							>
								{data?.request_extensions?.length > 0 && (
									<Tooltip
										title="Student raised a request for a date extension."
										arrow
									>
										<Badge
											color="error"
											variant="dot"
											overlap="circular"
											anchorOrigin={{ vertical: "top", horizontal: "right" }}
											sx={{
												position: "absolute",
												top: 8,
												right: 8,
												zIndex: 1,
												pointerEvents: "auto",
												cursor: "default",
											}}
										>
											<Box sx={{ width: 0, height: 0 }} />
										</Badge>
									</Tooltip>
								)}

								<Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
									<Grid container>
										<Grid item xs={12} md={12}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													mb: 1,
												}}
											>
												<Box>
													<Box display="flex" alignItems="center" gap={1}>
														<Typography fontWeight={600} component="div">
															{title}
															<Chip
																label={chipLabel}
																color={chipColor}
																size="small"
																sx={{
																	fontWeight: 500,
																	ml: 1,
																	verticalAlign: "middle",
																}}
															/>
														</Typography>
													</Box>
													<Typography variant="caption" color="text.secondary">
														Timeline : {startDate} – {endDate}
													</Typography>
												</Box>
												<Box sx={{ display: "flex", gap: 1 }}>
													<UIButton
														variant="outlined"
														onClick={() => {
															setEditData(data);
															setNewEndDate(data.end_time);
															setEditOpen(true);
														}}
														text={"Edit"}
														size="medium"
														sx={{ textTransform: "capitalize !important" }}
													/>
													<UIButton
														variant="outlined"
														onClick={() => setSelected(data)}
														text={"View"}
														size="medium"
														sx={{ textTransform: "capitalize !important" }}
													/>
												</Box>
											</Box>
										</Grid>
									</Grid>
								</Paper>
							</Box>
						);
					})
				) : (
					<Typography>No assignments found.</Typography>
				)}
			</Box>
			<UIModal
				open={editOpen}
				setOpen={setEditOpen}
				displayCloseIcon={false}
				style={{ p: 2 }}
			>
				<div className="d-flex flex-column gap-3">
					<div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom">
						<h5 className="m-0 fw-bold">ExtendDate</h5>
						<button
							type="button"
							className="btn-close"
							aria-label="Close"
							onClick={() => setEditOpen(false)}
						/>
					</div>
					<div className="d-flex flex-column gap-3">
						<UIDatePicker
							label="Start Date"
							value={editData?.start_time ? dayjs(editData.start_time) : null}
							disabled
						/>
						<UIDatePicker
							label="End Date"
							value={newEndDate ? dayjs(newEndDate) : null}
							disablePast
							onChange={(val) => setNewEndDate(val)}
						/>
					</div>
					<div className="d-flex flex-row justify-content-center gap-2 mt-3 border-top pt-3">
						<UIButton
							onClick={() => setEditOpen(false)}
							variant="outlined"
							text="cancel"
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
						<UIButton
							variant="contained"
							text="Save"
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
							onClick={async () => {
								try {
									const assignment = {
										//id: editData.id,
										group_id: editData.group_id,
										start_time: dayjs(editData.start_time).format(
											"DD MMM YYYY",
										),
										end_time: dayjs(newEndDate).format("DD MMM YYYY"),
										is_published: true,
										assigned_by: editData.assigned_by,
									};

									if (editData.case_id && !editData.circuit_id) {
										assignment.case_id = editData.case_id;
									} else if (editData.circuit_id && !editData.case_id) {
										assignment.circuit_id = editData.circuit_id;
									} else {
										toast.error(
											"Assignment must have either a case or a circuit (not both).",
										);
										return;
									}

									await CREATE_OR_UPDATE_TEST_ASSIGNMENTS({
										assignments: [assignment],
									});

									toast.success("Assignment updated successfully");
									setEditOpen(false);
									fetchData();
								} catch (err) {
									console.error(err);
									toast.error(err.message || "Failed to update");
								}
							}}
						/>
					</div>
				</div>
			</UIModal>
		</Box>
	);
};

export default DisplayAssignments;
