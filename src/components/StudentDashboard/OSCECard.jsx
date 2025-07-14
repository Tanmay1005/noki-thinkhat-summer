import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	GET_CASE_LIST,
	GET_CIRCUITS_LIST,
	GET_STATIONS_LIST,
} from "../../adapters/noki_ed.service";
import { imageByType } from "../../helpers/imageHelper";
import CollapsibleText from "../ReusableComponents/CollapsibleText";
import CommonProgress from "../ReusableComponents/Loaders";

const OSCECard = () => {
	const [circuitsList, setCircuitsList] = useState([]);
	const [stationsList, setStationsList] = useState([]);
	const [casesList, setCasesList] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		getOSCEList();
	}, []);

	const getOSCEList = async (visibility = ["public"]) => {
		try {
			setLoading(true);
			const circuit = await GET_CIRCUITS_LIST({
				visibility,
				is_visible: [true],
			});
			const station = await GET_STATIONS_LIST();
			const caseD = await GET_CASE_LIST({ visibility });

			setCircuitsList(circuit?.data?.circuits);
			setStationsList(station?.data?.stations);
			setCasesList(caseD?.data?.cases);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Grid className="h-100 card rounded rounded-4 overflow-hidden d-flex flex-column">
			<Typography
				className="ps-2 p-2 border-bottom border-2 d-flex align-items-center gap-2"
				fontSize={"1.5rem"}
				fontWeight={550}
			>
				<div className="icon-osce" /> OSCE
			</Typography>

			<Grid
				container
				className="flex-1 h-100 p-0 m-0 overflow-hidden"
				// style={{ border: "1px solid red" }}
			>
				{[
					{ label: "Stations", value: stationsList },
					{ label: "Circuits", value: circuitsList },
					{ label: "Cases", value: casesList },
				]?.map((data, idx) => (
					<Grid
						key={`osce-card-${data.label}-grid-${idx}`} // Should be unique as we are using index and labels of each item
						item
						xs={12}
						md={4}
						className="h-100 m-0 p-0"
						// style={{ border: "1px solid green" }}
					>
						<div
							className="h-100 d-flex flex-column"
							// style={{ border: "1px solid red" }}
						>
							<div>
								<Typography className="ps-2" fontWeight="550">
									{data?.label}
								</Typography>
							</div>
							{loading ? (
								<div className="d-flex align-items-center justify-content-center h-100">
									<CommonProgress />
								</div>
							) : (
								<div className="flex-1 h-100 overflow-auto d-flex flex-column">
									{data?.value?.map((item, idx) => (
										<div
											key={`osce-card-${data.label}-grid-${idx}-inner`} // Should be unique as we are using index and labels of each item and inner keyword
											className="main-bg-color m-2 p-2 rounded rounded-4 d-flex justify-content-between align-items-center"
										>
											<div className="d-flex align-items-center gap-2">
												<div className={`${imageByType(data?.label, item)}`} />
												<div>
													{data?.label !== "Circuits" && (
														<div
															className="rounded rounded-3 d-inline-block bg-light"
															style={{
																backgroundColor: "rgba(88, 64, 186, 0.1)",
																fontSize: "0.8rem",
																padding: "1px 8px",
															}}
														>
															<CollapsibleText
																value={
																	data?.label === "Stations"
																		? item?.type
																		: item?.applicable_types?.join(", ")
																}
																type="tooltip"
																fontWeight={"bold"}
																maxLength={20}
																color="primary"
															/>
														</div>
													)}
													<div
														style={{
															fontSize: "1.2rem",
															fontWeight: "bold",
														}}
													>
														{
															<CollapsibleText
																value={item?.name}
																type="tooltip"
																fontWeight={"bold"}
																maxLength={30}
															/>
														}
													</div>
													<div>
														{
															<CollapsibleText
																value={
																	data?.label === "Cases"
																		? item?.case_type
																		: item?.description
																}
																type="tooltip"
																previewLength={30}
															/>
														}
													</div>
												</div>
											</div>
											{data?.label !== "Stations" ? (
												<>
													<div
														className="green-play-icon"
														style={{ cursor: "pointer" }}
														onClick={() => {
															if (data?.label === "Circuits") {
																navigate(`/assessments?circuit=${item?.id}`);
															}
															if (data?.label === "Cases") {
																navigate(`/case/${item?.id}`);
															}
														}}
														onKeyDown={() => {
															if (data?.label === "Circuits") {
																navigate(`/assessments?circuit=${item?.id}`);
															}
															if (data?.label === "Cases") {
																navigate(`/case/${item?.id}`);
															}
														}}
													/>
												</>
											) : (
												""
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</Grid>
				))}
			</Grid>
		</Grid>
	);
};

export default OSCECard;
