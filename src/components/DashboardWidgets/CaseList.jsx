import { Add } from "@mui/icons-material";
import UIButton from "components/ReusableComponents/UIButton";
import ManageCase from "components/TestConfiguration/HandleCase/ManageCase";
import { convertHtmlToText } from "helpers/common_helper";
import { getColorByStationType } from "helpers/station_helpers";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GET_CASE_LIST } from "../../adapters/noki_ed.service";
import { getStations } from "../../redux/thunks/stations";
import DataTable from "./gridRenderer";

const CustomHeader = ({ handleRender = () => {} }) => {
	const navigate = useNavigate();
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
				Cases
				<div
					style={{ fontSize: "14px", fontWeight: "normal", color: "#5840BA" }}
				>
					<span
						style={{
							cursor: "pointer",
							fontSize: "14px",
							fontWeight: "normal",
							color: "",
						}}
						onKeyDown={() => {
							navigate("/configuration-hub");
						}}
						onClick={() => {
							navigate("/configuration-hub");
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
						color: " #5840BA",
						border: "1px solid #5840BA",
					}}
				/>
				<ManageCase
					open={open}
					handleClose={handleClose}
					handleRender={handleRender}
				/>
			</div>
		</div>
	);
};

const CaseList = ({ casesCount, setCasesCount }) => {
	const [caseList, setCaseList] = useState([]);
	const [renderer, setRenderer] = useState(0);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [cache, setCache] = useState({});
	const { data: stationList, stationMap } = useSelector(
		(state) => state.stations,
	);
	const reduxDispatch = useDispatch();
	useEffect(() => {
		if (!stationList) {
			reduxDispatch(getStations());
		}
		getCaseList(["public", "private"]);
	}, [renderer, page]);
	const pageSize = 5;
	const getCaseList = async (visibility = ["public"]) => {
		try {
			setLoading(true);
			if (cache[page]) {
				setCaseList(cache[page]);
				return;
			}
			const response = await GET_CASE_LIST({
				visibility,
				pageSize,
				page,
			});
			setCaseList(response?.data?.data);
			setCasesCount(response?.data?.count);
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

	const renderApplicableTypes = (params) => {
		const types = params.row?.applicable_types || [];
		const displayedType = stationMap[types[0]]?.type;
		const remainingCount = types.length - 1;

		return (
			<div
				style={{
					display: "flex",
					gap: "8px",
					alignItems: "center",
					marginTop: "8px",
				}}
			>
				{displayedType && (
					<span
						style={{
							backgroundColor: getColorByStationType(displayedType),
							color: "#fff",
							padding: "0 8px",
							height: "24px",
							lineHeight: "24px",
							borderRadius: "4px",
							fontSize: "12px",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{displayedType}
					</span>
				)}
				{remainingCount > 0 && (
					<span
						style={{
							backgroundColor: "#d3d3d3",
							color: "#000",
							padding: "0 8px",
							height: "24px",
							lineHeight: "24px",
							borderRadius: "4px",
							fontSize: "12px",
						}}
					>
						+{remainingCount}
					</span>
				)}
			</div>
		);
	};

	const columns = [
		{
			field: "name",
			headerName: "Name",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
		},
		{
			field: "applicable_types",
			headerName: "Applicable Station Types",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			renderCell: renderApplicableTypes,
		},
		{
			field: "case_type",
			headerName: "Specialty",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			minWidth: 70,
			maxWidth: 90,
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

	return (
		<div>
			<CustomHeader handleRender={handleRenderComponent} />
			<DataTable
				rows={caseList}
				columns={columns}
				pageSizeOptions={5}
				page={page}
				paginationMode="server"
				onPaginationModelChange={handlePage}
				loading={loading}
				rowCount={casesCount}
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

export default CaseList;
