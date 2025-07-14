import { Checkbox, TextField, Typography } from "@mui/material";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import { convertHtmlToText } from "helpers/common_helper";
import { imageByType } from "helpers/imageHelper";
import useDebounce from "hooks/useDebounce";
import { setQuery, useQuery } from "hooks/useQuery";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	CREATE_CIRCUIT_WITH_BULK_CASES,
	GET_CASE_BY_STATION_TYPE,
} from "../../adapters/noki_ed.service";
import Card from "../ReusableComponents/Card";
import CommonProgress from "../ReusableComponents/Loaders";
import { UITabs } from "../ReusableComponents/Tabs";
import TabPanel from "../ReusableComponents/Tabs";
import UIButton from "../ReusableComponents/UIButton";
import UIModal from "../ReusableComponents/UIModal";
const pageSize = 24;
const OSCEPage = ({
	filter,
	setCaseFilter,
	setFilter,
	selection = false,
	handleClose = () => {},
	handleProceed = () => {},
	lockedCases = [],
	searchTerm,
}) => {
	const [casesList, setCasesList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [createCircuitMode, setCreateCircuitMode] = useState(selection);
	const [isPageReset, setIsPageReset] = useState(false);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(0);
	const [createLoading, setCreateLoading] = useState(false);
	const queryParams = useQuery();
	// const [showDialog, setShowDialog] = useState(false);
	// const [itemData, setItemData] = useState({});
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(0);
	const [pageLoader, setPageLoader] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const debouncedFilter = useDebounce(filter, 500);
	// const [selectedModel, setSelectedModel] = useState("rolePlay");
	const { data: stationList } = useSelector((state) => state.stations);
	// const handleModelChange = (e) => {
	// 	setSelectedModel(e?.target?.value);
	// };

	const {
		handleSubmit,
		control,
		reset,
		watch,
		formState: { errors },
	} = useForm();

	const navigate = useNavigate();
	const auth = useSelector((state) => state?.auth);

	useEffect(() => {
		if (!isEmpty(stationList) && value >= 0) {
			const stationType = stationList?.[value]?.id;
			if (isPageReset || page > 0) {
				getOSCEList(stationType);
				setIsPageReset(false);
			}
		}
	}, [value, stationList, page, isPageReset]);

	useEffect(() => {
		// getStations();
		return () => {
			reset();
		};
	}, []);

	// const getStations = async () => {
	// 	try {
	// 		setStationLoading(true);
	// 		const res = await GET_STATIONS_LIST();
	// 		setStationList(res?.data?.stations);
	// 	} catch (e) {
	// 		console.error(e);
	// 	} finally {
	// 		setStationLoading(false);
	// 	}
	// };

	const getOSCEList = async (stationType, visibility = ["public"]) => {
		try {
			// setLoading(true);
			setPageLoader(true);
			const response = await GET_CASE_BY_STATION_TYPE({
				stationType,
				visibility,
				page,
				pageSize,
				...(debouncedSearchTerm && { filter: debouncedSearchTerm }),
				...(debouncedFilter && { speciality: debouncedFilter }),
			});
			const cases = response?.data?.data;
			setCasesList((prev) => [...prev, ...cases]);
			setCaseFilter((prev) => [...prev, ...cases]);
			setHasMore((page + 1) * pageSize < response?.data?.count);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
			setPageLoader(false);
		}
	};

	// useEffect(() => {
	// 	if (filter && filter.length > 0) {
	// 		const filtered = caseFilter.filter((item) =>
	// 			filter.some((filterItem) => filterItem === item?.case_type),
	// 		);
	// 		setCasesList(filtered);
	// 	} else {
	// 		setCasesList(caseFilter);
	// 	}
	// }, [filter]);

	useEffect(() => {
		setPage(0);
		setCaseFilter([]);
		setCasesList([]);
		setIsPageReset(true);
	}, [debouncedSearchTerm, debouncedFilter]);

	useEffect(() => {
		return () => {
			setFilter([]);
		};
	}, []);

	const handleTabChange = (_event, newValue) => {
		setValue(newValue);
		setQuery("stationTab", newValue);
		setCaseFilter([]);
		setCasesList([]);
		setPage(0);
		setIsPageReset(true);
	};

	useEffect(() => {
		const stationTab = queryParams.get("stationTab");

		if (stationTab !== null && !Number.isNaN(Number(stationTab))) {
			setValue(Number(stationTab));
		} else {
			setValue(0);
		}
	}, [queryParams]);

	const toggleBuiltCircuit = () => {
		setCreateCircuitMode(!createCircuitMode);
	};

	const onSubmit = async (data) => {
		const payload = { circuit_name: "", circuit_description: "", stations: [] };
		for (const stationId of Object.keys(data?.stations)) {
			const tempObj = {};

			const selectedCases = Object.keys(
				data?.stations[stationId]?.cases,
			)?.filter((caseId) => data?.stations[stationId]?.cases[caseId]);

			if (selectedCases.length > 0) {
				tempObj.id = stationId;
				tempObj.cases = selectedCases;
				payload.stations.push(tempObj);
			}
		}
		payload.circuit_description = data?.circuit_description;
		payload.circuit_name = data?.circuit_name;

		try {
			setCreateLoading(true);
			const response = await CREATE_CIRCUIT_WITH_BULK_CASES(payload);

			if (response) {
				toast("Circuits Created Successfully");
				setOpen(false);
				setCreateCircuitMode(false);
				reset();
			}
		} catch (e) {
			console.error(e);
			toast.error("Circuits Creation Failed");
		} finally {
			setCreateLoading(false);
		}
	};

	const handleCancel = () => {
		setCreateCircuitMode(false);
		reset();
		handleClose();
	};

	const selectedStations = watch("stations") || {};

	let selectedCasesCount = 0;

	for (const station of Object.values(selectedStations)) {
		const cases = station?.cases ?? {};
		for (const isTrue of Object.values(cases)) {
			if (isTrue) {
				selectedCasesCount++;
			}
		}
	}

	selectedCasesCount = selectedCasesCount - lockedCases?.length;

	const handleProceedWithoutLockedCases = (stationsData) => {
		const filteredStations = Object.entries(stationsData)?.reduce(
			(acc, [stationId, stationData]) => {
				const filteredCases = Object.entries(stationData?.cases)
					?.filter(
						([caseId, isSelected]) =>
							isSelected && !lockedCases?.includes(caseId),
					)
					?.reduce((casesAcc, [caseId]) => {
						casesAcc[caseId] = true;
						return casesAcc;
					}, {});

				if (Object.keys(filteredCases).length > 0) {
					acc[stationId] = { ...stationData, cases: filteredCases };
				}
				return acc;
			},
			{},
		);

		handleProceed(filteredStations);
	};

	const handleOnClick = (item, singleStation) => {
		if (!selection && !auth?.isAdmin) {
			navigate(
				`/case/${item?.id}?stationId=${singleStation?.id}&osceType=station`,
			);
		}
	};
	// const handleStationStart = (item, singleStation) => {
	// 	navigate(`/case/${item?.id}?stationId=${singleStation?.id}&osceType=station`)
	// 	setItemData({
	// 		item: item,
	// 		singleStation: singleStation,
	// 	});
	// 	// setShowDialog(true);
	// };
	return (
		<div className="d-flex flex-column  h-100">
			{/* <UIModal
				open={showDialog}
				handleClose={() => {
					setShowDialog(false);
					setSelectedModel("rolePlay");
				}}
				width={400}
			>
				<div className="modal-content">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h5 style={{ fontWeight: "bold" }}>Are you sure ?</h5>
							<span style={{ display: "block", textAlign: "center" }}>
								Do you want to proceed with this case?
							</span>
							<h5 className="m-0 p-0 mt-2" style={{ fontWeight: "bold" }}>
								Model
							</h5>
							<FormControl>
								<RadioGroup
									row
									value={selectedModel}
									onChange={handleModelChange}
								>
									<FormControlLabel
										value="rolePlay"
										control={<Radio />}
										label="Role Play"
									/>
									<FormControlLabel
										value="virtualPatient"
										control={<Radio />}
										label="Virtual Patient"
									/>
								</RadioGroup>
							</FormControl>
						</div>
					</div>
					<div className="d-flex justify-content-center align-items-center mt-2 gap-2">
						<UIButton
							text="Cancel"
							onClick={() => {
								setShowDialog(false);
								setSelectedModel("rolePlay");
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
						<UIButton
							text="Ok"
							variant="contained"
							onClick={() =>
								handleOnClick(itemData?.item, itemData?.singleStation)
							}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal> */}
			<div className="d-flex gap-2 justify-content-between align-items-center flex-wrap">
				{/* <div>
					<div className="fs-3">OSCE Stations</div>
					<div
						style={{
							fontSize: "1rem",
						}}
					>
						Select your OSCE Station based on your Specialization!
					</div>
				</div> */}

				{auth?.isAdmin && (
					<div>
						<UIButton
							text="Built a Circuit"
							onClick={toggleBuiltCircuit}
							disabled={createCircuitMode}
						/>
					</div>
				)}
			</div>

			<div className="flex-grow-1 overflow-auto d-flex flex-column">
				<UIModal open={open} handleClose={handleClose} width={400}>
					<div className="d-flex flex-column p-3 gap-3">
						<Controller
							name="circuit_name"
							control={control}
							rules={{
								required: "*Circuit Name is Required",
							}}
							render={({ field }) => (
								<TextField {...field} label="Circuit Name" />
							)}
						/>
						{errors?.circuit_name && (
							<Typography color="error" variant="body2">
								{errors?.circuit_name?.message}
							</Typography>
						)}

						<Controller
							name="circuit_description"
							control={control}
							rules={{
								required: "*Circuit Description is Required",
							}}
							render={({ field }) => (
								<TextField {...field} label="Circuit Description" />
							)}
						/>
						{errors?.circuit_description && (
							<Typography color="error" variant="body2">
								{errors?.circuit_description?.message}
							</Typography>
						)}
						<div className="d-flex gap-3">
							<UIButton
								text="Proceed"
								onClick={handleSubmit(onSubmit)}
								disabled={createLoading}
								variant="contained"
							/>
							<UIButton
								text="Cancel"
								onClick={() => {
									setOpen(false);
								}}
								disabled={createLoading}
							/>
						</div>
					</div>
				</UIModal>

				{/* {stationLoading ? (
					<div
						className="d-flex justify-content-center align-items-center"
						style={{ height: "50vh" }}
					>
						<FallBackLoader />
					</div>
				) : ( */}
				<>
					<div>
						<UITabs
							tabList={stationList?.map((item) => item?.type)}
							handleTabChange={handleTabChange}
							value={value}
							disabled={loading || pageLoader}
						/>
					</div>
					<div className="flex-grow-1 overflow-auto">
						{stationList?.map((singleStation, idx) => {
							return (
								<TabPanel
									className="h-100 overflow-auto rounded-bottom-4"
									value={value}
									index={idx}
									key={`osce-page-tab-panel-${idx + 1}`} // Should be unique as we are using index
								>
									<InfiniteScroll
										key={singleStation?.id}
										setPage={setPage}
										hasMore={hasMore}
										isLoading={pageLoader}
										// loader={<Loader />}
									>
										{loading ? (
											<div className="h-100 d-flex align-items-center justify-content-center h-100">
												<CommonProgress />
											</div>
										) : casesList?.length === 0 && !pageLoader ? (
											<div
												className="d-flex align-items-center justify-content-center"
												style={{ height: "50vh" }}
											>
												No Data Found
											</div>
										) : (
											<div className="row p-0 m-0">
												{casesList?.map((item, idx) => (
													<div
														className="col-md-6 col-lg-4 p-2"
														key={`osce-page-filtered-cases-${item?.id}-${idx}`} // Should be unique as we are using id and index
													>
														<Card
															cardImageClass={imageByType("Circuit", item)}
															item={item}
															actions={[
																{
																	handler: () => {
																		handleOnClick(item, singleStation);
																	},
																},
															]}
															name={item?.name}
															styles={{
																iconPlay: {
																	height: "2rem",
																},
															}}
															description={convertHtmlToText(item?.description)}
															badgeText={item?.case_type}
															jsx={
																createCircuitMode ? (
																	<Controller
																		name={`stations.${singleStation?.id}.cases.${item?.id}`}
																		control={control}
																		defaultValue={lockedCases.includes(
																			item?.id,
																		)}
																		render={({ field }) => (
																			<Checkbox
																				{...field}
																				checked={field.value}
																				disabled={lockedCases.includes(
																					item?.id,
																				)}
																			/>
																		)}
																	/>
																) : (
																	<></>
																)
															}
														/>
													</div>
												))}
											</div>
										)}
									</InfiniteScroll>
								</TabPanel>
							);
						})}
					</div>
					{createCircuitMode && (
						<div className="d-flex justify-content-center">
							<div className="rounded-3 border d-flex justify-content-between align-items-center gap-5 p-3 mt-2">
								<div>{selectedCasesCount} Selected</div>
								<div className="d-flex align-items-center gap-2">
									<div>
										<UIButton text="Cancel" onClick={handleCancel} />
									</div>
									<div>
										<UIButton
											text="Next"
											variant="contained"
											onClick={() => {
												if (selection) {
													handleSubmit((data) =>
														handleProceedWithoutLockedCases(data?.stations),
													)();
												} else {
													setOpen(true);
												}
											}}
											disabled={!selectedCasesCount}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</>
				{/* )} */}
			</div>
		</div>
	);
};
export default OSCEPage;

// const filteredCaseList = (caseList, filterState) => {
// 	return caseList?.filter(
// 		(item) =>
// 			!filterState ||
// 			isEmpty(filterState) ||
// 			filterState.includes(item?.case_type),
// 	);
// };
