import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CommonProgress from "components/ReusableComponents/Loaders";
// import UIButton from "components/ReusableComponents/UIButton";
// import { Add } from "@mui/icons-material";
import StationsDetailsCard from "components/StationComponents/StationsDetailsCard";
import { convertHtmlToText } from "helpers/common_helper";
import { getIconByStationType } from "helpers/station_helpers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GET_STATIONS_LIST } from "../../adapters/noki_ed.service";
// import CreateStation from "../ModuleHubComponents/CreateStation";
// import RightDrawer from "../RightDrawer";
import DataTable from "./gridRenderer";

const StationsList = ({ /* stationsCount */ setStationsCount }) => {
	const [stationsList, setStationsList] = useState([]);
	const [renderer, setRenderer] = useState(0);
	const [loading, setLoading] = useState(false);
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const navigate = useNavigate();

	useEffect(() => {
		getStationsList();
	}, [renderer]);

	const getStationsList = async () => {
		try {
			setLoading(true);
			const response = await GET_STATIONS_LIST();
			setStationsList(response?.data?.stations);
			setStationsCount(response?.data?.stations_aggregate?.aggregate?.count);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleRenderComponent = () => {
		setRenderer((prev) => prev + 1);
	};

	const CustomHeader = () => {
		const [open, setOpen] = useState(false);
		// const handleClickOpen = () => {
		// 	setOpen(true);
		// };

		const handleClose = () => {
			setOpen(false);
		};

		return (
			<div className="d-flex justify-content-between align-items-baseline">
				<div className="mb-4" style={{ fontWeight: "600", fontSize: "24px" }}>
					Stations
					<div
						style={{ fontSize: "14px", fontWeight: "normal", color: textColor }}
					>
						<span
							style={{
								cursor: "pointer",
								fontSize: "14px",
								fontWeight: "normal",
								color: textColor,
							}}
							onKeyDown={() => {
								navigate("/configuration-hub?tab=1");
							}}
							onClick={() => {
								navigate("/configuration-hub?tab=1");
							}}
						>
							View All
						</span>
					</div>
				</div>

				<div>
					{/* <UIButton
						onClick={handleClickOpen}
						startIcon={<Add />}
						text="Add"
						sx={{
							color: textColor,
							border: `1px solid ${textColor}`,
						}}
						disabled={stationsCount >= 8}
					/> */}
					{/* <RightDrawer open={open} onClose={handleClose}>
						<CreateStation
							onCancel={handleClose}
							handleRenderComponent={handleRenderComponent}
						/>
					</RightDrawer> */}
					<CreateWrapper open={open}>
						<StationsDetailsCard
							handleClose={handleClose}
							handleRenderComponent={handleRenderComponent}
						/>
					</CreateWrapper>
				</div>
			</div>
		);
	};

	return (
		<div>
			{loading ? (
				<div
					className="d-flex justify-content-center align-items-center"
					style={{ height: "50vh" }}
				>
					<CommonProgress />
				</div>
			) : (
				<DataTable
					CustomHeader={CustomHeader}
					rows={stationsList}
					title="Stations"
					columns={columns}
					pageSizeOptions={5}
					// onRowClicked={onRowClicked}
					sx={{
						border: "none",
						overflow: "hidden",
						"& .MuiDataGrid-container--top [role=row]": {
							color: "gray",
							background: "#F9F9F9",
							fontSize: "14px",
							fontWeight: "bold",
						},
						"& .MuiDataGrid-cell": {
							border: "none !important",
						},
						"& .MuiDataGrid-columnHeader": {
							borderBottom: "1px solid #ccc",
							borderTop: "1px solid #ccc",
						},
					}}
				/>
			)}
		</div>
	);
};

export default StationsList;

const columns = [
	{
		field: "type",
		headerName: "Station Type",
		sortable: false,
		disableColumnMenu: true,
		flex: 1,
		renderCell: (params) => {
			const Icon = getIconByStationType(params?.row?.type);
			return (
				<div className="d-flex align-items-center gap-1">
					<img
						src={Icon}
						alt="loading"
						style={{ height: "30px", width: "30px" }}
					/>
					<span title={params?.row?.type}>{params?.row?.type}</span>
				</div>
			);
		},
	},
	{
		field: "description",
		headerName: "Description",
		sortable: false,
		disableColumnMenu: true,
		flex: 1,
		renderCell: (params) => {
			const value = convertHtmlToText(params.row?.description);
			return (
				<div title={value} className="text-truncate">
					{value}
				</div>
			);
		},
	},
];
