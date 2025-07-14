import { useTheme } from "@emotion/react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchIcon from "@mui/icons-material/Search";
import {
	Badge,
	Chip,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Stack,
	Switch,
	TextField,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material";
import FallBackLoader from "components/FallbackLoader";
import AssignedByBadge from "components/ReusableComponents/AssignedByBadge";
import CollapsibleText from "components/ReusableComponents/CollapsibleText";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CustomTextField from "components/ReusableComponents/CustomTextField";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import { convertHtmlToText, hasEditPrivileges } from "helpers/common_helper";
import { imageByType } from "helpers/imageHelper";
import { useUserType } from "hooks/useUserType";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	DELETE_CASES_BULK,
	DELETE_CIRCUIT_BY_ID,
	GET_ALL_USER_GROUPS,
	GET_CIRCUITS_DETAILS,
	UPDATE_CIRCUIT,
} from "../../adapters/noki_ed.service";
import Card from "../ReusableComponents/Card";
import CommonProgress from "../ReusableComponents/Loaders";
import UIButton from "../ReusableComponents/UIButton";
// import UICard from "../components/ReusableComponents/UICard";
import UIModal from "../ReusableComponents/UIModal";
import CreateCircuit from "./CreateCircuit";
import PrivateGroupAssignForm from "./PrivateGroupAssignForm";

const pageSize = 4;
const styles = {
	menuButtonStyles: { width: "100%", textTransform: "none" },
	chipStyles: {
		color: "#fff",
		fontWeight: "700",
		borderRadius: "8px",
		height: "1.5rem",
	},
};
const AdminCircuitPage = ({
	isModal = false,
	visibilityState,
	RefreshCircuit,
	debouncedSearchTerm,
	setDisableActions,
	handleSearchChange,
	disableActions,
	searchTerm,
	isAssign = false,
	selected = [],
	onSelect,
}) => {
	const methods = useForm({
		defaultValues: {
			circuit: "",
			station: [],
		},
	});
	const userId = useSelector((state) => state?.auth?.personData?.id);
	const createdByOptions = [
		{ label: "Admin", value: "admin" },
		{ label: "Teaching Staff", value: "examiner" },
		{ label: "Self", value: userId },
	];
	const { reset, setValue } = methods;
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(0);
	const [isPageReset, setIsPageReset] = useState(false);
	const [pageLoader, setPageLoader] = useState(false);
	const [circuitList, setCircuitList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [openModal, setOpenModal] = useState(false);
	const [step, setStep] = useState(1);
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [groupsList, setGroupsList] = useState([]);
	const isMobile = useMediaQuery("(max-width:600px)");
	const [filterState, setFilterState] = useState({
		createdBy: "",
	});
	const userRole = useUserType();
	const toggleSelect = (id) => {
		const updated = selected.includes(id)
			? selected.filter((item) => item !== id)
			: [...selected, id];
		onSelect(updated);
	};
	useEffect(() => {
		if (isPageReset || page > 0) {
			fetchData();
			setIsPageReset(false);
		}
	}, [page, isPageReset]);

	const visibility = isModal
		? ["private"]
		: visibilityState && visibilityState.length >= 1
			? visibilityState
			: ["public", "private"];

	const fetchData = async (visibilityParam = visibility) => {
		try {
			setPageLoader(true);
			setDisableActions(true);
			const response = await GET_CIRCUITS_DETAILS({
				page,
				pageSize,
				...(debouncedSearchTerm && { filter: debouncedSearchTerm }),
				...(filterState.createdBy &&
					(filterState.createdBy === "admin" ||
					filterState.createdBy === "examiner"
						? { created_by_role: filterState.createdBy }
						: { created_by_id: userId })),
				visibility: visibilityParam,
			});
			const circuits = response?.data?.data;
			const modifyCircuitsWithCases = (circuits) => {
				return circuits.map((circuit) => {
					const cases = circuit.stations.reduce((acc, station) => {
						const updatedCases = station.cases.map((caseItem) => ({
							...caseItem,
							station_id: station?.id,
							station_type: station?.type,
						}));
						return acc.concat(updatedCases);
					}, []);

					const createdByID = circuit?.created_by?.id;

					const isEditable = hasEditPrivileges(createdByID, userRole, userId);

					// const role = createdByID === userID ? "Admin" :

					return {
						...circuit,
						cases: cases,
						attempts: circuit?.attempts,
						isEditable,
					};
				});
			};

			const modifiedCircuits = modifyCircuitsWithCases(circuits);
			setCircuitList((prev) => [...prev, ...modifiedCircuits]);
			setHasMore((page + 1) * pageSize < response?.data?.total);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
			setPageLoader(false);
			setDisableActions(false);
		}
	};
	const handleReset = () => {
		setPage(0);
		setCircuitList([]);
		setIsPageReset(true);
	};
	useEffect(() => {
		handleReset();
	}, [debouncedSearchTerm, visibilityState?.length, filterState]);

	const reduceSelectedStationCase = (data) => {
		return data?.map(({ id, cases }) => {
			const caseIds = cases?.map(({ id }) => id);
			return {
				stationId: id,
				cases: caseIds,
			};
		});
	};
	const handleOnAddClick = (circuit) => {
		setValue("circuit", circuit);
		setOpenModal(true);
		setSelectedCircuit({
			name: circuit?.name,
			description: circuit?.description,
			id: circuit?.id,
			stations: reduceSelectedStationCase(circuit?.stations),
			visibility: circuit?.visibility,
			created_by: circuit?.created_by?.id,
			updated_by: circuit?.updated_by?.id,
		});
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		reset();
		setStep(1);
		setSelectedCircuit(null);
	};
	const handleFilterChange = (name) => (event) => {
		setFilterState({
			...filterState,
			[name]: event.target.value,
		});
	};
	// const handleNext = async () => {
	// 	const isValid = await trigger();
	// 	const values = watch();

	// 	if (isValid) {
	// 		if (step === 1 && values.station.length === 0) {
	// 			return;
	// 		}
	// 		if (step === 2 && !values.circuit) {
	// 			return;
	// 		}
	// 		setStep((prevStep) => prevStep + 1);
	// 	}
	// };

	// const transformDataToPayload = (data) => {
	// 	const { circuit, station } = data;

	// 	const circuit_id = circuit.id;

	// 	const stations = Object.entries(station)
	// 		.map(([stationId, stationData]) => {
	// 			const cases = Object.entries(stationData.cases)
	// 				.filter(([_caseId, isSelected]) => isSelected)
	// 				.map(([caseId]) => caseId);

	// 			return {
	// 				id: stationId,
	// 				cases: cases,
	// 			};
	// 		})
	// 		.filter((station) => station.cases.length > 0);

	// 	return {
	// 		circuit_id,
	// 		stations,
	// 	};
	// };

	// const onSubmit = async (data) => {
	// 	try {
	// 		await ADD_CASES_BULK(transformDataToPayload(data));
	// 		setStep(3);
	// 		getOSCEList();
	// 	} catch (err) {
	// 		toast.error(err.message || "Error while updating");
	// 	}
	// };

	const handleDeleteClick = (circuit) => (_event) => {
		setSelectedCircuit(circuit);
		setOpenConfirm(true);
	};

	const handleConfirmClose = () => {
		setSelectedCircuit(null);
		setOpenConfirm(false);
	};

	const handleOnDelete = async () => {
		try {
			setDeleteLoading(true);
			const payload = {
				created_by: selectedCircuit?.created_by?.id,
				updated_by: userId,
				role: userRole?.toLowerCase(),
			};
			await DELETE_CIRCUIT_BY_ID(selectedCircuit?.id, payload);

			toast.success("Circuit Deleted Successfully");
			handleReset();
		} catch (err) {
			toast.error(err.message || "Error While Deleting Circuit");
		} finally {
			setDeleteLoading(false);
			handleConfirmClose();
		}
	};

	const getGroupList = async () => {
		try {
			const response = await GET_ALL_USER_GROUPS();
			setGroupsList(response?.data?.user_groups || []);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		getGroupList();
	}, []);

	return (
		<div className="d-flex flex-column h-100">
			{/* <div className="d-flex justify-content-between px-4 pt-4">
				<div>
					<h1>OSCE Circuits</h1>
					<p>Select your OSCE Station based on your Specialization!</p>
				</div>
				<div className="d-flex flex-row gap-4">
					<UIButton text="Filters" endIcon={<TuneIcon />} />
				</div>
			</div> */}

			<div
				className="position-sticky top-0 col-12 d-flex flex-wrap justify-content-end align-items-center m-0"
				style={{
					padding: "10px",
					backgroundColor: "white",
					zIndex: "1020",
				}}
			>
				<div className="d-flex flex-wrap gap-2 align-items-center w-80">
					<div className="flex-grow-1">
						<TextField
							fullWidth={isMobile}
							variant="outlined"
							placeholder="Search for Circuits"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<SearchIcon style={{ color: "#5D5FEF" }} />
									</InputAdornment>
								),
							}}
							size="small"
							value={searchTerm}
							onChange={handleSearchChange}
							disabled={disableActions}
						/>
					</div>
					<div className="mx-3 flex-grow-1">
						<CustomTextField
							label="Created By"
							options={createdByOptions}
							value={filterState?.createdBy}
							onChange={handleFilterChange("createdBy")}
							width="100%"
							isNone={false}
						/>
					</div>
				</div>
			</div>

			{loading ? (
				<div
					className="d-flex align-items-center justify-content-center"
					style={{ height: "70vh" }}
				>
					<FallBackLoader />
				</div>
			) : !circuitList?.length && !pageLoader ? (
				<div
					className="d-flex justify-content-center align-items-center"
					style={{ height: "50vh" }}
				>
					No Circuits Available
				</div>
			) : (
				<div className="flex-grow-1 overflow-auto h-100">
					<InfiniteScroll
						setPage={setPage}
						hasMore={hasMore}
						isLoading={pageLoader}
					>
						{circuitList?.map((circuit, idx) => {
							return (
								<CircuitView
									key={`admin-circuit-page-circuit-${circuit?.id}-${idx}`} // Must be unique as we are using index and circuit id
									caseList={circuit?.cases}
									circuit={circuit}
									handleOnAddClick={() => handleOnAddClick(circuit)}
									getOSCEList={handleReset}
									handleDeleteClick={handleDeleteClick}
									groupsList={groupsList}
									RefreshCircuit={RefreshCircuit}
									isAssign={isAssign}
									isChecked={selected.includes(circuit?.id)}
									onCheck={() => toggleSelect(circuit?.id)}
								/>
							);
						})}
					</InfiniteScroll>
				</div>
			)}
			<UIModal
				open={openModal}
				handleClose={handleCloseModal}
				width={step === 1 ? "80vw" : 400}
			>
				<CreateCircuit
					handleCloseCreate={handleCloseModal}
					mode="edit"
					data={selectedCircuit}
					RefreshCircuit={handleReset}
				/>
			</UIModal>

			<UIModal
				open={openConfirm}
				handleClose={handleConfirmClose}
				closeOnBackdropClic={false}
			>
				<div>
					<div className="fs-4 mb-3 text-center">
						<h6 style={{ fontWeight: "bold" }}>
							Are you sure you want to delete ?
						</h6>
						<span style={{ textAlign: "center", fontSize: "14px" }}>
							This action cannot be undone. Do you really want to delete this
							Circuit?
						</span>
					</div>
					<div className="d-flex justify-content-between align-items-center gap-2">
						<UIButton
							text="no"
							variant={"contained"}
							onClick={handleConfirmClose}
							size="small"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={deleteLoading ? <CommonProgress /> : "yes"}
							onClick={handleOnDelete}
							variant={"contained"}
							color="error"
							size="small"
							disable={deleteLoading}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
		</div>
	);
};

export default AdminCircuitPage;

const CircuitView = ({
	circuit,
	caseList,
	handleOnAddClick,
	getOSCEList,
	handleDeleteClick,
	groupsList,
	RefreshCircuit,
	isAssign,
	isChecked,
	onCheck,
}) => {
	const [casesList, setCasesList] = useState([...caseList]);
	const [originalCasesList, setOriginalCasesList] = useState([...caseList]);
	const [itemsToRemove, setItemsToRemove] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [assign, setAssign] = useState(false);
	const [isRefreshData, setIsRefreshData] = useState(false);
	const [toggleLoading, setToggleLoading] = useState(false);
	const [isVisible, setIsVisible] = useState(circuit?.is_visible);
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const handleClickMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCloseMenu = () => {
		setAnchorEl(null);
	};
	const theme = useTheme();
	const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
	const userRole = useUserType();
	const userID = useSelector((state) => state?.auth?.personData?.id);

	const handleUpdate = async () => {
		if (itemsToRemove?.length === 0) {
			toast.info(
				"It looks like you haven't made any changes. Please update something before proceeding.",
			);
			return;
		}
		try {
			setLoading(true);
			await DELETE_CASES_BULK({
				objects: itemsToRemove?.map((item) => ({
					case_id: item?.id,
					circuit_id: circuit?.id,
					station_id: item?.station_id,
				})),
				created_by: circuit?.created_by?.id,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			});
			await getOSCEList();
			setOriginalCasesList(casesList);
			toast.success("Circuit Updated Successfully");
		} catch (err) {
			toast.error(err?.message || "Failed to Remove");
			setCasesList(originalCasesList);
		} finally {
			setLoading(false);
			setItemsToRemove([]);
			setEditMode(false);
		}
	};
	const removeCaseFromCircuit = (item) => {
		if (casesList.length <= 1) {
			toast.warn(
				"To delete the entire circuit, click on the delete icon. You cannot remove all cases from the circuit.",
			);
			return;
		}
		setItemsToRemove((p) => [...p, item]);
		setCasesList(
			casesList.filter(
				(caseItem) =>
					caseItem.id !== item.id || caseItem?.station_id !== item?.station_id,
			),
		);
	};
	const handleClose = () => {
		setCasesList(originalCasesList);
		setEditMode(false);
		setItemsToRemove([]);
	};
	const handleCloseAssignmentModal = () => {
		setAssign(false);
		if (isRefreshData) {
			RefreshCircuit();
		}
		setIsRefreshData(false);
	};

	const handleRender = () => {
		setAssign(false);
		RefreshCircuit();
	};

	const handleCircuitVisibility = async () => {
		try {
			setToggleLoading(true);
			const response = await UPDATE_CIRCUIT(circuit?.id, {
				is_visible: !isVisible,
				created_by: circuit?.created_by?.id,
				updated_by: userID,
				role: userRole?.toLowerCase(),
			});
			setIsVisible(response?.data?.is_visible || false);
			toast.success(
				!isVisible
					? "Circuit Visible Successfully"
					: "Circuit Hidden Successfully",
			);
		} catch (error) {
			toast.error(error?.message || "Failed to update");
		} finally {
			setToggleLoading(false);
		}
	};

	const handleClick = async (action) => {
		action();
	};

	const StackContent = () => (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
			width="100%"
			spacing={1}
		>
			<Typography variant="body2" style={{ fontWeight: "bold" }}>
				{isVisible ? "Visible" : "Not Visible"}
			</Typography>

			<Switch
				checked={isVisible}
				onChange={handleCircuitVisibility}
				sx={{ "& .MuiSwitch-input": { left: 0, right: 0 } }}
			/>
		</Stack>
	);

	return (
		<div
			className={`d-flex flex-column mx-4 mb-4 p-3 rounded rounded-3 ${circuit?.isEditable === true ? "card-bg-secondary" : "card-bg-disabled"}`}
		>
			<div className="w-100  d-flex justify-content-between align-items-center gap-2">
				{/* CollapsibleText placed at the start */}
				<div className="d-flex gap-4 align-items-center">
					<CollapsibleText
						value={circuit?.name}
						type="tooltip"
						fontWeight={"bold"}
						maxLength={5}
						sx={{ fontSize: "1.2rem", fontWeight: 600 }}
					/>
					{circuit?.visibility === "private" ? (
						<Chip
							label="Test Circuit"
							sx={{
								...styles.chipStyles,
								backgroundColor: "#4C9F72",
							}}
						/>
					) : (
						<Chip
							label="Practice Circuit"
							sx={{
								...styles.chipStyles,
								backgroundColor: "#358293",
							}}
						/>
					)}
					{circuit?.created_by?.role === "admin" && (
						<AssignedByBadge
							name={circuit.created_by.name}
							role={circuit.created_by.role}
						/>
					)}
				</div>
				<div className="d-flex align-items-center">
					{/* Modal Wrapper */}
					<CreateWrapper open={assign}>
						<PrivateGroupAssignForm
							circuit_id={circuit?.id}
							handleClose={handleCloseAssignmentModal}
							groupsList={groupsList}
							render={handleRender}
							isCaseAssign={false}
						/>
					</CreateWrapper>

					{isMediumScreen && !isAssign ? (
						<div>
							{toggleLoading ? (
								<span
									style={{ marginRight: "16px", marginTop: "4px" }}
									className="spinner-border spinner-border-sm"
									role="status"
									aria-hidden="true"
								/>
							) : (
								<IconButton
									id="basic-button"
									aria-controls={open ? "basic-menu" : undefined}
									// aria-haspopup="true"
									aria-expanded={open ? "true" : undefined}
									onClick={handleClickMenu}
									disabled={!circuit?.isEditable}
								>
									<MoreHorizIcon />
								</IconButton>
							)}
							<Menu
								id="basic-menu"
								anchorEl={anchorEl}
								open={open}
								onClose={handleCloseMenu}
								MenuListProps={{
									"aria-labelledby": "basic-button",
								}}
								slotProps={{
									paper: {
										style: {
											border: "1px solid #8170CB",
											borderRadius: "16px",
										},
									},
								}}
							>
								<MenuItem onClick={handleCloseMenu}>
									{circuit?.visibility === "private" ? (
										<Badge
											badgeContent={circuit?.test_assignments_count}
											color={"error"}
										>
											<UIButton
												text={
													circuit?.test_assignments_count > 0
														? "Assign to more groups"
														: "Assign"
												}
												onClick={() => setAssign(true)}
												disabled={casesList?.length === 0}
												sx={styles.menuButtonStyles}
											/>
										</Badge>
									) : circuit?.isEditable ? (
										<Tooltip title="Toggle to change visibility of this circuit for students">
											<span>
												{" "}
												{/* Tooltip requires a wrapper */}
												<StackContent />
											</span>
										</Tooltip>
									) : (
										<StackContent />
									)}
								</MenuItem>

								<MenuItem onClick={handleCloseMenu}>
									<UIButton
										// size="small"
										text="Delete Circuit"
										// color="primary"
										onClick={() => handleClick(handleDeleteClick(circuit))}
										startIcon={<DeleteIcon />}
										sx={styles.menuButtonStyles}
										disabled={circuit?.attempts?.length > 0}
									/>
								</MenuItem>
								<MenuItem onClick={handleCloseMenu}>
									<UIButton
										text="Edit Circuit"
										onClick={() => handleClick(() => setEditMode(true))}
										startIcon={<EditIcon disabled />}
										sx={styles.menuButtonStyles}
										disabled={circuit?.attempts?.length > 0}
									/>
								</MenuItem>
								<MenuItem onClick={handleCloseMenu}>
									<UIButton
										text="Add Case"
										onClick={() => handleClick(() => handleOnAddClick(circuit))}
										startIcon={<AddCircleOutlineIcon />}
										sx={styles.menuButtonStyles}
										disabled={circuit?.attempts?.length > 0}
									/>
								</MenuItem>
							</Menu>
						</div>
					) : (
						<>
							{/* Assign Button */}

							{circuit?.visibility === "private" && !isAssign && (
								<div style={{ marginRight: "0.5rem" }}>
									<Badge
										badgeContent={circuit?.test_assignments_count}
										color={"error"}
									>
										<UIButton
											text={
												circuit?.test_assignments_count > 0
													? "Assign to more groups"
													: "Assign"
											}
											onClick={() => setAssign(true)}
											disabled={casesList?.length === 0 || !circuit?.isEditable}
										/>
									</Badge>
								</div>
							)}

							{/* Loading Spinner */}
							{/* Loading Spinner */}
							{toggleLoading ? (
								<span
									style={{ marginRight: "16px", marginTop: "4px" }}
									className="spinner-border spinner-border-sm"
									role="status"
									aria-hidden="true"
								/>
							) : (
								<>
									{circuit.visibility === "public" &&
										(circuit?.isEditable ? (
											<Tooltip title="Toggle to change visibility of this circuit for students">
												<span>
													{" "}
													{/* Tooltip wrapper required */}
													<Stack
														direction="row"
														alignItems="center"
														justifyContent="center"
														spacing={1}
													>
														<Typography
															variant="body2"
															style={{ fontWeight: "bold" }}
														>
															{isVisible ? "Visible" : "Not Visible"}
														</Typography>

														<Switch
															checked={isVisible}
															onChange={handleCircuitVisibility}
															sx={{
																"& .MuiSwitch-input": { left: 0, right: 0 },
															}}
														/>
													</Stack>
												</span>
											</Tooltip>
										) : (
											<Stack
												direction="row"
												alignItems="center"
												justifyContent="center"
												spacing={1}
											>
												<Typography
													variant="body2"
													style={{ fontWeight: "bold" }}
												>
													{isVisible ? "Visible" : "Not Visible"}
												</Typography>

												<Switch
													checked={isVisible}
													onChange={handleCircuitVisibility}
													sx={{ "& .MuiSwitch-input": { left: 0, right: 0 } }}
													disabled={!circuit?.isEditable}
												/>
											</Stack>
										))}
								</>
							)}

							{/* Action buttons */}
							{!isAssign && (
								<>
									<Tooltip title="Delete">
										<IconButton
											color="primary"
											onClick={() => handleClick(handleDeleteClick(circuit))}
											disabled={
												circuit?.attempts?.length > 0 || !circuit?.isEditable
											}
										>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
									<Tooltip title="Edit">
										<IconButton
											color="primary"
											onClick={() => handleClick(() => setEditMode(true))}
											disabled={
												circuit?.attempts?.length > 0 || !circuit?.isEditable
											}
										>
											<EditIcon />
										</IconButton>
									</Tooltip>
									<Tooltip title="Add Case">
										<IconButton
											color="primary"
											onClick={() =>
												handleClick(() => handleOnAddClick(circuit))
											}
											disabled={
												circuit?.attempts?.length > 0 || !circuit?.isEditable
											}
										>
											<AddCircleOutlineIcon />
										</IconButton>
									</Tooltip>
								</>
							)}
						</>
					)}
				</div>
			</div>
			{circuit?.attempts?.length > 0 && (
				<div
					style={{
						color: "red",
						fontSize: "12px",
						padding: "0.5rem",
						display: "flex",
						gap: "0.5rem",
						alignItems: "center",
					}}
				>
					<>
						<InfoIcon />
						<span>
							This circuit is being attempted by at least one student. You can
							not make any changes at this moment.
						</span>
					</>
				</div>
			)}
			<div>
				{loading ? (
					<div className="h-100 d-flex align-items-center justify-content-center">
						<CommonProgress />
					</div>
				) : (
					<div className="d-flex flex-row">
						{isAssign && (
							<div className="d-flex align-items-center px-3">
								<input
									type="checkbox"
									checked={isChecked}
									onChange={onCheck}
									style={{
										marginRight: "8px",
										transform: "scale(1.4)",
										cursor: "pointer",
									}}
								/>
							</div>
						)}

						<div className="row p-0 m-0 flex-grow-1">
							{casesList?.length === 0 ? (
								!editMode && (
									<div
										className="h-100 p-2 d-flex align-items-center justify-content-center text-muted"
										style={{ background: "white" }}
									>
										No cases available. Please add some.
									</div>
								)
							) : (
								<>
									{casesList?.map((item, idx) => {
										const actions = [];
										if (editMode) {
											actions.push({
												label: "Remove",
												handler: () => removeCaseFromCircuit(item),
												color: "primary",
											});
										}
										return (
											<div
												className="col-md-6 col-lg-4 p-2"
												key={`circuit-view-case-${item?.id}-index-${idx}`}
											>
												<Card
													cardImageClass={imageByType("Circuit", item)}
													item={item}
													name={item?.name}
													description={convertHtmlToText(item?.description)}
													badgeText={item?.case_type}
													badgeText2={item?.station_type}
													actions={actions}
												/>
											</div>
										);
									})}
								</>
							)}
						</div>
					</div>
				)}
			</div>

			{editMode && (
				<div className="d-flex justify-content-end gap-2 mt-4">
					<UIButton
						text="Cancel"
						variant="outlined"
						onClick={handleClose}
						sx={{
							borderRadius: "20px",
							padding: "6px 24px",
							fontSize: "16px",
							width: "max-content",
							textTransform: "capitalize !important",
						}}
					/>
					<UIButton
						text={loading ? "updating..." : "Update"}
						variant="contained"
						color="primary"
						onClick={handleUpdate}
						disabled={loading}
						sx={{
							borderRadius: "20px",
							padding: "6px 24px",
							fontSize: "16px",
							width: "max-content",
							textTransform: "capitalize !important",
						}}
					/>
				</div>
			)}
		</div>
	);
};
