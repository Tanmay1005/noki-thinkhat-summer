import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import { GET_ALL_USER_GROUPS, GET_CASE_LIST } from "adapters/noki_ed.service";
import FallBackLoader from "components/FallbackLoader";
import Card from "components/ReusableComponents/Card";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CustomTextField from "components/ReusableComponents/CustomTextField";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import { convertHtmlToText, hasEditPrivileges } from "helpers/common_helper";
import { specializations } from "helpers/constants";
import { imageByType } from "helpers/imageHelper";
import useDebounce from "hooks/useDebounce";
import _ from "lodash";
import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStations } from "../../redux/thunks/stations";
import PrivateGroupAssignForm from "./PrivateGroupAssignForm";

const AdminCaseList = memo(
	({
		handleEditCase = () => {},
		_refreshData,
		visibilityState,
		isModal = false,
		_caseFilter,
		_setCaseFilter,
		refreshCaseList,
		setDisableActions,
		isMultiStation,
		isAssign = false,
		selected = [],
		onSelect,
	}) => {
		const userId = useSelector((state) => state?.auth?.personData?.id);
		const userRole = useSelector((state) => state?.auth?.personData?.role);
		const reduxDispatch = useDispatch();
		const { data: stationList } = useSelector((state) => state?.stations);
		const applicableType = stationList?.map((station) => ({
			label: station?.type,
			value: station?.id,
		}));
		const createdByOptions = [
			{ label: "Admin", value: "admin" },
			{ label: "Teaching Staff", value: "examiner" },
			{ label: "Self", value: userId },
		];
		const [casesList, setCasesList] = useState([]);
		// const [allCases, setAllCases] = useState([]);
		const [loading, setLoading] = useState(true);
		const [assign, setAssign] = useState(null);
		const [filterState, setFilterState] = useState({
			applicableType: "",
			caseType: "",
			createdBy: "",
		});
		const [searchTerm, setSearchTerm] = useState("");
		const debouncedSearchTerm = useDebounce(searchTerm, 500);
		const [hasMore, setHasMore] = useState(true);
		const [page, setPage] = useState(0);
		const [pageLoader, setPageLoader] = useState(false);
		const [groupsList, setGroupsList] = useState([]);
		const toggleSelect = (id) => {
			const updated = selected.includes(id)
				? selected.filter((item) => item !== id)
				: [...selected, id];
			onSelect(updated);
		};
		const handleChange = (name) => (event) => {
			setFilterState({
				...filterState,
				[name]: event.target.value,
			});
		};

		const handleSearchChange = (event) => {
			setSearchTerm(event.target.value.toLowerCase());
		};

		const pageSize = 30;
		const visibility = isModal
			? ["private"]
			: visibilityState && visibilityState.length >= 1
				? visibilityState
				: ["public", "private"];

		const fetchCases = async (visibilityParam = visibility, reset = false) => {
			try {
				setPageLoader(true);
				setDisableActions(true);
				const currentPage = reset ? 0 : page;
				const response = await GET_CASE_LIST({
					visibility: visibilityParam,
					pageSize,
					isMultiStationCase: isMultiStation,
					page: currentPage,
					...(debouncedSearchTerm && { filter: debouncedSearchTerm }),
					...(filterState.caseType && {
						speciality: [filterState.caseType],
					}),
					...(filterState.applicableType && {
						applicable_types: [filterState.applicableType],
					}),
					...(filterState.createdBy &&
						(filterState.createdBy === "admin" ||
						filterState.createdBy === "examiner"
							? { created_by_role: filterState.createdBy }
							: { created_by_id: userId })),
				});
				let cases = response?.data?.data || [];

				cases = cases.map((caseItem) => ({
					...caseItem,
					isEditable: hasEditPrivileges(
						caseItem?.CreatedByUser?.id,
						_?.capitalize(userRole),
						userId,
					),
				}));
				setCasesList((prev) => (reset ? cases : [...prev, ...cases]));
				setHasMore((currentPage + 1) * pageSize < response?.data?.count);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
				setPageLoader(false);
				setDisableActions(false);
			}
		};

		useEffect(() => {
			setPage(0);
			setCasesList([]);
			fetchCases(visibility, true);
			if (!stationList?.length) {
				reduxDispatch(getStations());
			}
		}, [
			debouncedSearchTerm,
			filterState,
			visibilityState,
			isModal,
			isMultiStation,
		]);

		useEffect(() => {
			if (page > 0) {
				fetchCases(visibility, false);
			}
		}, [page]);

		const getGroupList = async () => {
			try {
				const response = await GET_ALL_USER_GROUPS();
				setGroupsList(response?.data?.user_groups || []);
			} catch (e) {
				console.error(e);
			}
		};
		const handleCloseAssignmentModal = () => {
			setAssign(null);
		};
		const handleOpenAssignmentModal = (id) => {
			setAssign(id);
		};
		useEffect(() => {
			getGroupList();
		}, []);

		return (
			<>
				<CreateWrapper open={Boolean(assign)}>
					<PrivateGroupAssignForm
						case_id={assign}
						handleClose={handleCloseAssignmentModal}
						groupsList={groupsList}
						render={refreshCaseList}
						isCaseAssign={true}
					/>
				</CreateWrapper>
				<div className="d-flex flex-column">
					<div className="row p-0 m-0">
						<div
							className="position-sticky top-0 col-12 d-flex flex-wrap justify-content-end align-items-center m-0"
							style={{
								padding: "10px",
								backgroundColor: "white",
								zIndex: "1020",
							}}
						>
							<div className="d-flex flex-wrap gap-2 w-80">
								<div className="flex-grow-1">
									<TextField
										fullWidth
										variant="outlined"
										placeholder="Search for Case"
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
									/>
								</div>
								<div className="flex-grow-1">
									<CustomTextField
										label="Select Station Type"
										options={applicableType}
										value={filterState?.applicableType}
										onChange={handleChange("applicableType")}
										width="100%"
									/>
								</div>
								<div className="flex-grow-1">
									<CustomTextField
										label="Select Specialty"
										options={specializations}
										value={filterState?.caseType}
										onChange={handleChange("caseType")}
										width="100%"
									/>
								</div>
								<div className="flex-grow-1">
									<CustomTextField
										label="Created By"
										options={createdByOptions}
										value={filterState?.createdBy}
										onChange={handleChange("createdBy")}
										width="100%"
										isNone={false}
									/>
								</div>
							</div>
						</div>

						{loading ? (
							<div
								className="d-flex justify-content-center align-items-center"
								style={{ height: "50vh" }}
							>
								<FallBackLoader />
							</div>
						) : (
							<>
								<InfiniteScroll
									key="admin-case-list"
									setPage={setPage}
									hasMore={hasMore}
									isLoading={pageLoader}
								>
									{casesList?.length === 0 && !pageLoader ? (
										<div
											className="d-flex justify-content-center align-items-center"
											style={{ height: "50vh" }}
										>
											No Cases Available
										</div>
									) : (
										<>
											<div className="row p-0 m-0">
												{casesList?.map((item, idx) => {
													const actions = [];
													if (
														item?.visibility === "private" &&
														item?.isEditable
													) {
														actions.push({
															label:
																item?.test_assignments_count > 0
																	? "Assign to more groups"
																	: "Assign",
															handler: () =>
																handleOpenAssignmentModal(item?.id),
															badgeContent: item?.test_assignments_count,
															disabled: !item?.isEditable,
														});
													}
													if (item?.isEditable) {
														actions.push({
															label: "Edit",
															handler: handleEditCase(item?.id),
															disabled: !item?.isEditable,
														});
													} else {
														actions.push({
															label: "View",
															handler: handleEditCase(item?.id),
														});
													}
													return (
														<div
															className="col-md-6 col-lg-6 p-2"
															key={`admin-case-list-case-id${item?.id}-${idx}`} // Must be unique as we are using index and case id
														>
															<div className="d-flex align-items-center">
																{/* Checkbox aligned left and vertically centered */}
																{isAssign && (
																	<input
																		type="checkbox"
																		checked={selected.includes(item.id)}
																		onChange={() => toggleSelect(item.id)}
																		style={{
																			marginRight: "12px",
																			cursor: "pointer",
																			transform: "scale(1.2)",
																		}}
																	/>
																)}

																{/* Card content aligned to the right of checkbox */}
																<Card
																	description={convertHtmlToText(
																		item?.description,
																	)}
																	cardImageClass={imageByType("Circuit", item)}
																	cardClasses={
																		!item?.isEditable && "card-bg-disabled"
																	}
																	name={item?.name}
																	types={item?.applicable_types}
																	badgeText={item?.case_type}
																	badgeText2={item?.station_type}
																	createdBy={item?.CreatedByUser}
																	actions={!isAssign ? actions : null}
																/>
															</div>
														</div>
													);
												})}
											</div>
										</>
									)}
								</InfiniteScroll>
							</>
						)}
					</div>
				</div>
			</>
		);
	},
);

export default AdminCaseList;
