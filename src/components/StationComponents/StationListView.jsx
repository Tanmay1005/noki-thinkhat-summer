import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { IconButton, Tooltip } from "@mui/material";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import { convertHtmlToText } from "helpers/common_helper";
import { getIconByStationType } from "helpers/station_helpers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonProgress from "../ReusableComponents/Loaders";
import StationsDetailsCard from "./StationsDetailsCard";
// import EditIcon from "@mui/icons-material/Edit";

const StationListView = ({
	open,
	setOpen,
	// handleEditStation,
	loading,
	stationsList,
}) => {
	const [renderer, setRenderer] = useState(0);

	const navigate = useNavigate();

	const handleRenderComponent = () => {
		setRenderer((prev) => prev + 1);
	};

	return (
		<div
			key={`station-list-view-${renderer}`} // Should be unique as we are using a renderer
			className="h-100"
		>
			{loading ? (
				<div className="d-flex justify-content-center align-items-center h-100">
					<CommonProgress />
				</div>
			) : (
				<div className="row m-0 p-0">
					{stationsList?.map((item, idx) => {
						return (
							<div
								className="col-md-6  p-2"
								key={`station-list-${item?.id}-${idx}`} // Should be unique as we are using id
							>
								<div className="p-3 rounded-4 main-bg-color  d-flex justify-content-between align-items-center ">
									<div className="d-flex flex-row gap-2 justify-content-center align-items-center">
										<img
											src={getIconByStationType(item?.type)}
											alt="loading"
											style={{ height: "30px", width: "30px" }}
										/>
										<div>
											{/* <div style={{ fontWeight: 600, fontSize: "14px" }}>
												{item?.name}
											</div> */}
											<div
												className="ms-1"
												style={{ fontWeight: 600, fontSize: "14px" }}
											>
												{item?.type}
											</div>
											<Tooltip title={convertHtmlToText(item?.description)}>
												<div
													className="ms-1"
													style={{
														cursor: "pointer",
													}}
												>
													{convertHtmlToText(item?.description)?.length > 60
														? `${convertHtmlToText(item.description).slice(0, 60)}...`
														: convertHtmlToText(item.description)}
												</div>
											</Tooltip>
										</div>
									</div>

									<div>
										{/* <Tooltip title="Edit">
											<IconButton
												className="border me-2"
												sx={{ color: "#67BA40" }}
												onClick={() => handleEditStation(item?.id)}
											>
												<EditIcon />
											</IconButton>
										</Tooltip> */}

										<Tooltip title="View">
											<IconButton
												className="border"
												sx={{ color: "#67BA40" }}
												onClick={() => navigate(`/station-details/${item?.id}`)}
											>
												<ArrowForwardIosRoundedIcon />
											</IconButton>
										</Tooltip>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
			<CreateWrapper open={open} handleClose={() => setOpen(false)}>
				<StationsDetailsCard
					setOpen={setOpen}
					handleRenderComponent={handleRenderComponent}
				/>
			</CreateWrapper>
		</div>
	);
};

export default StationListView;
