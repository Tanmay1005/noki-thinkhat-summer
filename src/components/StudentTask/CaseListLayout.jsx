import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconButton } from "@mui/material";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
	CASE_DETAILS,
	GET_CIRCUIT_BY_ID,
} from "../../adapters/noki_ed.service";
import { useQuery } from "../../hooks/useQuery";
import { setUsername } from "../../redux/slices/topbarSlice";
import CommonProgress from "../ReusableComponents/Loaders";
import UITooltip from "../ReusableComponents/UITooltip";
import SpeechLayout2 from "../SpeechLayout2";

const CaseListLayout = () => {
	const { id: caseId } = useParams();
	const navigate = useNavigate();
	const [collapseLeftSection, setCollapseLeftSection] = useState(false);
	const [selectedCase, setSelectedCase] = useState(null);
	const [caseList, setCaseList] = useState([]);
	const [stationData, setStationData] = useState([]);
	const [loading, setLoading] = useState(false);
	const theme = useSelector((state) => state?.app?.theme);

	const location = useLocation();
	const reduxDispatch = useDispatch();

	const query = useQuery();

	const getCaseDetails = async () => {
		try {
			setLoading(true);

			const response = await CASE_DETAILS(caseId);

			setCaseList([response?.data]);

			setSelectedCase(response?.data);
		} catch (err) {
			toast.error(err.message || "something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const getCaseListByCircuitId = async () => {
		const circuitId = query?.get("circuit");

		try {
			setLoading(true);

			const response = await GET_CIRCUIT_BY_ID(`/${circuitId}`);

			const allCases = response?.stations?.flatMap((station) => station.cases);

			setStationData(response?.stations);

			setCaseList(allCases);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const circuitId = query?.get("circuit");
		reduxDispatch(setUsername("Case"));

		if (location?.state) {
			let tempStations = location?.state;

			tempStations = tempStations?.map((item) => {
				item.cases = item.selectedCases;
				return item;
			});
			setStationData(tempStations);
			const allCases = tempStations?.flatMap((station) => station.cases);

			setCaseList(allCases);
			return;
		}

		if (circuitId) {
			getCaseListByCircuitId();
		} else {
			getCaseDetails();
		}
		return () => {
			reduxDispatch(setUsername(""));
		};
	}, []);

	useEffect(() => {
		const foundCase = caseList?.find((caseItem) => caseItem.id === caseId);
		if (foundCase) {
			setSelectedCase(foundCase);
		}
	}, [caseId, caseList]);

	const handleCaseClick = (caseItem) => {
		const circuitId = query?.get("circuit");
		const stationId = query?.get("station");

		setSelectedCase(caseItem);

		let path = `/case/${caseItem.id}`;

		if (circuitId && stationId) {
			path += `?circuit=${circuitId}&station=${stationId}`;
		}

		navigate(path);
	};

	const toggleCaseList = () => {
		setCollapseLeftSection((prev) => !prev);
	};

	return (
		<div className="h-100 d-flex flex-column">
			<div className="row p-0 m-0 align-items-start">
				<div className="col-md-3 d-flex justify-content-between align-items-center border-end border-bottom p-1">
					<div className="fs-5">Case List</div>
					<IconButton className="p-0" onClick={toggleCaseList}>
						{collapseLeftSection ? <ChevronRight /> : <ChevronLeft />}
					</IconButton>
				</div>
				<div className="col-md-9 p-1 d-flex justify-content-between border-bottom fs-5">
					case
				</div>
			</div>
			<div className="row p-0 m-0 align-items-start flex-grow-1 overflow-hidden">
				<div
					className={`${
						collapseLeftSection ? "d-none" : "col-md-3 d-block"
					} border-end p-0 h-100 overflow-auto p-2 pt-0`}
				>
					{loading ? (
						<div className="d-flex h-100 align-items-center justify-content-center">
							<CommonProgress />
						</div>
					) : (
						<div className="container">
							{isEmpty(stationData)
								? caseList.map((caseItem, index) => (
										<div
											key={`case-list-layout-cases-${index + 1}`} // Should be unique as we are using index
											className="accordion"
										>
											<div
												className="rounded p-2 my-2 rounded-4 accordion-item"
												style={{
													border: "none",
													backgroundColor:
														selectedCase?.id === caseItem?.id &&
														(theme === "light" ? "#5d5fef1a" : "#24235b"),
													color:
														selectedCase?.id === caseItem?.id
															? "#5D5FEF"
															: "gray",
													cursor: "pointer",
												}}
												onClick={() => {
													if (selectedCase?.id === caseItem?.id) {
														return;
													}
													handleCaseClick(caseItem);
												}}
												onKeyDown={() => {
													if (selectedCase?.id === caseItem?.id) {
														return;
													}
													handleCaseClick(caseItem);
												}}
											>
												{caseItem.name}
											</div>
										</div>
									))
								: stationData?.map((station, index) => (
										<SingleItemAccordion
											key={`case-list-layout-station-${station?.id}-${index}`} // Should be unique as we are using index and station id
											index={index}
											station={station}
											selectedCase={selectedCase}
											handleCaseClick={handleCaseClick}
										/>
									))}
						</div>
					)}
				</div>
				<div
					className={`h-100 ${collapseLeftSection ? "col-md-12" : "col-md-9"}`}
					style={{
						marginTop: "clamp(0.5vh, 0.5vw, 0.5vw)",
					}}
				>
					<SpeechLayout2 />
				</div>
			</div>
		</div>
	);
};

export default CaseListLayout;

const SingleItemAccordion = ({
	index,
	selectedCase,
	station,
	handleCaseClick,
}) => {
	const [isOpen, setIsOpen] = useState(true);

	const theme = useSelector((state) => state?.app?.theme);

	useEffect(() => {
		if (station?.cases?.find((f) => f?.id === selectedCase?.id)) {
			setIsOpen(true);
		}
	}, [station]);

	const toggleAccordion = (_ind) => {
		setIsOpen(!isOpen);
	};

	return (
		<div
			className="accordion my-3"
			id="accordionExample"
			style={{ border: "none" }}
		>
			<div
				className={"accordion-item card-hover p-1 px-3"}
				style={{
					border: "none",
					borderRadius: "24px",

					backgroundColor:
						station?.cases?.find((f) => f?.id === selectedCase?.id) &&
						(theme === "light" ? "#5d5fef1a" : "#24235b"),
					color: "gray",
				}}
			>
				<div
					className="accordion-header d-flex justify-content-between align-items-center"
					id={`heading${index}`}
				>
					<div
						className="w-75"
						onClick={() => !isOpen && toggleAccordion()}
						onKeyDown={() => !isOpen && toggleAccordion()}
						style={{
							cursor: "pointer",
						}}
					>
						<UITooltip
							sx={{
								fontSize: isOpen && "0.9rem !important",
							}}
						>
							{station?.name}
						</UITooltip>
					</div>
					<IconButton
						onClick={(event) => {
							toggleAccordion(index);
							event.stopPropagation();
						}}
					>
						{isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</div>
				<div
					id={`collapse${index}`}
					className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
					aria-labelledby={`heading${index}`}
					data-bs-parent="#accordionExample"
				>
					<div className="d-flex flex-column gap-2">
						{station?.cases?.map((caseItem, idx) => {
							return (
								<div
									className="accordion-body p-0 m-0 pb-1"
									onClick={() => {
										if (selectedCase?.id === caseItem?.id) {
											return;
										}
										handleCaseClick(caseItem);
									}}
									onKeyDown={() => {
										if (selectedCase?.id === caseItem?.id) {
											return;
										}
										handleCaseClick(caseItem);
									}}
									style={{
										color:
											selectedCase?.id === caseItem?.id ? "#5D5FEF" : "gray",
										fontSize: "1rem",
										cursor: "pointer",
									}}
									key={`single-item-accordion-cases-${caseItem?.id}-${idx}`} // Should be unique as we are using case id and index
								>
									{caseItem?.name}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
