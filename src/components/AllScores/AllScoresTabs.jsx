// import { Tune } from "@mui/icons-material";
import { Tab, Tabs } from "@mui/material";
import {
	FIND_MULTI_STATION_ATTEMPT,
	GET_ATTEMPTED_CASES,
	GET_CASE_BY_PATIENT,
	GET_CASE_SCORE_BY_ID,
} from "adapters/noki_ed.service";
import FallBackLoader from "components/FallbackLoader";
import FeedBackScoreComponent from "components/FeedbackScoreRightDrawer/FeedBackScoreComponent";
import FeedBackScoreWrapper from "components/FeedbackScoreRightDrawer/FeedBackScoreWrapper";
import AllScoreCircuitCard from "components/OSCETraining/AllScoreCircuitCard";
import AllScoresCasesCard from "components/ReusableComponents/AllScoresCard";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import RowLoader from "components/ReusableComponents/RowLoader";
// import Filter from "components/ReusableComponents/Filter";
import TabPanel, {
	a11yProps,
	UITabs,
} from "components/ReusableComponents/Tabs";
// import UIButton from "components/ReusableComponents/UIButton";
import { imageByType } from "helpers/imageHelper";
import { setQuery, useQuery } from "hooks/useQuery";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";
import { getStations } from "../../redux/thunks/stations.js";

const AllScoresTabs = ({
	practitionerId: propPractitionerId,
	setOpenScores,
}) => {
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const [openFeedback, setFeedbackOpen] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const [pageToken, setPageToken] = useState(null);
	const [pageLoader, setPageLoader] = useState(false);
	const pageSize = 20;
	const authPractitionerId = useSelector(
		(state) => state?.auth?.personData?.fhir_practitioner_id,
	);
	const practitionerId = propPractitionerId || authPractitionerId;
	const [selectedFeedback, setSelectedFeedback] = useState([]);
	const queryParams = useQuery();
	const navigate = useNavigate();
	const { data: stationList, stationMap } = useSelector(
		(state) => state.stations,
	);
	const reduxDispatch = useDispatch();

	const [value, setValue] = useState(0);
	// const [filter, setFilter] = useState([]);
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState({
		case: [],
		station: [],
		multiStationCases: [],
	});
	const [circuits, setCircuits] = useState([]);
	const tabs = ["case", "station", "circuits", "multiStationCases"];
	const [caseValue, setCaseValue] = useState(0);

	const toggleCaseChange = (_event, newValue) => {
		setCaseValue(newValue);
		handleTabChange(_event, 0);
	};

	const handleTabChange = (_event, newValue) => {
		setLoading(true);
		setData({
			case: [],
			station: [],
			multiStationCases: [],
		});
		setCircuits([]);
		setHasMore(false);
		setPageToken(null);
		setPage(0);
		setValue(newValue);
		setQuery("tab", newValue);
	};

	useEffect(() => {
		const tab = queryParams.get("tab");

		const tabValue = Number(tab);

		if (!Number.isNaN(tabValue) && tabValue >= 0) {
			setValue(tabValue);
			setQuery("tab", tabValue);
		} else {
			setValue(0);
			setQuery("tab", 0);
		}
		if (!stationList) {
			reduxDispatch(getStations());
		}
	}, [queryParams]);

	const handleClose = () => {
		if (typeof setOpenScores === "function") {
			setOpenScores(false);
			setValue(0);
			setQuery("tab", 0);
		} else {
			navigate(-1);
		}
	};

	const handleButtonClick = (data) => {
		navigate(`/feedback?scoreId=${data?.resource?.id}`, {
			state: { navigateTo: -1, data: data },
		});
	};

	const handleCardClick = (circuitData) => {
		setSelectedFeedback(circuitData);
		setFeedbackOpen(true);
	};

	function getStationType(data) {
		const stationDetails = data?.find(
			(item) => item.linkId === "stationDetails",
		);
		if (stationDetails?.answer && stationDetails?.answer?.length > 0) {
			try {
				const valueString = stationDetails?.answer?.[0]?.valueString;
				const parsedValue = JSON.parse(valueString);
				return parsedValue.type;
			} catch (error) {
				console.error("Error parsing valueString:", error);
				return null;
			}
		}
		return null;
	}

	const getAllCaseScoresList = async (practitionerId, type) => {
		try {
			// setLoading(true);
			setPageLoader(true);
			const query = {
				practitionerId,
				type,
				count: pageSize,
				...(pageToken && { pageToken }),
			};

			if (type === "multiStationCases") {
				query.type = "multi-station-case";
			}

			const response = await GET_CASE_SCORE_BY_ID(query);
			const token = response?.data?.pageToken;
			setHasMore(token || false);
			setPageToken(token);
			const filteredQuestionnaireResponses = response?.data?.entries?.filter(
				(entry) => !entry?.resource?.text,
			);
			const reducedQuestionnaire = filteredQuestionnaireResponses?.reduce(
				(acc, curr) => {
					const patientURL = curr.resource.subject?.reference?.split("/");
					const patientURLLength = patientURL?.length;
					const patientId = patientURL[patientURLLength - 1];
					if (acc.questionnaireResponses) {
						acc.questionnaireResponses.push({
							...curr,
							patientId,
						});
					} else {
						acc.questionnaireResponses = [
							{
								...curr,
								patientId,
							},
						];
					}
					if (acc.patientIds) {
						acc.patientIds.push(patientId);
					} else {
						acc.patientIds = [patientId];
					}
					return acc;
				},
				{},
			);
			const uniquePatientIds = Array.from(
				new Set(reducedQuestionnaire?.patientIds),
			);
			if (uniquePatientIds.length === 0) {
				setLoading(false);
				return;
			}

			const caseDetails = await GET_CASE_BY_PATIENT({
				patientIds: uniquePatientIds,
			});
			const casesByQuestionnaireId = caseDetails?.data?.cases?.reduce(
				(acc, caseItem) => {
					acc[caseItem.fhir_patient_id] = caseItem;
					return acc;
				},
				{},
			);
			const questionnaireCaseResponse =
				reducedQuestionnaire?.questionnaireResponses?.map(
					(questionnaireResponse) => {
						return {
							...questionnaireResponse,
							caseDetails:
								casesByQuestionnaireId?.[questionnaireResponse.patientId],
						};
					},
				);

			setData((prev) => ({
				...prev,
				[type]: [...prev[type], ...questionnaireCaseResponse],
			}));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
			setPageLoader(false);
		}
	};

	useEffect(() => {
		if (value === 0) {
			if (caseValue === 0) {
				getAllCaseScoresList(practitionerId, "case");
			} else {
				getAttemptedMultiStationCases(practitionerId);
			}
		} else if (value === 1) {
			getAllCaseScoresList(practitionerId, "station");
		} else if (value === 2) {
			getAttemptedCases(practitionerId);
		}
	}, [value, caseValue, page]);

	const getAttemptedCases = async (
		practitionerId,
		attemptType = "public",
		status = "completed",
		pageSize = 8,
	) => {
		try {
			setPageLoader(true);
			const query = {
				practitionerId,
				page,
				pageSize,
				attemptType,
				status,
			};
			const response = await GET_ATTEMPTED_CASES(query);
			const data = response?.data?.data;
			const ans = [];
			data.map((item) => {
				if (filterStationsWithEmptyCases(item)) {
					ans.push(item);
				}
			});
			setCircuits((prev) => [...prev, ...ans]);
			setHasMore((page + 1) * pageSize < response?.data?.count);
		} catch (error) {
			console.error(error);
		} finally {
			setPageLoader(false);
			setLoading(false);
		}
	};
	const getAttemptedMultiStationCases = async (
		practitionerId,
		attemptType = "public",
		status = "completed",
		pageSize = 8,
	) => {
		try {
			setPageLoader(true);
			const query = {
				practitionerId,
				page,
				pageSize,
				attemptType,
				status,
			};
			const response = await FIND_MULTI_STATION_ATTEMPT(query);
			const data = response?.data?.data;
			let type = tabs[value];
			// if tab is "case" and subtab is multistation
			if (type === tabs[0] && caseValue === 1) {
				type = tabs[3];
			}
			setData((prev) => ({
				...prev,
				[type]: [...prev[type], ...data],
			}));
			setHasMore((page + 1) * pageSize < response?.data?.count);
		} catch (error) {
			console.error(error);
		} finally {
			setPageLoader(false);
			setLoading(false);
		}
	};

	const extractFirstCaseAndCount = (stations) => {
		const stationType = stations?.[0]?.type;
		if (!Array.isArray(stations) || stations.length === 0) {
			return { firstCase: null, remainingCount: 0, type: stationType };
		}

		const allCases = stations.flatMap((station) => station.cases || []);

		if (allCases.length === 0) {
			return { firstCase: null, remainingCount: 0, type: stationType };
		}

		const firstCase = allCases[0];
		const remainingCount = allCases.length > 1 ? allCases.length - 1 : 0;

		return { firstCase, remainingCount, type: stationType };
	};
	const filterStationsWithEmptyCases = (circuitDetails) => {
		const stations = circuitDetails?.circuit?.stations;
		let i = 0;
		while (i < stations.length) {
			const cases = stations[i].cases;
			if (cases.length === 0) {
				stations.splice(i, 1);
				i--;
			}
			i++;
		}
		return circuitDetails?.circuit?.stations.length > 0;
	};
	return (
		<>
			<div className="m-4 ">
				<div className="d-flex justify-content-between  align-items-center">
					<div>
						<img
							src={GoBackIcon}
							alt="loading.."
							onClick={handleClose}
							onKeyUp={(e) => {
								if (e.key === "Enter") handleClose();
							}}
							style={{ cursor: "pointer" }}
						/>
						<span style={{ color: textColor, marginLeft: "5px" }}>Go Back</span>
					</div>

					{/* <Filter
						list={[
							{ value: "admin", label: "Admin" },
							{ value: "student", label: "Student" },
						]}
						handleFilter={(item) => {
							setFilter(item);
						}}
						buttonComponent={<UIButton text="Filters" endIcon={<Tune />} />}
						selectedItem={filter}
						isMultiSelect={true}
						clearSelection={() => setFilter([])}
					/> */}
				</div>
				<CreateWrapper open={openFeedback}>
					<FeedBackScoreWrapper setFeedbackOpen={setFeedbackOpen}>
						<FeedBackScoreComponent
							data={selectedFeedback}
							isMultiStation={value === 0}
						/>
					</FeedBackScoreWrapper>
				</CreateWrapper>
				<div className="d-flex justify-content-center  align-items-center mt-2">
					<Tabs
						value={value}
						onChange={handleTabChange}
						aria-label="basic tabs example"
						variant="fullWidth"
						sx={{
							backgroundColor: "#F7F5FB",
							borderRadius: "35px",
							width: "fit-content",
							padding: "0px",
							wordBreak: "keep-all",
							"& .MuiButtonBase-root": {
								// minWidth
							},
						}}
						TabIndicatorProps={{ style: { display: "none" } }}
					>
						{[
							{ label: "Cases" },
							{ label: "Stations" },
							{ label: "Circuits" },
							// { label: "Multi Station Cases" },
						].map((tab, index) => (
							<Tab
								key={`tab-${tab.label}-${index}`} // Unique key for each tab
								label={tab.label}
								{...a11yProps(index)}
								disabled={loading || pageLoader}
								sx={{
									fontWeight: 500,
									fontSize: "14px",
									textTransform: "capitalize",

									"&.Mui-selected": {
										backgroundColor: textColor,
										color: "white",
										"&:hover": {
											backgroundColor: textColor,
										},
										borderRadius: "35px",
									},
									minWidth: "fit-content",
								}}
							/>
						))}
					</Tabs>
				</div>
				{loading ? (
					<div
						className="d-flex justify-content-center align-items-center"
						style={{ height: "50vh" }}
					>
						<FallBackLoader />
					</div>
				) : (
					<div className="mt-2 h-100">
						<TabPanel
							value={value}
							index={0}
							style={{
								height: "100%",
							}}
						>
							<UITabs
								tabList={["Single Station Cases", "Full Cases"]}
								handleTabChange={toggleCaseChange}
								value={caseValue}
								className="border-0"
								sx={{
									fontSize: "14px",
								}}
							/>
							{caseValue === 0 ? (
								<InfiniteScroll
									setPage={setPage}
									hasMore={hasMore}
									isLoading={pageLoader}
									loader={<RowLoader />}
								>
									{data?.case?.length === 0 && !loading ? (
										<div
											className="d-flex justify-content-center align-items-center"
											style={{ height: "50vh" }}
										>
											No Scores Available
										</div>
									) : (
										<div className="row">
											{data?.case?.map((card, index) => (
												<div
													key={`${card?.caseDetails?.id}-${index}`}
													className="col-12 col-md-6 col-lg-6 my-3"
												>
													<AllScoresCasesCard
														imageSrc={imageByType("cases", card?.caseDetails)}
														altText={card.altText}
														title={card?.caseDetails?.name}
														description={card?.caseDetails?.description}
														onButtonClick={() => handleButtonClick(card)}
														applicableTypeText={getStationType(
															card?.resource?.item,
														)}
														completedDate={card?.resource?.meta?.lastUpdated}
													/>
												</div>
											))}
										</div>
									)}
								</InfiniteScroll>
							) : (
								<InfiniteScroll
									setPage={setPage}
									hasMore={hasMore}
									isLoading={pageLoader}
									loader={<RowLoader />}
								>
									{data?.multiStationCases?.length === 0 && !loading ? (
										<div
											className="d-flex justify-content-center align-items-center"
											style={{ height: "50vh" }}
										>
											No Scores Available
										</div>
									) : (
										<div className="row">
											{data?.multiStationCases?.map((card, index) => (
												<div
													key={`${card?.caseDetails?.id}-${index}`}
													className="col-12 col-md-6 col-lg-6 mb-3"
												>
													<AllScoreCircuitCard
														cardImageClass={imageByType("cases", card?.case)}
														circuitName={
															stationMap[card.case.applicable_types[0]]?.type
														}
														firstCase={card.case}
														stationType={
															stationMap[card.case.applicable_types[0]]?.type
														}
														remainingCount={
															card.case.applicable_types?.length - 1
														}
														onButtonClick={() => handleCardClick(card)}
														date={card?.updated_at}
													/>
												</div>
											))}
										</div>
									)}
								</InfiniteScroll>
							)}
						</TabPanel>
						<TabPanel
							value={value}
							index={1}
							style={{
								height: "100%",
							}}
						>
							<InfiniteScroll
								setPage={setPage}
								hasMore={hasMore}
								isLoading={pageLoader}
								loader={<RowLoader />}
							>
								{data?.station?.length === 0 ? (
									<div
										className="d-flex justify-content-center align-items-center"
										style={{ height: "50vh" }}
									>
										No Scores Available
									</div>
								) : (
									<div className="row">
										{data?.station?.map((card, index) => (
											<div
												key={`${card?.caseDetails?.id}-${index}`}
												className="col-12 col-md-6 col-lg-6 mb-3"
											>
												<AllScoresCasesCard
													imageSrc={imageByType("Station", card?.caseDetails)}
													altText={card.altText}
													title={card?.caseDetails?.name}
													description={card?.caseDetails?.description}
													onButtonClick={() => handleButtonClick(card)}
													applicableTypeText={getStationType(
														card?.resource?.item,
													)}
													completedDate={card?.resource?.meta?.lastUpdated}
												/>
											</div>
										))}
									</div>
								)}
							</InfiniteScroll>
						</TabPanel>
						<TabPanel
							value={value}
							index={2}
							style={{
								height: "100%",
							}}
						>
							<InfiniteScroll
								setPage={setPage}
								hasMore={hasMore}
								isLoading={pageLoader}
								loader={<RowLoader />}
							>
								{circuits?.length === 0 ? (
									<div
										className="d-flex justify-content-center align-items-center"
										style={{ height: "50vh" }}
									>
										No Scores Available
									</div>
								) : (
									<div className="row  h-100">
										{circuits?.map((item, idx) => {
											const { firstCase, remainingCount, type } =
												extractFirstCaseAndCount(item?.circuit?.stations);

											const firstCaseDetail = item?.circuit?.stations?.find(
												(station) => station.cases?.length,
											)?.cases?.[0];

											return (
												<div
													className="col-12 col-md-6 col-lg-6 mb-3"
													key={`student-case-list-case-id-${item?.id}-${idx}`}
												>
													<AllScoreCircuitCard
														cardImageClass={imageByType(
															"cases",
															firstCaseDetail,
														)}
														circuitName={item}
														firstCase={firstCase}
														stationType={type}
														remainingCount={remainingCount}
														onButtonClick={() => handleCardClick(item)}
														date={item?.updated_at}
													/>
												</div>
											);
										})}
									</div>
								)}
							</InfiniteScroll>
						</TabPanel>
					</div>
				)}
			</div>
		</>
	);
};

export default AllScoresTabs;
