import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { isEmpty } from "lodash";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
	GET_STATIONS_LIST,
	GET_STATION_BY_ID,
} from "../../adapters/noki_ed.service";
import { removeQuery, setQuery, useQuery } from "../../hooks/useQuery";
import CommonProgress from "../ReusableComponents/Loaders";

const Stations = (_props) => {
	const [stationsList, setStationsList] = useState([]);
	const [selectedStation, setSelectedStation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const auth = useSelector((state) => state?.auth);
	const [selectedCase, setSelectedCase] = useState(false);
	const [listLoading, setListLoading] = useState(false);
	const navigate = useNavigate();
	const query = useQuery();
	const refs = useRef([]);

	useEffect(() => {
		const stationIdFromQuery = query?.get("station");
		if (stationIdFromQuery && stationsList) {
			const indexToExpand = stationsList?.findIndex(
				(f) => f?.id === stationIdFromQuery,
			);

			if (indexToExpand >= 0) {
				setExpanded(indexToExpand);
				getSingleStationDetails(stationIdFromQuery);
			}
		}
	}, [stationsList]);

	useEffect(() => {
		getStationsList();
	}, []);

	const getSingleStationDetails = async (id) => {
		setLoading(true);
		try {
			const response = await GET_STATION_BY_ID(
				`/${id}/${auth?.personData?.id}`,
			);
			setSelectedStation(response);
		} catch (error) {
			console.error("Error fetching selectedStation:", error);
		} finally {
			setLoading(false);
			refs.current[id]?.scrollIntoView({ behavior: "smooth" });
		}
	};

	const getStationsList = async () => {
		try {
			setListLoading(true);

			const response = await GET_STATIONS_LIST();

			setStationsList(response?.data?.stations);
		} catch (e) {
			console.error(e);
		} finally {
			setListLoading(false);
		}
	};

	const handleChange = (panel, id) => async (_event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);

		setSelectedCase(false);

		if (isExpanded) {
			setQuery("station", id);
		} else {
			removeQuery("station");
		}

		if (isExpanded) {
			getSingleStationDetails(id);
		}
	};

	const handleSelectCase = (caseData, stationId) => {
		setSelectedCase({ caseData: caseData, stationId: stationId });
	};

	const handleProceed = () => {
		navigate(
			`/case/${selectedCase?.caseData?.id}?station=${selectedCase?.stationId}`,
			{
				state: selectedCase?.caseData,
			},
		);
	};

	const handleViewResult = () => {
		navigate(`/case/${selectedCase?.caseData?.id}`, {
			state: selectedCase?.caseData,
		});
	};

	return listLoading ? (
		<div className="d-flex align-items-center justify-content-center h-100">
			<CommonProgress />
		</div>
	) : (
		<div className="d-flex flex-column gap-3">
			{stationsList?.map((item, idx) => (
				<Accordion
					key={`stations-station-id-${item?.id}-${idx}`} // Should be unique as we are using index and station id
					expanded={expanded === idx}
					onChange={handleChange(idx, item?.id)}
					className="rounded rounded-4 overflow-hidden m-0 p-0"
					ref={(el) => {
						refs.current[item.id] = el;
					}}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls={`panel${idx}-content`}
						id={`panel${idx}-header`}
						className="m-0 p-0 px-3"
					>
						<Typography>{item?.name}</Typography>
					</AccordionSummary>
					<AccordionDetails className="m-0 p-0 px-3 pb-3">
						{loading && selectedStation?.id !== item?.id ? (
							<div className="text-center">
								<CommonProgress />
							</div>
						) : (
							<>
								{/* <div>
									<strong>description:</strong> {selectedStation?.description || "No additional details available."}
								</div>
								<strong className="py-2">
									Stations:
								</strong> */}
								<div className="d-flex flex-column gap-3">
									{isEmpty(selectedStation?.cases) ? (
										<div className="text-center py-5">No Data Found</div>
									) : (
										<div
											key={`stations-selected-station-list-${selectedStation?.id}-idx-${idx}`} // Should be unique as we are using index and station id
											className="border rounded rounded-3"
										>
											<div className="p-2 border-bottom d-flex gap-5 align-items-center justify-content-between">
												<div>{/* {selectedStation?.name} */}</div>
												<div>
													Progress: {getProgress(selectedStation?.cases)}%
												</div>
											</div>
											<div className="p-2">
												<strong>Description: </strong>
												{selectedStation?.description}
											</div>
											<div className="p-2">
												<strong>Cases:</strong>
												<div className="d-flex flex-wrap gap-3 pt-2">
													{isEmpty(selectedStation?.cases)
														? "no case available"
														: selectedStation.cases.map((caseData, idx) => (
																<SingleCaseWithDialog
																	key={`stations-single-case-with-dialog-${idx + 1}-case-${selectedCase?.caseData?.id}`} // Should be unique as we are using index
																	caseData={caseData}
																	handleSelectCase={() => {
																		handleSelectCase(
																			caseData,
																			selectedStation?.id,
																		);
																	}}
																	selectedCase={selectedCase?.caseData?.id}
																/>
															))}
												</div>
											</div>
											{selectedCase?.stationId === item?.id && (
												<div className="d-flex justify-content-end p-3">
													{!isEmpty(selectedCase?.caseData?.transcripts) &&
													!isEmpty(selectedCase?.caseData?.case_scores) ? (
														<Button
															variant="contained"
															size="small"
															sx={{
																textTransform: "none",
															}}
															onClick={handleViewResult}
														>
															View Case Progress
														</Button>
													) : (
														<Button
															variant="contained"
															size="small"
															sx={{
																textTransform: "none",
															}}
															onClick={handleProceed}
														>
															Proceed
														</Button>
													)}
												</div>
											)}
										</div>
									)}
								</div>
							</>
						)}
					</AccordionDetails>
				</Accordion>
			))}
		</div>
	);
};

export default Stations;

const SingleCaseWithDialog = ({
	caseData,
	handleSelectCase = () => {},
	selectedCase,
}) => {
	const [open, setOpen] = useState(false);
	const [activeTab, setActiveTab] = useState(0);

	const handleDialogOpen = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setOpen(true);
	};

	const handleDialogClose = () => {
		setOpen(false);
	};

	const handleTabChange = (_event, newIndex) => {
		setActiveTab(newIndex);
	};

	return (
		<>
			<div
				className={`border border-3 rounded rounded-pill 
					p-2 px-3 hover-scale d-flex gap-3 align-items-start 
					${
						selectedCase === caseData?.id
							? "border-primary"
							: !isEmpty(caseData?.transcripts) &&
								!isEmpty(caseData?.case_scores) &&
								"border-success"
					}`}
				onClick={handleSelectCase}
				style={{
					cursor: "pointer",
				}}
				onKeyDown={handleSelectCase}
			>
				<div>{caseData?.name || caseData?.description}</div>
				<IconButton className="p-0 m-0" onClick={handleDialogOpen}>
					<InfoIcon />
				</IconButton>
				{!isEmpty(caseData?.transcripts) && !isEmpty(caseData?.case_scores) && (
					<TaskAltIcon color="success" />
				)}
			</div>
			<Dialog
				open={open}
				onClose={handleDialogClose}
				fullWidth
				maxWidth="md"
				PaperProps={{
					style: { height: "80dvh" },
				}}
			>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					aria-label="dialog tabs"
				>
					<Tab
						label="Case Details"
						sx={{
							textTransform: "none",
						}}
					/>
					{caseData?.case_scores && caseData.case_scores.length > 0 && (
						<Tab
							label="Case Report"
							sx={{
								textTransform: "none",
							}}
						/>
					)}
				</Tabs>
				<DialogContent>
					{activeTab === 0 && (
						<List>
							<ListItem>
								<ListItemText primary="Name" secondary={caseData?.name} />
							</ListItem>
							<ListItem>
								<ListItemText
									primary="Description"
									secondary={
										<div
											dangerouslySetInnerHTML={{
												__html: marked(caseData?.description),
											}}
										/>
									}
								/>
							</ListItem>
							<ListItem>
								<ListItemText
									primary="Case Type"
									secondary={caseData?.case_type}
								/>
							</ListItem>
						</List>
					)}
					{/* {activeTab === 1 &&
						caseData?.case_scores &&
						caseData.case_scores.length > 0 && (
							<div>
								{caseData.case_scores.map((score) => (
									<List key={score.id}> // Commented out for now
										<ListItem>
											<ListItemText
												primary="Case Report:"
												secondary={
													<div
														dangerouslySetInnerHTML={{
															__html: marked(score.case_report),
														}}
													/>
												}
											/>
										</ListItem>
									</List>
								))}
							</div>
						)} */}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDialogClose} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

const getProgress = (caseList) => {
	if (!caseList || caseList.length === 0) {
		return 0;
	}

	const totalCases = caseList.length;
	const successCases = caseList.filter(
		(caseItem) =>
			!isEmpty(caseItem?.transcripts) && !isEmpty(caseItem?.case_scores),
	).length;

	// Calculate the percentage of successful cases
	const progressPercentage = (successCases / totalCases) * 100;

	return Number.isInteger(progressPercentage)
		? progressPercentage.toString() // If it's an integer, return as a string without decimals
		: progressPercentage.toFixed(2); // Otherwise, return with 2 decimal places
};
