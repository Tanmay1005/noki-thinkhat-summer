import { Skeleton } from "@mui/material";
import { getStationConfigForCase } from "helpers/station_helpers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
	GET_CASE_SCORE_BY_ID,
	GET_INTEGRATED_CASE,
	GET_STATION_BY_ID,
} from "../adapters/noki_ed.service";
import GoBackIcon from "../assets/Case_tabs_image/GoBack.svg";
import AvatarCard from "../components/CaseFlowComponents/AvatarCard";
import CaseTabsCard from "../components/CaseFlowComponents/CaseTabsCard";
import CandidateInstructionsCard from "./CaseFlowComponents/CandidateInstructionsCard";
import DisplayImages from "./CaseFlowComponents/DisplayImages";
import MobileCandidateInstructionsCard from "./CaseFlowComponents/MobileCandidateInstructionsCard";
// import StationsAccordionCard from "./CaseFlowComponents/StationsAccordionCard";

const CaseFlowLayout = () => {
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const navigate = useNavigate();
	const { id } = useParams();
	const [caseDetails, setCaseDetails] = useState();
	const [stationsList, setStationsList] = useState([]);
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	// const [selectedStations, setSelectedStations] = useState([]);
	const [stationIdMap, setStationIdMap] = useState({});
	const [isQuiz, setIsQuiz] = useState(false);
	const handleQuiz = (prev) => {
		setIsQuiz(!prev);
	};
	const config = getStationConfigForCase(stationsList?.[0]?.type);
	const extractStationIds = (data) => {
		const stationIdMap = {};
		for (const entry of data) {
			//@TODO: Change this to stationDetails when data is cleaned up
			const stationIdItem = entry.resource?.item?.find(
				(item) =>
					item.linkId === "stationDetails" || item.linkId === "stationId",
			);
			let stationId;
			if (stationIdItem?.linkId === "stationDetails") {
				stationId = JSON.parse(stationIdItem?.answer?.[0]?.valueString)?.id;
			} else if (stationIdItem?.linkId === "stationId") {
				stationId = stationIdItem?.answer?.[0]?.valueString;
			}
			const resourceId = entry.resource?.id;

			if (stationId && !stationIdMap[stationId]) {
				stationIdMap[stationId] = resourceId;
			}
		}

		return stationIdMap;
	};
	const handleNavigation = (event) => {
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			navigate(-1);
		}
	};
	const practitionerId = useSelector(
		(state) => state?.auth?.personData?.fhir_practitioner_id,
	);

	const fetchStationsDetails = async (data) => {
		try {
			const response = await GET_STATION_BY_ID(
				`/${data?.applicable_types?.[0]}`,
			);
			setStationsList([response]);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchCaseDetails = async () => {
		setLoading(true);
		try {
			const response = await GET_INTEGRATED_CASE(id, {
				station: location?.state?.stationName,
			});
			setCaseDetails(response?.data);
			await fetchStationsDetails(response?.data);

			const fetchedQuestionnaireId = response?.data.fhirQuestionnaire.id;
			const fetchedPatientId = response?.data.fhir_patient_id;
			if (fetchedQuestionnaireId && fetchedPatientId) {
				await fetchIntegratedCaseScore(
					fetchedQuestionnaireId,
					fetchedPatientId,
					practitionerId,
					"case",
				);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const fetchIntegratedCaseScore = async (
		questionnaireId,
		patientId,
		practitionerId,
		type,
	) => {
		if (questionnaireId && patientId && practitionerId) {
			try {
				const response = await GET_CASE_SCORE_BY_ID({
					practitionerId,
					questionnaireId,
					patientId,
					type,
				});
				let stationIdMap = {};
				if (response?.data?.entries) {
					stationIdMap = extractStationIds(response?.data?.entries);
				}
				setStationIdMap(stationIdMap);
			} catch (e) {
				console.error(e);
			}
		}
	};

	useEffect(() => {
		if (id) {
			fetchCaseDetails();
		}
	}, [id, location]);

	return (
		<>
			<div
				className="m-0 px-4 py-2"
				style={{ height: "100%", overflowY: "auto" }}
			>
				<div className="col-12  d-flex justify-content-start m-0 px-1 py-2">
					{!loading && (
						<div>
							<img
								src={GoBackIcon}
								alt="loading.."
								onClick={handleNavigation}
								onKeyUp={handleNavigation}
								style={{ cursor: "pointer" }}
							/>
							<span style={{ color: textColor, marginLeft: "5px" }}>
								Go Back
							</span>
						</div>
					)}
				</div>
				{loading ? (
					<>
						<SkeltonLoader />
					</>
				) : (
					<>
						<div className="col-12 m-0  px-3 py-1 d-flex justify-content-between align-items-center">
							<span
								style={{
									fontWeight: "bold",
									gap: "25px",
									lineHeight: "clamp(1.5rem, 4vw, 2.5rem)",
									fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
									textTransform: "capitalize !important",
								}}
							>
								{caseDetails?.name}
							</span>
						</div>

						<div
							className="row col-12 m-0 p-0 "
							style={{
								display: "flex",
								flexWrap: "wrap",
								alignItems: "flex-start",
							}}
						>
							<div className="col-md-8 col-sm-12  m-0">
								<div className="row p-md-3 p-sm-1 ">
									<AvatarCard
										caseDetails={caseDetails}
										isQuiz={isQuiz}
										handleQuiz={handleQuiz}
										stationsList={stationsList}
										stationIdMap={stationIdMap}
									/>
								</div>
								<div className="row px-sm-0 py-sm-3 p-md-3 ">
									{config?.ehr ? (
										<div className="d-none d-md-block mt-4">
											<CaseTabsCard caseDetails={caseDetails} />
										</div>
									) : (
										<div className="d-none d-md-flex flex-column justify-content-center align-items-center h-50">
											<p>
												{`EHR details will not be shown for this ${stationsList?.[0]?.type} station`}
											</p>
										</div>
									)}
									<div className="mt-4">
										<DisplayImages
											questionnaireId={caseDetails?.fhir_questionnaire_id}
											stationType={stationsList?.[0]?.id}
										/>
									</div>

									{/* Show only on mobile, hide on Desktop and iPads */}
									<div className="d-block d-md-none m-0 px-0 py-3">
										<MobileCandidateInstructionsCard
											caseDetails={caseDetails}
										/>
									</div>
								</div>

								<div className="row p-md-3 p-sm-1">
									{/* <StationsAccordionCard
										stationsList={stationsList}
										setSelectedStations={setSelectedStations}
										caseDetails={caseDetails}
										stationIdMap={stationIdMap}
										isQuiz={isQuiz}
									/> */}
								</div>
							</div>

							<div className="col-md-4 col-sm-12 p-3 d-none d-md-inline-flex">
								<CandidateInstructionsCard
									caseDetails={caseDetails}
									// selectedStations={selectedStations}
									stationsList={stationsList}
									stationIdMap={stationIdMap}
									isQuiz={isQuiz}
									handleQuiz={handleQuiz}
								/>
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default CaseFlowLayout;

const SkeltonLoader = () => {
	const style = {
		transform: "none",
		WebkitTransform: "none",
	};

	return (
		<div className="row h-100">
			<div className="col-md-8 col-sm-12 d-flex flex-column gap-4">
				<Skeleton
					animation="wave"
					height={70}
					width={300}
					className="p-0 m-0"
					sx={style}
				/>
				<Skeleton
					animation="wave"
					height={400}
					width={"100%"}
					className="p-0 m-0 "
					sx={style}
				/>
				<Skeleton
					animation="wave"
					height={100}
					width={"100%"}
					className="p-0 m-0"
					sx={style}
				/>
				<div className="h-100">
					<div className="d-flex gap-4 align-items-start">
						{[1, 2, 3, 4, 5, 6, 7]?.map((item) => (
							<Skeleton
								key={`case-flow-layout-skeleton-${item}`} // This key will have 1,2,3,4,5,6,7 as values so it will be unique
								height={70}
								width={90}
								className="p-0 my-2"
								sx={style}
								animation="wave"
							/>
						))}
					</div>
					<Skeleton
						height={"50%"}
						width={"100%"}
						className="p-0 m-0"
						sx={style}
						animation="wave"
					/>
					<Skeleton
						height={"50%"}
						width={"100%"}
						className="p-0 mt-2"
						sx={style}
					/>
				</div>
			</div>
			<div className="col-md-4 col-sm-12">
				<Skeleton
					height={"100%"}
					width={"100%"}
					className="p-0 m-0"
					sx={style}
					animation="wave"
				/>
			</div>
		</div>
	);
};
