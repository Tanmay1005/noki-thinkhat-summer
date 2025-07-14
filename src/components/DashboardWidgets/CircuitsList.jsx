import { Add } from "@mui/icons-material";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
// import CreateCircuit from "../ModuleHubComponents/CreateCircuit";
// import RightDrawer from "../RightDrawer";
import UIButton from "components/ReusableComponents/UIButton";
import CreateCircuit from "components/TestConfiguration/CreateCircuit";
import { convertHtmlToText } from "helpers/common_helper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GET_CIRCUITS_DETAILS } from "../../adapters/noki_ed.service";
import DataTable from "./gridRenderer";

const CircuitsList = ({ circuitsCount, setCircuitsCount }) => {
	const [circuitsList, setCircuitsList] = useState([]);
	const [renderer, setRenderer] = useState(0);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [cache, setCache] = useState({});
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const navigate = useNavigate();
	useEffect(() => {
		getCircuitsList();
	}, [renderer, page]);

	const getCircuitsList = async (visibility = ["public", "private"]) => {
		try {
			setLoading(true);
			if (cache[page]) {
				setCircuitsList(cache[page]);
				return;
			}
			const response = await GET_CIRCUITS_DETAILS({
				visibility,
				isVisible: [true, false],
				pageSize: 5,
				page,
			});
			setCircuitsList(response?.data?.data);
			setCircuitsCount(response?.data?.total);
			setCache((prev) => {
				return {
					...prev,
					[page]: response?.data?.data,
				};
			});
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleRenderComponent = () => {
		setCache({});
		setRenderer((prev) => prev + 1);
	};
	const handlePage = (pageModal) => {
		setPage(pageModal.page);
	};
	const CustomHeader = () => {
		const [open, setOpen] = useState(false);
		const handleClickOpen = () => {
			setOpen(true);
		};

		const handleClose = () => {
			setOpen(false);
		};

		return (
			<div className="d-flex justify-content-between align-items-baseline">
				<div className="mb-4" style={{ fontWeight: "600", fontSize: "24px" }}>
					Circuits
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
								navigate("/configuration-hub?tab=2");
							}}
							onClick={() => {
								navigate("/configuration-hub?tab=2");
							}}
						>
							View All
						</span>
					</div>
				</div>

				<div>
					<UIButton
						onClick={handleClickOpen}
						startIcon={<Add />}
						text="Add"
						sx={{
							color: textColor,
							border: `1px solid ${textColor}`,
						}}
					/>
					{/* <RightDrawer open={open} onClose={handleClose}>
						<CreateCircuit
							onCancel={handleClose}
							handleRenderComponent={handleRenderComponent}
						/>
					</RightDrawer> */}
					<CreateWrapper open={open}>
						<CreateCircuit
							handleCloseCreate={handleClose}
							RefreshCircuit={handleRenderComponent}
							mode="create"
						/>
					</CreateWrapper>
				</div>
			</div>
		);
	};

	return (
		<div>
			<DataTable
				rows={circuitsList}
				rowCount={circuitsCount}
				CustomHeader={CustomHeader}
				title="Circuits"
				columns={columns}
				pageSizeOptions={5}
				paginationMode="server"
				onPaginationModelChange={handlePage}
				loading={loading}
				page={page}
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
		</div>
	);
};

export default CircuitsList;

const columns = [
	{
		field: "name",
		headerName: "Name",
		sortable: false,
		disableColumnMenu: true,
		flex: 1,
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
	{
		field: "visibility",
		headerName: "Mode",
		sortable: false,
		disableColumnMenu: true,
		flex: 1,
		renderCell: (params) =>
			params.row?.visibility === "public" ? "Practice" : "Test",
	},
	// Might add this later. Not sure as of now.
	// {
	// 	field: "is_visible",
	// 	headerName: "Visibility",
	// 	sortable: false,
	// 	disableColumnMenu: true,
	// 	flex: 1,
	// 	renderCell: (params) => {
	// 		const value = params.row?.is_visible;
	// 		const type = params.row?.visibility;
	// 		if (type === "private") {
	// 			return "N/A";
	// 		}
	// 		return value ? "Visible" : "Not Visible";
	// 	},
	// },
];
