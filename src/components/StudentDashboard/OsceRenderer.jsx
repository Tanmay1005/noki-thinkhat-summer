import { Box, Checkbox, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import useCircuitHelpers from "helpers/circuit_helpers";
import { convertHtmlToText, getTabValue } from "helpers/common_helper";
import { selectedCaseTextMap } from "helpers/constants";
import { STATIONS_WITH_TAB_VALUES } from "helpers/station_helpers";
import _, { isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
	GET_CASE_LIST,
	GET_CIRCUITS_DETAILS,
	GET_STATIONS_LIST,
} from "../../adapters/noki_ed.service";
import { imageByType } from "../../helpers/imageHelper";
import Card from "../ReusableComponents/Card";

const styles = {
	badge: {
		fontSize: "0.7rem",
	},
	header: {
		fontSize: "1rem",
		fontWeight: "600",
		lineHeight: "1.19rem",
	},
	description: {
		fontSize: "0.75rem",
		fontWeight: "300",
		lineHeight: "0.85rem",
	},
	iconPlay: {
		height: "2rem",
	},
};
const SkeletonLoader = () => {
	return (
		<>
			{[1, 2, 3, 4].map((item) => (
				<Box key={`skeleton-card-${item}`} p={1}>
					<Skeleton
						variant="rectangular"
						height={80}
						width="100%"
						sx={{ backgroundColor: "#e0e0e0", borderRadius: "12px" }}
						animation="wave"
					/>
				</Box>
			))}
		</>
	);
};
const OsceRenderer = ({ type, limit }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState([]);
	const [count, setCount] = useState(0);
	const auth = useSelector((state) => state?.auth?.personData);
	const navigate = useNavigate();
	const [selectedModel, setSelectedModel] = useState("rolePlay");
	const {
		findAttempt,
		createAttempt,
		getNextCase,
		nextLoader,
		startCircuitLoader,
		showDialog,
		setShowDialog,
		attemptDetails,
		handleSetSelectedCases,
		selectedCases,
		// setAttemptDetails,
	} = useCircuitHelpers();

	//used switch to handle all APIS for circuits stations and cases
	const fetchData = async () => {
		try {
			setIsLoading(true);
			let response;
			switch (type) {
				case "stations":
					response = await GET_STATIONS_LIST();
					setData(response?.data?.stations);
					setCount(response?.data?.stations_aggregate?.aggregate?.count || 0);
					break;
				case "cases":
					response = await GET_CASE_LIST({
						visibility: ["public"],
						page: 0,
						pageSize: 5,
						isMultiStationCase: false,
					});
					setData(response?.data?.data);
					setCount(response?.data?.count || 0);
					break;
				default: {
					const pageSize = 5;
					response = await GET_CIRCUITS_DETAILS({
						visibility: ["public"],
						isVisible: [true],
						page: 0,
						pageSize,
					});
					setData(
						response?.data?.data?.reduce((acc, curr) => {
							const cases = curr.stations.flatMap((station) => {
								return station?.cases?.map((caseDetails) => ({
									...caseDetails,
									station_id: station.id,
									station_type: station.type,
								}));
							});
							acc.push({
								...curr,
								cases,
							});
							return acc;
						}, []),
					);
					setCount(response?.data?.total);
					break;
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		fetchData();
	}, []);

	const handleStartCircuit = async (circuit) => {
		await findAttempt(circuit, auth?.fhir_practitioner_id);
	};
	const handleSelectedCases = (event) => {
		const { checked, value } = event.target;
		handleSetSelectedCases(checked, value);
	};

	const handleOsceNavigation = (type, item) => {
		if (type === "cases") {
			navigate(
				`/case/${item?.id}?stationId=${item.applicable_types?.[0]}&osceType=case`,
			);
		} else if (type === "circuits") {
			handleStartCircuit(item);
		} else if (type === "stations") {
			const tabMapping = Array.isArray(STATIONS_WITH_TAB_VALUES)
				? STATIONS_WITH_TAB_VALUES.find(
						(station) => station.stationType === item?.type,
					)
				: null;

			const tabValue = tabMapping?.value;

			if (!_?.isUndefined(tabValue)) {
				navigate(
					`/OSCETraining?tab=${getTabValue(type)}&stationTab=${tabValue}`,
					{
						state: { stationType: item?.type },
					},
				);
			} else {
				console.error(
					`Station type ${item?.type} not found in STATIONS_WITH_TAB_VALUES`,
				);
			}
		}
	};

	const maxLength =
		type === "circuits"
			? {
					badge: 30,
					header: 25,
					description: 40,
				}
			: {
					badge: 20,
					header: 20,
					description: 25,
				};
	const itemsToShow = limit ? data?.slice(0, limit) : data;
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
										customIcon="none"
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
			<Box>
				{isLoading ? (
					<SkeletonLoader />
				) : (
					<Box
						className="d-flex gap-2 flex-column"
						sx={{ height: "max(28vh,300px)", overflow: "auto" }}
					>
						{isEmpty(itemsToShow) ? (
							<div className="d-flex h-100 align-items-center justify-content-center">
								No Data Found
							</div>
						) : (
							itemsToShow?.map((item, index) => (
								<Card
									key={`osce-renderer-${index + 1}`} // Should be unique as we are using index
									maxLength={maxLength}
									cardClasses="secondary-bg-color h-auto"
									cardImageClass={imageByType(type, item)}
									item={item}
									badgeText={item?.case_type}
									name={type === "stations" ? item?.type : item?.name}
									description={convertHtmlToText(item?.description)}
									styles={styles}
									actions={[
										{
											handler: () => handleOsceNavigation(type, item),
										},
									]}
								/>
							))
						)}
						{limit < count && (
							<Typography
								component="div"
								sx={{
									fontSize: "0.8rem",
									cursor: "pointer",
									color: "#8C68C3",
									textAlign: "center",
								}}
								onClick={() =>
									navigate(`OSCETraining?tab=${getTabValue(type)}`)
								}
							>
								View More
							</Typography>
						)}
					</Box>
				)}
			</Box>
		</>
	);
};

export default OsceRenderer;
