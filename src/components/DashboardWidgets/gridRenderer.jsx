import { DataGrid, GridOverlay } from "@mui/x-data-grid";

const DataTable = ({
	rows = [],
	title = "",
	columns = [],
	// onRowClicked = () => {},
	paginationMode,
	checkboxSelection,
	rowCount,
	onRowSelectionModelChange,
	rowSelectionModel,
	onPaginationModelChange,
	onSortModelChange,
	sortModel,
	pageSizeOptions = 10,
	loading = false,
	CustomHeader = null,
	height = "100%",
	getRowId,
	page = 0,
	sx = {},
	onRowDoubleClick = () => {},
}) => {
	// const apiRef = useGridApiRef();

	// const getSelectedRowData = (newRowSelectionModel) => {
	// 	if (newRowSelectionModel.length > 0) {
	// 		onRowClicked(apiRef.current.getRow(newRowSelectionModel[0]));
	// 		return;
	// 	}
	// 	onRowClicked(null);
	// };
	const CustomNoRowsOverlay = () => {
		return (
			<GridOverlay>
				<div style={{ padding: 20, textAlign: "center" }}>No Data Found</div>
			</GridOverlay>
		);
	};
	return (
		<>
			{CustomHeader ? (
				<CustomHeader />
			) : (
				<div className="d-flex justify-content-between align-items-baseline">
					<div className="fs-7 mb-2" style={{ fontWeight: "600" }}>
						{title}
					</div>
				</div>
			)}
			<div style={{ width: "100%", overflow: "auto", height: height }}>
				<DataGrid
					// apiRef={apiRef}
					rows={rows}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: pageSizeOptions,
							},
						},
					}}
					pageSizeOptions={[pageSizeOptions]}
					checkboxSelection={checkboxSelection}
					disableColumnReorder
					onRowSelectionModelChange={onRowSelectionModelChange}
					rowSelectionModel={rowSelectionModel}
					slotProps={{
						loadingOverlay: {
							variant: "skeleton",
							noRowsVariant: "skeleton",
						},
						pagination: {
							disabled: loading || rows.length === 0,
						},
					}}
					slots={{
						noRowsOverlay: CustomNoRowsOverlay,
						noResultsOverlay: CustomNoRowsOverlay,
					}}
					rowHeight={40}
					disableColumnResize
					columnHeaderHeight={50}
					keepNonExistentRowsSelected
					// onRowSelectionModelChange={getSelectedRowData}
					loading={loading}
					disableRowSelectionOnClick
					onRowDoubleClick={onRowDoubleClick}
					sx={{
						...sx,
						"& .MuiDataGrid-sortIcon": {
							color: "white !important",
						},
					}}
					autoHeight
					{...(paginationMode === "server" && {
						paginationMode,
						rowCount,
						onPaginationModelChange,
						paginationModel: {
							pageSize: pageSizeOptions,
							page,
						},
						sortModel,
						onSortModelChange,
						getRowId,
					})}
				/>
			</div>
		</>
	);
};

export default DataTable;
