import {
	Box,
	Checkbox,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import {
	CREATE_REQUEST_EXTENSION,
	GET_ATTEMPTED_CASES,
	GET_COMPLETED_CASE_ASSIGNMENTS,
	GET_COMPLETED_MULTI_STATION_CASE_ASSIGNMENTS,
	GET_INPROGRESS_ASSIGNMENTS,
	GET_OVERDUE_ASSIGNMENTS,
	GET_TODO_ASSIGNMENTS,
	// GET_ATTEMPT_BY_ID,
} from "adapters/noki_ed.service";
import FallBackLoader from "components/FallbackLoader";
import FeedBackScoreComponent from "components/FeedbackScoreRightDrawer/FeedBackScoreComponent";
import FeedBackScoreWrapper from "components/FeedbackScoreRightDrawer/FeedBackScoreWrapper";
import AllScoreCircuitCard from "components/OSCETraining/AllScoreCircuitCard";
import AllScoresCasesCard from "components/ReusableComponents/AllScoresCard";
import Card from "components/ReusableComponents/Card";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import RowLoader from "components/ReusableComponents/RowLoader";
import TabPanel, {
	a11yProps,
	UITabs,
} from "components/ReusableComponents/Tabs";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import useCircuitHelpers from "helpers/circuit_helpers";
import { convertHtmlToText } from "helpers/common_helper";
import { imageByType } from "helpers/imageHelper";
import useMultiStationCase from "hooks/useMultiStationCase";
import useTabsHook from "hooks/useTabsHook";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import emptyPage from "../../assets/Empty Page.svg";
import { getStations } from "../../redux/thunks/stations.js";
import CaseCard from "./CaseCard";
import MultiStationCaseSelectionModal from "./MultiStationCaseSelectionModal";
const pageSize = 18;
const mapStationCase = (data) => {
	return data?.map(
		({
			station,
			case: {
				id,
				name,
				description,
				case_type,
				fhir_practitioner_id,
				visibility,
			},
		}) => {
			return {
				id,
				name,
				description,
				case_type,
				fhir_practitioner_id,
				visibility,
				station_id: station.id,
				station_type: station.type,
			};
		},
	);
};
const useTestData = (showAllData = false, assessmentType = "circuit") => {
	const uniqueData = useRef([]);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [pageLoader, setPageLoader] = useState(false);

	const fetchData = async (apiCall, params) => {
		try {
			// setLoading(true);
			if (params?.status !== "completed" && params?.groupIds?.length === 0) {
				return;
			}
			setPageLoader(true);
			const response = await apiCall(params);
			if (response?.data) {
				if (showAllData) {
					setData((prev) => [...prev, ...response.data.data]);
				} else {
					if (assessmentType === "circuit") {
						response?.data?.data?.map((item) => {
							if (
								!uniqueData.current.some(
									(existingItem) => existingItem.circuit.id === item.circuit.id,
								)
							) {
								uniqueData.current.push(item);
							}
						});
					} else {
						response?.data?.data?.map((item) => {
							const existingIndex = uniqueData.current.findIndex(
								(existingItem) => existingItem.case_id === item.case_id,
							);

							if (existingIndex === -1) {
								uniqueData.current.push(item);
							} else {
								// in the unique data we will have only max_end_time
								const existingEndTime = new Date(
									uniqueData.current[existingIndex].end_time,
								);
								const newEndTime = new Date(item.end_time);

								if (newEndTime > existingEndTime) {
									uniqueData.current[existingIndex] = item;
								}
							}
						});
					}
					setData([...uniqueData.current]);
				}
				setHasMore((page + 1) * pageSize < response?.data?.count);
			}
		} catch (error) {
			console.error("API Error:", error);
			toast.error("Failed fetching data");
		} finally {
			setLoading(false);
			setPageLoader(false);
		}
	};
	const reset = () => {
		setData([]);
		uniqueData.current = [];
		setHasMore(false);
		setLoading(true);
		setPage(0);
	};
	return {
		data,
		loading,
		fetchData,
		pageLoader,
		setPage,
		hasMore,
		page,
		reset,
		setData,
	};
};

const TabContent = ({
	loading,
	data,
	groupIds,
	identifier,
	onButtonClick,
	handleDate,
	infiniteScroll,
	assessmentType,
	isMultiStation,
}) => {
	const { setPage, pageLoader, hasMore } = infiniteScroll;
	if (loading) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ height: "50vh", overflow: "hidden" }}
			>
				<FallBackLoader />
			</div>
		);
	}
	if (groupIds && groupIds.length === 0 && identifier !== "completed") {
		return (
			<div
				className="d-flex justify-content-center align-items-center flex-column"
				style={{ height: "50vh" }}
			>
				<img
					src={emptyPage}
					alt="No-group"
					style={{ width: "33%", maxWidth: "500px" }}
				/>
				<Typography sx={{ color: "red" }}>
					Looks like you are not associated with any group. Please contact your
					administrator.
				</Typography>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div
				className="d-flex justify-content-center align-items-center flex-column"
				style={{ height: "50vh" }}
			>
				<img
					src={emptyPage}
					alt="No-group"
					style={{ width: "33%", maxWidth: "500px" }}
				/>
				<Typography>No Results found</Typography>
			</div>
		);
	}

	return (
		<InfiniteScroll
			setPage={setPage}
			hasMore={hasMore}
			isLoading={pageLoader}
			loader={<RowLoader />}
		>
			<div className="row h-100">
				{assessmentType === "circuit" ? (
					<TestCircuits
						data={data}
						onButtonClick={onButtonClick}
						identifier={identifier}
						handleDate={handleDate}
					/>
				) : (
					<TestCases
						data={data}
						onButtonClick={onButtonClick}
						identifier={identifier}
						handleDate={handleDate}
						isMultiStation={isMultiStation}
					/>
				)}
			</div>
		</InfiniteScroll>
	);
};
const TestCircuits = ({ data, identifier, onButtonClick, handleDate }) => {
	return data?.map((data, index) => (
		<div key={data.id} className="col-12 col-md-6 col-lg-6 mb-3">
			<AllScoreCircuitCard
				cardImageClass={imageByType(
					"cases",
					data?.circuit?.circuit_station_cases?.[0]?.case?.case_type ||
						data?.circuit?.stations?.[0]?.cases?.[0],
				)}
				identifier={identifier}
				circuitName={data}
				firstCase={
					data?.circuit?.circuit_station_cases?.[0]?.case ||
					data?.circuit?.stations?.[0]?.cases?.[0]
				}
				stationType={
					data?.circuit?.circuit_station_cases?.[0]?.station?.type ||
					data?.circuit?.stations?.[0]?.type
				}
				remainingCount={
					(data?.circuit?.circuit_station_cases?.length ||
						data?.circuit?.stations?.length) - 1
				}
				onButtonClick={() => onButtonClick(data, index)}
				date={
					identifier === "completed"
						? data?.updated_at
						: handleDate(data?.circuit)
				}
			/>
		</div>
	));
};

const TestCases = ({ data, identifier, onButtonClick, isMultiStation }) => {
	const stationMap = useSelector((state) => state.stations?.stationMap);

	const getLatestEndTime = (caseDetails) => {
		const initialTime = dayjs(caseDetails?.end_time);
		const extendedTimes = caseDetails?.case?.request_extensions
			?.map((item) => item.extended_time)
			.filter(Boolean)
			.map((time) => dayjs(time));

		if (extendedTimes?.length) {
			const latest = extendedTimes.reduce(
				(max, curr) => (curr.isAfter(max) ? curr : max),
				extendedTimes[0],
			);
			return latest.isAfter(initialTime) ? latest : initialTime;
		}
		return initialTime;
	};

	const dateHandler = (date) => {
		if (!date || !dayjs(date).isValid()) return { footerText: "" };

		if (identifier === "overdue") {
			const daysDiff = dayjs().diff(date, "day");
			return {
				footerText: `Overdue: ${daysDiff} ${daysDiff > 1 ? "days" : "day"}`,
				styles: { footerText: { color: "red" } },
			};
		}
		return { footerText: `Due Date: ${dayjs(date).format("MM/DD/YYYY")}` };
	};

	return data?.map((caseDetails, index) => {
		const latestEndTime = getLatestEndTime(caseDetails);

		return (
			<div key={caseDetails?.case?.id} className="col-md-6 col-lg-6 p-2 mb-3">
				{identifier === "completed" && isMultiStation ? (
					<AllScoreCircuitCard
						cardImageClass={imageByType("cases", caseDetails.case)}
						circuitName={caseDetails.case.applicable_types[0]}
						firstCase={caseDetails.case}
						stationType={
							stationMap[caseDetails?.case?.applicable_types?.[0]]?.type
						}
						remainingCount={caseDetails.case.applicable_types?.length - 1}
						onButtonClick={() => onButtonClick(caseDetails)}
						date={caseDetails?.updated_at}
					/>
				) : identifier === "completed" ? (
					<AllScoresCasesCard
						key={caseDetails?.case?.id}
						imageSrc={imageByType("cases", caseDetails?.case)}
						altText={caseDetails?.case?.name}
						title={caseDetails?.case?.name}
						description={caseDetails?.case?.description}
						onButtonClick={() => onButtonClick(caseDetails)}
						applicableTypeText={
							stationMap[caseDetails?.case?.applicable_types?.[0]]?.type
						}
						assignedUser={
							caseDetails?.case?.test_assignments?.[0]?.assigned_by_user
						}
						completedDate={caseDetails?.updated_at}
						reviewStatus={caseDetails?.review_status}
					/>
				) : (
					<CaseCard
						key={caseDetails?.case?.id}
						cardImageClass={imageByType("cases", caseDetails?.case)}
						item={caseDetails?.case}
						caseDetails={caseDetails}
						name={caseDetails?.case?.name}
						description={convertHtmlToText(caseDetails?.case?.description)}
						badgeText={caseDetails?.case?.case_type}
						badgeText2={
							stationMap[caseDetails?.case?.applicable_types?.[0]]?.type
						}
						assignedUser={caseDetails?.assigned_by_user}
						isOverdue={identifier === "overdue"}
						overdueDate={latestEndTime.format("MM/DD/YYYY")}
						onButtonClick={(customCaseData) =>
							onButtonClick(customCaseData || caseDetails, index)
						}
						onClick={() => {
							onButtonClick(caseDetails?.case);
						}}
						isButtonDisplay={identifier !== "overdue"}
						{...dateHandler(latestEndTime)}
					/>
				)}
			</div>
		);
	});
};

const caseTypeTabList = ["single-station", "Full Case"];
const tabList = [
	["To Do", "Completed", "Overdue"],
	["To Do", "In progress", "Completed", "Overdue"],
];
const Tests = () => {
	const auth = useSelector((state) => state?.auth?.personData);
	const themeMode = useSelector((state) => state.app.theme);
	const stations = useSelector((state) => state.stations?.data);
	const practitionerId = auth?.fhir_practitioner_id;
	const groupIds = auth?.groups;
	const navigate = useNavigate();
	const reduxDispatch = useDispatch();
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [selectedModel, setSelectedModel] = useState("virtualPatient");
	const [feedbackOpen, setFeedbackOpen] = useState(false);
	// const [extensionData, setExtensionData] = useState(null);

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
	} = useCircuitHelpers();
	const {
		findAttempt: caseFindAttempt,
		showDialog: showCaseDialog,
		selectedModel: selectedCaseModel,
		setShowDialog: setShowCaseDialog,
		handleModelChange: handleCaseModelChange,
		attemptDetails: caseAttemptDetails,
		getNextStation,
		createAttempt: caseCreateAttempt,
		caseDetails: multiCaseDetails,
		nextLoading: nextStatonLoading,
	} = useMultiStationCase("private");

	const handleTabChange = (event, value) => {
		tab.handleTabChange(event, value);
		subTab.handleTabChange(event, 0);

		if (value === 0) {
			caseTypeTab.handleTabChange(event, 0);
		} else {
			caseTypeTab.handleTabRemove();
		}
	};

	const handleCaseTabChange = (event, value) => {
		caseTypeTab.handleTabChange(event, value);
		subTab.handleTabChange(event, 0);
	};

	const handleModelChange = (e) => {
		setSelectedModel(e?.target?.value);
	};

	const handleDate = (data) => {
		if (!data) return null;
		const filteredAssignments = data.test_assignments?.filter((item) =>
			groupIds.includes(item.group_id),
		);
		const assignmentEndDates =
			filteredAssignments?.map((item) => new Date(item.end_time)) || [];
		const extensionDates =
			data.request_extensions
				?.map((ext) => (ext.extended_time ? new Date(ext.extended_time) : null))
				.filter(Boolean) || [];
		const allDates = [...assignmentEndDates, ...extensionDates];
		if (allDates.length === 0) return null;
		const maxDate = allDates.reduce(
			(acc, curr) => (curr > acc ? curr : acc),
			new Date(0),
		);
		return maxDate;
	};

	const todoTest = useTestData();
	const inProgressTest = useTestData();
	const completedTest = useTestData(true);
	const overdueTest = useTestData();
	const todoCaseTest = useTestData(false, "case");
	const inProgressCaseTest = useTestData(false, "case");
	const completedCaseTest = useTestData(true, "case");
	const overdueCaseTest = useTestData(false, "case");
	const isTabDisabled =
		todoTest.pageLoader ||
		inProgressTest.pageLoader ||
		completedTest.pageLoader ||
		overdueTest.pageLoader ||
		todoCaseTest.pageLoader ||
		inProgressCaseTest.pageLoader ||
		completedCaseTest.pageLoader ||
		overdueCaseTest.pageLoader;
	const handleInprogressButtonClick = async (data) => {
		const cases = mapStationCase(data?.circuit?.circuit_station_cases);
		await findAttempt(
			{ ...data?.circuit, cases },
			auth?.fhir_practitioner_id,
			"private",
		);
	};
	const handleCaseInprogressButtonClick = async (data) => {
		await caseFindAttempt(data);
	};
	const handleToDoButtonClick = async (data) => {
		const cases = mapStationCase(data?.circuit?.circuit_station_cases);
		await findAttempt(
			{ ...data?.circuit, cases },
			auth?.fhir_practitioner_id,
			"private",
		);
	};
	const handleCompletedCircuitButtonClick = async (data) => {
		setSelectedCircuit(data);
		setFeedbackOpen(true);
	};
	const handleCompletedCaseButtonClick = async (data) => {
		navigate(`/feedback?caseId=${data?.case?.fhir_patient_id}&type=case`, {
			state: {
				practitionerId: data?.user?.fhir_practitioner_id,
				navigateTo: -1,
			},
		});
	};
	const handleOverdueButtonClick = async (data, index) => {
		try {
			const { circuit_name, case_name, assignerName, email, end_time } = data;
			const emailData = {
				studentName: auth?.name,
				circuitName: circuit_name,
				caseName: case_name,
				assignerName: assignerName,
				email: email,
				end_time: end_time,
			};
			const response = await CREATE_REQUEST_EXTENSION({
				...emailData,
				reason: data?.reason,
				fhir_practitioner_id: auth?.fhir_practitioner_id,
				case_id: data?.case_id,
				circuit_id: data?.circuit_id,
				test_assignment_id: data?.test_assignment_id,
			});
			if (response?.status === 201) {
				toast.success("Request sent successfully");
				const returnedExtensionData = response?.data?.returning?.[0];
				const test = data?.case_id ? overdueCaseTest : overdueTest;
				test.setData((prev) => {
					if (!Array.isArray(prev)) return [];
					const updatedData = [...prev];
					const item = updatedData[index];
					if (item?.circuit) {
						const extensionData = item.circuit.request_extensions || [];
						item.circuit.request_extensions = [
							returnedExtensionData,
							...extensionData,
						];
					} else if (item?.case) {
						const extensionData = item.case.request_extensions || [];
						item.case.request_extensions = [
							returnedExtensionData,
							...extensionData,
						];
					}
					return updatedData;
				});
			}
		} catch (error) {
			console.error("Failed to send request:", error);
		}
	};
	const resetPages = (identifier, value) => {
		// Resetting pages based on the identifier and value
		if (identifier === "tab") {
			if (value === 0) {
				tabPanels?.[value]?.[0]?.[0]?.provider.reset();
			} else {
				tabPanels?.[value]?.[0]?.provider.reset();
			}
			return;
		}
		if (identifier === "caseType") {
			tabPanels?.[tab.value]?.[value]?.[0]?.provider.reset();
			return;
		}
		if (identifier === "subTab") {
			if (tab.value === 0) {
				tabPanels?.[tab.value]?.[caseTypeTab.value]?.[value]?.provider.reset();
			} else {
				tabPanels?.[tab.value]?.[value]?.provider.reset();
			}
			return;
		}
	};
	const handleToDoCaseButtonClick = async (caseDetails) => {
		navigate(
			`/case/${caseDetails?.id}?stationId=${caseDetails?.applicable_types?.[0]}&osceType=case`,
			{ state: { visibility: "private" } },
		);
	};
	const handleMultiStationToDoCaseButtonClick = async (item) => {
		caseFindAttempt(item);
	};
	const tab = useTabsHook("tab", resetPages);
	const caseTypeTab = useTabsHook("caseType", resetPages);
	const subTab = useTabsHook("subTab", resetPages);
	useEffect(() => {
		if (auth?.fhir_practitioner_id) {
			const baseParams = {
				practitionerId,
				groupIds,
				pageSize,
			};
			let panelConfig;
			if (tab.value === 0) {
				panelConfig = tabPanels[tab.value]?.[caseTypeTab.value]?.[subTab.value];
			} else {
				panelConfig = tabPanels[tab.value]?.[subTab.value];
			}

			if (panelConfig) {
				const { identifier, provider, params, api } = panelConfig;
				provider.fetchData(api, {
					...(identifier !== "completed" && baseParams),
					...params,
					page: provider?.page,
				});
			}
		}
		if (!stations) {
			reduxDispatch(getStations());
		}
		if (!stations) {
			reduxDispatch(getStations());
		}
	}, [
		tab.value,
		subTab.value,
		caseTypeTab.value,
		auth?.fhir_practitioner_id,
		todoTest.page,
		todoCaseTest.page,
		inProgressCaseTest.page,
		completedCaseTest.page,
		overdueCaseTest.page,
		inProgressTest.page,
		completedTest.page,
		overdueTest.page,
	]);
	const tabPanels = [
		[
			[
				{
					identifier: "to-do",
					provider: todoCaseTest,
					handler: handleToDoCaseButtonClick,
					api: GET_TODO_ASSIGNMENTS,
					params: { assessmentType: "case" },
				},
				{
					identifier: "completed",
					provider: completedCaseTest,
					handler: handleCompletedCaseButtonClick,
					api: GET_COMPLETED_CASE_ASSIGNMENTS,
					params: {
						practitionerId,
						pageSize,
					},
				},
				{
					identifier: "overdue",
					provider: overdueCaseTest,
					handler: handleOverdueButtonClick,
					api: GET_OVERDUE_ASSIGNMENTS,
					params: { assessmentType: "case" },
				},
			],
			[
				{
					identifier: "to-do",
					provider: todoCaseTest,
					handler: handleMultiStationToDoCaseButtonClick,
					api: GET_TODO_ASSIGNMENTS,
					params: { assessmentType: "case", isMultiStation: true },
				},
				{
					identifier: "in-progress",
					provider: inProgressCaseTest,
					handler: handleCaseInprogressButtonClick,
					api: GET_INPROGRESS_ASSIGNMENTS,
					params: { assessmentType: "case" },
				},
				{
					identifier: "completed",
					provider: completedCaseTest,
					handler: handleCompletedCircuitButtonClick,
					api: GET_COMPLETED_MULTI_STATION_CASE_ASSIGNMENTS,
					params: {
						practitionerId,
						pageSize,
					},
				},
				{
					identifier: "overdue",
					provider: overdueCaseTest,
					api: GET_OVERDUE_ASSIGNMENTS,
					handler: handleOverdueButtonClick,
					params: { assessmentType: "case", isMultiStation: true },
				},
			],
		],
		[
			{
				identifier: "to-do",
				provider: todoTest,
				handler: handleToDoButtonClick,
				api: GET_TODO_ASSIGNMENTS,
			},
			{
				identifier: "in-progress",
				provider: inProgressTest,
				handler: handleInprogressButtonClick,
				api: GET_INPROGRESS_ASSIGNMENTS,
			},
			{
				identifier: "completed",
				provider: completedTest,
				handler: handleCompletedCircuitButtonClick,
				api: GET_ATTEMPTED_CASES,
				params: {
					practitionerId,
					attemptType: "private",
					status: "completed",
					pageSize,
				},
			},
			{
				identifier: "overdue",
				provider: overdueTest,
				handler: handleOverdueButtonClick,
				api: GET_OVERDUE_ASSIGNMENTS,
			},
		],
	];
	return (
		<>
			<CreateWrapper open={feedbackOpen}>
				<FeedBackScoreWrapper setFeedbackOpen={setFeedbackOpen}>
					<FeedBackScoreComponent
						data={selectedCircuit}
						isMultiStation={caseTypeTab.value === 1 && tab.value === 0}
					/>
				</FeedBackScoreWrapper>
			</CreateWrapper>
			<UIModal
				open={showDialog}
				handleClose={() => setShowDialog(false)}
				width={800}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						{attemptDetails?.attemptDetails?.length > 0 && (
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5 style={{ fontWeight: "bold" }}>
									{attemptDetails.attemptDetails[0].status === "in progress" &&
										"Continue the Test?"}
									{attemptDetails.attemptDetails[0].status === "completed" &&
										"Retake the Test?"}
									{/* {attemptDetails.attemptDetails[0].status === "discarded" &&
										"Retake the discarded circuit?"} */}
								</h5>
								<span style={{ textAlign: "center" }}>
									{attemptDetails.attemptDetails[0].status ===
										"in progress" && (
										<span>
											This test is already in progress. Do you want to continue?
										</span>
									)}
									{attemptDetails.attemptDetails[0].status === "completed" && (
										<span>This test is completed. Do you want to retake?</span>
									)}
									{attemptDetails.attemptDetails[0].status === "discarded" && (
										<h5 style={{ fontWeight: "bold" }}>
											This test is discarded.
										</h5>
									)}
								</span>
							</div>
						)}

						{attemptDetails?.attemptDetails?.length === 0 && (
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5 style={{ fontWeight: "bold" }}>Start the test?</h5>
								<span style={{ textAlign: "center" }}>
									Do you want to start the test?
								</span>
							</div>
						)}
						{/* {
										<h5>
											{selectedCaseTextMap?.[
												attemptDetails?.attemptDetails?.[0]?.status
											] || "Select Cases to start"}
										</h5>
									} */}
						<div className="d-flex flex-column align-items-center">
							<h5 className="m-0 p-0 mt-2" style={{ fontWeight: "bold" }}>
								Model
							</h5>
							<FormControl>
								<RadioGroup
									row
									value={selectedModel}
									onChange={handleModelChange}
								>
									{/* <FormControlLabel
										value="rolePlay"
										control={<Radio />}
										label="Role Play"
									/> */}
									<FormControlLabel
										value="virtualPatient"
										control={<Radio />}
										label="Virtual Patient"
									/>
								</RadioGroup>
							</FormControl>
						</div>
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
												disabled={true}
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
									"private",
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
									practitionerId,
									attemptDetails?.attemptDetails?.[0]?.status,
									"private",
									selectedModel,
								)
							}
							variant="contained"
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<MultiStationCaseSelectionModal
				showDialog={showCaseDialog}
				setShowDialog={setShowCaseDialog}
				attemptDetails={caseAttemptDetails}
				caseDetails={multiCaseDetails}
				handleModelChange={handleCaseModelChange}
				selectedModel={selectedCaseModel}
				getNextStation={getNextStation}
				createAttempt={caseCreateAttempt}
				loading={nextStatonLoading}
			/>
			<div className="d-flex flex-column" style={{ overflow: "hidden" }}>
				<div className="d-flex flex-column m-2">
					<div className="d-flex align-items-sm-center flex-column flex-sm-row gap-2">
						<div className="fs-3">OSCE&nbsp;Tests</div>
						<div className="justify-content-center d-flex w-100">
							<Tabs
								value={tab.value}
								onChange={handleTabChange}
								aria-label="basic tabs example"
								variant="fullWidth"
								sx={{
									backgroundColor: "#F7F5FB",
									borderRadius: "35px",
									width: 400,
									padding: "0px",
								}}
								TabIndicatorProps={{ style: { display: "none" } }}
							>
								{[{ label: "Cases" }, { label: "Circuits" }].map(
									(tab, index) => (
										<Tab
											key={`tab-${tab.label}-${index}`} // Unique key for each tab
											label={tab.label}
											{...a11yProps(index)}
											disabled={isTabDisabled}
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
											}}
										/>
									),
								)}
							</Tabs>
						</div>
					</div>
					<div
						className="d-flex flex-column gap-2 mt-2"
						style={{
							width: "100%",
							height: "calc(100vh - 120px)", // Adjust based on your header height
							overflow: "hidden",
						}}
					>
						{tab.value === 0 && (
							<Box>
								<UITabs
									scrollButtons={false}
									disabled={isTabDisabled}
									tabList={caseTypeTabList}
									handleTabChange={handleCaseTabChange}
									value={caseTypeTab.value}
									sx={{
										width: "max-content",
										marginLeft: { xs: "0", md: "24px" }, // Reduced margin
										justifyContent: { xs: "center", md: "flex-start" },
									}}
								/>
							</Box>
						)}
						<Box>
							<UITabs
								scrollButtons={false}
								disabled={isTabDisabled}
								tabList={
									tab.value === 0
										? tabList?.[caseTypeTab.value]
										: tabList[tab.value]
								}
								handleTabChange={subTab.handleTabChange}
								value={subTab.value}
								sx={{
									width: "max-content",
									marginLeft: { xs: "0", md: "24px" }, // Reduced margin
									justifyContent: { xs: "center", md: "flex-start" },
								}}
							/>
						</Box>
						<Box
							sx={{
								flexGrow: 1,
								overflowY: "auto",
								overflowX: "hidden",
								px: 2, // Add horizontal padding here instead of margins
							}}
						>
							{(tab.value === 0
								? tabPanels?.[tab.value][caseTypeTab.value]
								: tabPanels?.[tab.value]
							)?.map(({ provider, handler, identifier }, index) => (
								<TabPanel
									value={subTab.value}
									index={index}
									key={`${identifier}-${tab.value}-${subTab.value}`}
								>
									<TabContent
										loading={provider.loading}
										data={provider.data}
										groupIds={groupIds}
										identifier={identifier}
										onButtonClick={handler}
										handleDate={handleDate}
										assessmentType={tab.value === 0 ? "case" : "circuit"}
										isMultiStation={caseTypeTab.value === 1 && tab.value === 0}
										infiniteScroll={{
											pageLoader: provider.pageLoader,
											hasMore: provider.hasMore,
											setPage: provider.setPage,
										}}
									/>
								</TabPanel>
							))}
						</Box>
					</div>
				</div>
			</div>
		</>
	);
};
export default Tests;
