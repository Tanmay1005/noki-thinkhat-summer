import { PlayArrow } from "@mui/icons-material";
import { Skeleton } from "@mui/material";
import { Box } from "@mui/material";
import { Checkbox } from "@mui/material";
import { GET_CIRCUITS_DETAILS } from "adapters/noki_ed.service";
import FallBackLoader from "components/FallbackLoader";
import Card from "components/ReusableComponents/Card";
import CollapsibleText from "components/ReusableComponents/CollapsibleText";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { convertHtmlToText } from "helpers/common_helper";
import { selectedCaseTextMap } from "helpers/constants";
import { imageByType } from "helpers/imageHelper";
import useDebounce from "hooks/useDebounce";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useCircuitHelpers from "../../helpers/circuit_helpers";

const StudentCircuitPage = ({
	filter,
	setCircuitFilter,
	circuitFilter,
	setFilter,
	searchTerm,
}) => {
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(0);
	const [pageLoader, setPageLoader] = useState(false);
	const [isPageReset, setIsPageReset] = useState(false);
	const [circuitList, setCircuitList] = useState([]);
	const [loading, setLoading] = useState(true);
	const auth = useSelector((state) => state?.auth?.personData);
	const [selectedModel, setSelectedModel] = useState("rolePlay");

	// const handleModelChange = (e) => {
	// 	setSelectedModel(e?.target?.value);
	// };
	const {
		findAttempt,
		createAttempt,
		getNextCase,
		nextLoader,
		startCircuitLoader,
		showDialog,
		setShowDialog,
		attemptDetails,
		selectedCases,
		handleSetSelectedCases,
	} = useCircuitHelpers();
	const pageSize = 4;
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const fetchCircuits = async (visibility = ["public"]) => {
		try {
			setPageLoader(true);
			const currentPage = isPageReset ? 0 : page;
			const response = await GET_CIRCUITS_DETAILS({
				visibility,
				isVisible: [true],
				page: currentPage,
				pageSize,
				...(debouncedSearchTerm && { filter: debouncedSearchTerm }),
			});
			const circuits = response?.data?.data;
			const DestructedCases = (circuits) => {
				return circuits.map((circuit) => {
					const cases = circuit.stations.reduce((acc, station) => {
						const updatedCases = station.cases.map((caseItem) => ({
							...caseItem,
							station_id: station?.id,
							station_type: station?.type,
						}));
						return acc.concat(updatedCases);
					}, []);

					return {
						...circuit,
						cases: cases,
					};
				});
			};
			const modifiedCircuits = DestructedCases(circuits);
			if (isPageReset) {
				setCircuitList(modifiedCircuits);
				setCircuitFilter(modifiedCircuits);
			} else {
				setCircuitList((prevState) => [...prevState, ...modifiedCircuits]);
				setCircuitFilter((prevState) => [...prevState, ...modifiedCircuits]);
			}
			setHasMore((page + 1) * pageSize < response?.data?.total);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
			setPageLoader(false);
		}
	};

	useEffect(() => {
		if (isPageReset) {
			setPage(0);
			setCircuitFilter([]);
			setCircuitList([]);
			fetchCircuits();
			setIsPageReset(false);
		} else if (page > 0) {
			fetchCircuits();
		}
	}, [page, isPageReset]);

	useEffect(() => {
		setIsPageReset(true);
	}, [debouncedSearchTerm]);

	useEffect(() => {
		if (filter && filter.length > 0) {
			const filtered = circuitFilter.filter(
				(item) => item,
				// filter.some((filterItem) => filterItem === item?.name),
			);
			setCircuitList(filtered);
		} else {
			setCircuitList(circuitFilter);
		}
	}, [filter]);

	useEffect(() => {
		return () => {
			setFilter([]);
		};
	}, []);
	const handleStartCircuit = async (circuit) => {
		await findAttempt(circuit, auth?.fhir_practitioner_id);
	};
	const handleSelectedCases = (event) => {
		const { checked, value } = event.target;
		handleSetSelectedCases(checked, value);
	};
	if (loading) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ height: "50vh" }}
			>
				<FallBackLoader />
			</div>
		);
	}

	return (
		<>
			<UIModal
				open={showDialog}
				handleClose={() => {
					setShowDialog(false);
					setSelectedModel("rolePlay");
				}}
				width={800}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						{attemptDetails?.attemptDetails?.length > 0 && (
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5 style={{ fontWeight: "bold" }}>
									{attemptDetails.attemptDetails[0].status === "in progress" &&
										"Continue the circuit?"}
									{attemptDetails.attemptDetails[0].status === "completed" &&
										"Retake the circuit?"}
									{/* {attemptDetails.attemptDetails[0].status === "discarded" &&
										"Retake the discarded circuit?"} */}
								</h5>
								<span style={{ textAlign: "center" }}>
									{attemptDetails.attemptDetails[0].status ===
										"in progress" && (
										<span>
											This circuit is already in progress. Do you want to
											continue?
										</span>
									)}
									{attemptDetails.attemptDetails[0].status === "completed" && (
										<span>
											This circuit is completed. Do you want to retake?
										</span>
									)}
									{attemptDetails.attemptDetails[0].status === "discarded" && (
										<h5 style={{ fontWeight: "bold" }}>
											This circuit is discarded.
										</h5>
									)}
								</span>
							</div>
						)}

						{attemptDetails?.attemptDetails?.length === 0 && (
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5 style={{ fontWeight: "bold" }}>Start the circuit?</h5>
								<span style={{ textAlign: "center" }}>
									Do you want to start the circuit?
								</span>
							</div>
						)}
						{/* <div className="d-flex flex-column align-items-center">
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
						</div> */}

						{
							<h5>
								{selectedCaseTextMap?.[
									attemptDetails?.attemptDetails?.[0]?.status
								] || "Select Cases to start"}
							</h5>
						}

						<div
							className="d-flex flex-wrap overflow-auto"
							style={{ maxHeight: "40vh" }}
						>
							{attemptDetails?.circuitDetails?.cases?.map((item) => (
								<div
									className="col-md-6  p-2"
									key={`student-circuit-page-circuit-2-${attemptDetails?.circuitDetails?.id}-${item?.id}`} // Must be unique as we are using index and case id
								>
									<Card
										item={item}
										name={item?.name}
										badgeText={item?.case_type}
										badgeText2={item?.station_type}
										jsx={
											<Checkbox
												value={`${item?.station_id}/${item?.id}`}
												onChange={handleSelectedCases}
												disabled={
													attemptDetails?.attemptDetails?.[0]?.status ===
													"in progress"
												}
												checked={selectedCases?.includes(
													`${item?.station_id}/${item?.id}`,
												)}
											/>
										}
									/>
								</div>
							))}
						</div>
					</div>

					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							className={`${
								attemptDetails?.attemptDetails?.[0]?.status === "in progress" &&
								"d-none "
							} rounded rounded-pill`}
							text={"cancel"}
							onClick={() => setShowDialog(false)}
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
						<UIButton
							className={`${
								(attemptDetails?.attemptDetails?.[0]?.status === "completed" ||
									attemptDetails?.attemptDetails?.[0]?.status === "discarded" ||
									attemptDetails?.attemptDetails?.length === 0) &&
								"d-none "
							} rounded rounded-pill`}
							text={nextLoader ? "loading... " : "Continue"}
							onClick={() =>
								getNextCase(
									attemptDetails?.attemptDetails?.[0],
									"continue",
									"public",
									selectedModel,
								)
							}
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							className="rounded rounded-pill"
							text={
								startCircuitLoader
									? "loading.."
									: attemptDetails?.attemptDetails?.length === 0
										? "ok"
										: (attemptDetails?.attemptDetails?.[0]?.status ===
												"in progress" &&
												"Discard & Retake") ||
											((attemptDetails?.attemptDetails?.[0]?.status ===
												"completed" ||
												attemptDetails?.attemptDetails?.[0]?.status ===
													"discarded") &&
												"Retake")
							}
							onClick={() =>
								createAttempt(
									auth?.fhir_practitioner_id,
									attemptDetails?.attemptDetails?.[0]?.status,
									"public",
									selectedModel,
								)
							}
							size="medium"
							variant="contained"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<InfiniteScroll
				setPage={setPage}
				hasMore={hasMore}
				isLoading={pageLoader}
				loader={<Loader />}
			>
				<div className="d-flex flex-column gap-3 m-4">
					{circuitList.length === 0 && !pageLoader ? (
						<div
							className="d-flex justify-content-center align-items-center"
							style={{ height: "50vh" }}
						>
							No circuits available
						</div>
					) : (
						circuitList.map((circuit, idx) => (
							<div
								key={`student-circuit-page-circuit-1-${circuit?.id}-${idx}`}
								className="rounded rounded-3 p-3 card-bg-secondary"
							>
								<div className=" w-100 d-flex justify-content-between align-items-center ">
									<CollapsibleText
										value={circuit?.name}
										type="tooltip"
										fontWeight={"bold"}
										maxLength={5}
										sx={{ fontSize: "1.2rem", fontWeight: 600 }}
									/>
									<UIButton
										text="Start Circuit"
										color="success"
										sx={{
											whiteSpace: "nowrap",
											width: "max-content",
											textTransform: "capitalize",
										}}
										endIcon={<PlayArrow />}
										onClick={() => handleStartCircuit(circuit)}
										disabled={circuit?.cases?.length === 0}
									/>
								</div>
								<div
									className="row p-0 m-2"
									// style={{ maxHeight: "250px", overflowY: "auto" }}
								>
									{circuit?.cases?.length === 0 ? (
										<div
											className="h-100 p-2  d-flex align-items-center justify-content-center text-muted"
											style={{ background: "white" }}
										>
											No cases available.
										</div>
									) : (
										<>
											{circuit?.cases.map((item) => (
												<div
													className="col-md-6 col-lg-4 p-2"
													key={`student-circuit-page-circuit-2-${circuit?.id}-${item?.id}`} // Must be unique as we are using index and case id
												>
													<Card
														cardImageClass={imageByType("Circuit", item)}
														item={item}
														name={item?.name}
														description={convertHtmlToText(item?.description)}
														badgeText={item?.case_type}
														badgeText2={item?.station_type}
													/>
												</div>
											))}
										</>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</InfiniteScroll>
		</>
	);
};

const Loader = () => (
	<Box className="d-flex flex-column gap-3 m-4">
		<Box
			className="rounded rounded-3 p-3 card-bg-secondary d-flex justify-content-center align-items-center gap-2"
			sx={{ height: "150px" }}
		>
			{[1, 2, 3].map((item) => (
				<Skeleton
					key={`InfiniteScroll-${item}`}
					variant="rectangular"
					width="32%"
					height="90%"
					className="col-md-6 col-lg-4 p-2 main-bg-color"
				/>
			))}
		</Box>
	</Box>
);
export default StudentCircuitPage;
