import { MoreVert } from "@mui/icons-material";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import {
	DELETE_QUIZ_QUESTION_BY_ID,
	GET_QUIZ_LIST,
} from "adapters/noki_ed.service";
import DataTable from "components/DashboardWidgets/gridRenderer";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

const QuestionPage = ({
	searchText,
	selectedRows,
	setSelectedRows,
	handleEdit,
}) => {
	const [tableLoading, setTableLoading] = useState(false);
	const [quizData, setQuizData] = useState([]);
	const [page, setPage] = useState(0);
	const [pageSize] = useState(10);
	const [rowCount, setRowCount] = useState(0);
	const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchText(searchText?.trim());
		}, 500);
		return () => clearTimeout(handler);
	}, [searchText]);

	const getQuizQuestions = useCallback(async () => {
		try {
			setTableLoading(true);
			const query = `${debouncedSearchText ? `filter=${debouncedSearchText}&` : ""}pageSize=${pageSize}&page=${page}`;
			const allQuiz = await GET_QUIZ_LIST(query);

			setQuizData(allQuiz?.data?.data);
			setRowCount(allQuiz?.data?.totalCount);
		} catch (e) {
			console.error(e);
			toast.error("Failed to load data.");
		} finally {
			setTableLoading(false);
		}
	}, [debouncedSearchText, page, pageSize]);

	useEffect(() => {
		getQuizQuestions();
	}, [getQuizQuestions]);

	const columns = [
		{
			field: "question",
			headerName: "Question",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) =>
				params?.row?.question ? (
					<Tooltip title={params.row?.question}>
						<span>{params.row?.question}</span>
					</Tooltip>
				) : (
					<></>
				),
		},
		{
			field: "description",
			headerName: "Description",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			renderCell: (params) =>
				params?.row?.description ? (
					<Tooltip title={params.row?.description}>
						<span>{params.row?.description}</span>
					</Tooltip>
				) : (
					<></>
				),
		},
		{
			field: "category",
			headerName: "Applicable Stations",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			renderCell: (params) => {
				if (params.row?.station_type?.length === 0) return "General";
				const joinedStations = params.row?.station_type?.join(", ");
				return (
					<Tooltip title={joinedStations}>
						<span>{joinedStations}</span>
					</Tooltip>
				);
			},
		},
		{
			field: "actions",
			headerName: "Actions",
			sortable: false,
			disableColumnMenu: true,
			width: 100,
			renderCell: (params) => (
				<ActionMenu
					params={params}
					RendererFn={getQuizQuestions}
					handleEdit={handleEdit}
				/>
			),
		},
	];

	const handlePageChange = useCallback((newPage) => {
		setPage(newPage.page);
	}, []);

	return (
		<div>
			<DataTable
				rows={quizData}
				columns={columns}
				rowCount={rowCount}
				page={page}
				pageSize={pageSize}
				autoHeight
				checkboxSelection
				disableRowSelectionOnClick
				loading={tableLoading}
				onRowSelectionModelChange={setSelectedRows}
				paginationMode="server"
				onPaginationModelChange={handlePageChange}
				rowSelectionModel={selectedRows}
				getRowId={(row) => row.id}
				sx={{
					borderRadius: "24px",
					overflow: "hidden",
					"& .MuiDataGrid-container--top [role=row]": {
						background: "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)",
						color: "white",
						fontSize: "13px",
					},
				}}
			/>
		</div>
	);
};

export default QuestionPage;

const ActionMenu = memo(({ params, RendererFn, handleEdit }) => {
	const item = params.row;
	const [loading, setLoading] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);

	const handleDelete = async () => {
		try {
			setLoading(true);
			await DELETE_QUIZ_QUESTION_BY_ID([item?.id]);
			RendererFn();
			toast.success("Question deleted successfully.");
		} catch (e) {
			toast.error(e?.message || "Error while deleting.");
		} finally {
			setLoading(false);
		}
	};
	const handleClick = (event) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const hanldeConfirmOpen = () => {
		setConfirmDelete(true);
	};
	const handleConfirmDeleteClose = () => {
		setConfirmDelete(false);
	};

	return (
		<>
			<IconButton onClick={handleClick}>
				<MoreVert />
			</IconButton>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				<MenuItem onClick={() => handleEdit(item)}>Edit</MenuItem>
				<MenuItem onClick={hanldeConfirmOpen}>Delete</MenuItem>
			</Menu>
			<UIModal open={confirmDelete} handleClose={handleConfirmDeleteClose}>
				<div>
					<div className="fs-4 mb-3 text-center">
						<h6 style={{ fontWeight: "bold" }}>
							Are you sure you want to delete ?
						</h6>
						<span style={{ textAlign: "center", fontSize: "14px" }}>
							This action cannot be undone. Do you really want to delete this
							Quiz Question?
						</span>
					</div>
					<div className="d-flex justify-content-between align-items-center gap-2">
						<UIButton
							text="no"
							variant={"contained"}
							onClick={handleConfirmDeleteClose}
							size="small"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={loading ? <CommonProgress /> : "yes"}
							onClick={handleDelete}
							variant={"contained"}
							color="error"
							size="small"
							disabled={loading}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
		</>
	);
});
