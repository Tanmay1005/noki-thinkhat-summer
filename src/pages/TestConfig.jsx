import { Tune } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Menu, MenuItem } from "@mui/material";
import { Tab, Tabs } from "@mui/material";
import { GET_STATIONS_LIST } from "adapters/noki_ed.service";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import Filter from "components/ReusableComponents/Filter";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import UIButton from "components/ReusableComponents/UIButton";
import StationListView from "components/StationComponents/StationListView";
// import StationsDetailsCard from "components/StationComponents/StationsDetailsCard";
import AdminCaseList from "components/TestConfiguration/AdminCaseList";
import CreateCircuit from "components/TestConfiguration/CreateCircuit";
import ManageCase from "components/TestConfiguration/HandleCase/ManageCase";
import useDebounce from "hooks/useDebounce";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminCircuitPage from "../components/TestConfiguration/AdminCircuitPage";

const visibilityOptions = [
	{ value: "private", label: "Test" },
	{ value: "public", label: "Practice" },
];

const TestConfig = ({
	isModal = false,
	isAssign = false,
	selectedCases = [],
	selectedCircuits = [],
	onCaseSelect,
	onCircuitSelect,
}) => {
	const [value, setValue] = useState(0);
	const [caseValue, setCaseValue] = useState(0);
	const [anchorEl, setAnchorEl] = useState(null);
	const location = useLocation();
	const navigate = useNavigate();
	const [createModule, setCreateModule] = useState(null);
	const [renderer, setRenderer] = useState(0);
	const [caseId, setCaseId] = useState(null);
	const [_selectedStationId, setSelectedStationId] = useState(null);
	const [visibilityState, setVisibilityState] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [stationsList, setStationsList] = useState([]);
	const [disableActions, setDisableActions] = useState(false);
	const [loading, setLoading] = useState(false);
	const [caseFilter, setCaseFilter] = useState([]);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const handleTabChange = (_event, newValue) => {
		setValue(newValue);
		if (!isModal) {
			if (newValue === 0) {
				navigate(`?tab=0&caseTab=${caseValue}`, { replace: true });
			} else {
				navigate(`?tab=${newValue}`, { replace: true });
			}
		}
		setVisibilityState([]);
	};
	const handleCaseTabChange = (_event, newValue) => {
		setCaseValue(newValue);
		if (!isModal) {
			navigate(`?tab=0&caseTab=${newValue}`, { replace: true });
		}
	};

	useEffect(() => {
		if (isModal) return;

		const queryParams = new URLSearchParams(location.search);
		const tab = queryParams.get("tab");
		const parsedTab = Number.parseInt(tab, 10);
		if (!Number.isNaN(parsedTab)) {
			setValue(parsedTab);

			if (parsedTab === 0) {
				const caseValue = Number.parseInt(queryParams.get("caseTab"), 10);
				setCaseValue(!Number.isNaN(caseValue) ? caseValue : 0);
			} else {
				setCaseValue(0);
			}
		} else {
			navigate("?tab=0&caseTab=0", { replace: true });
		}

		return () => {
			setVisibilityState([]);
			setSearchTerm("");
		};
	}, [location.search, navigate, setSearchTerm, isModal]);

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleMenuOpen = (e) => {
		setAnchorEl(e.target);
	};

	const handleCreate = (module) => {
		setCreateModule(module);
		handleMenuClose();
	};
	const handleCloseCreate = () => {
		setCreateModule(null);
		setSelectedStationId(null);
		setCaseId(null);
	};

	const RendererFunction = () => {
		setRenderer((p) => p + 1);
	};

	const handleEditStation = (id) => {
		setSelectedStationId(id);
		handleCreate("station");
	};

	const handleEditCase = (id) => (_event) => {
		setCaseId(id);
		handleCreate("case");
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};
	const tabLabels = ["Single Station Cases", "Full Cases"];

	const getStationsList = async () => {
		try {
			setLoading(true);
			const response = await GET_STATIONS_LIST();
			setStationsList(response?.data?.stations);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getStationsList();
	}, []);

	return (
		<div className="d-flex flex-column h-100">
			<div className="d-flex justify-content-between col-12 px-2">
				<UITabs
					tabList={
						isModal ? ["Cases", "Circuits"] : ["Cases", "Circuits", "Stations"]
					}
					handleTabChange={handleTabChange}
					value={value}
					className="border-0"
					sx={{
						fontSize: "14px",
					}}
				/>
				<div className=" d-flex gap-2 justify-content-end align-items-center">
					{(value === 0 || value === 1) && !isModal && (
						<Filter
							list={visibilityOptions} // Pass the entire array of objects with { label, value }
							handleFilter={(item) => {
								if (!isModal) {
									setVisibilityState(item);
								}
							}}
							buttonComponent={
								<UIButton
									text="Filters"
									endIcon={<Tune />}
									disabled={disableActions}
								/>
							}
							selectedItem={visibilityState}
							isMultiSelect
							clearSelection={() => setVisibilityState([])}
							disabled={disableActions}
							type={value === 0 ? "cases" : "circuits"}
						/>
					)}
					{!isModal && (
						<UIButton
							text="Create"
							variant="contained"
							onClick={handleMenuOpen}
							endIcon={<ArrowDropDownIcon />}
						/>
					)}
					<Menu
						anchorEl={anchorEl}
						id={"circuit-page-create-menu"}
						keepMounted
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
						sx={{
							backgroundColor: "rgba(0, 0, 0, 0.5)",
						}}
					>
						<MenuItem onClick={() => handleCreate("circuit")}>Circuit</MenuItem>
						{/* <MenuItem
							onClick={() => handleCreate("station")}
							disabled={stationsList?.length === 8}
						>
							Station
						</MenuItem> */}
						<MenuItem onClick={() => handleCreate("case")}>Case</MenuItem>
					</Menu>
				</div>
			</div>
			<div className="flex-grow-1 overflow-auto" key={renderer}>
				{" "}
				<TabPanel
					className="rounded-bottom-4 h-100 px-2"
					value={value}
					index={0}
					key="test-config-tabpanel-0"
					style={{ paddingTop: "5px" }}
				>
					<Tabs
						value={caseValue}
						onChange={handleCaseTabChange}
						aria-label="case tabs"
						variant="fullWidth"
						sx={{
							backgroundColor: "#F7F5FB",
							borderRadius: "35px",
							width: 400,
							padding: "2px",
						}}
						TabIndicatorProps={{ style: { display: "none" } }}
					>
						{tabLabels.map((label) => (
							<Tab
								key={`case-tab-${label}`}
								label={label}
								sx={{
									fontWeight: 500,
									fontSize: "14px",
									textTransform: "capitalize",
									borderRadius: "35px",
									"&.Mui-selected": {
										backgroundColor: "#5840BA",
										color: "white",
									},
								}}
							/>
						))}
					</Tabs>
					<AdminCaseList
						key={caseValue}
						visibilityState={visibilityState}
						isModal={isModal}
						isAssign={isAssign}
						handleEditCase={handleEditCase}
						refreshData={renderer}
						caseFilter={caseFilter}
						setCaseFilter={setCaseFilter}
						refreshCaseList={RendererFunction}
						setDisableActions={setDisableActions}
						isMultiStation={caseValue === 1}
						selected={selectedCases}
						onSelect={onCaseSelect}
					/>
				</TabPanel>
				<TabPanel
					className="rounded-bottom-4 h-100"
					value={value}
					index={1}
					key="test-config-tabpanel-2" // Key is unique
				>
					<AdminCircuitPage
						handleSearchChange={handleSearchChange}
						isModal={isModal}
						isAssign={isAssign}
						visibilityState={visibilityState}
						RefreshCircuit={RendererFunction}
						debouncedSearchTerm={debouncedSearchTerm}
						setDisableActions={setDisableActions}
						searchTerm={searchTerm}
						selected={selectedCircuits}
						onSelect={onCircuitSelect}
					/>
				</TabPanel>
				{!isModal && (
					<TabPanel
						className="rounded-bottom-4 h-100 px-2"
						value={value}
						index={2}
						key="test-config-tabpanel-1" // Key is unique
					>
						{" "}
						<StationListView
							open={createModule === "station"}
							setOpen={handleCloseCreate}
							handleEditStation={handleEditStation}
							loading={loading}
							stationsList={stationsList}
						/>
					</TabPanel>
				)}
			</div>
			{createModule === "case" ? (
				<>
					<ManageCase
						open={Boolean(createModule)}
						handleClose={handleCloseCreate}
						handleRender={RendererFunction}
						id={caseId}
					/>
				</>
			) : (
				<>
					{createModule === "circuit" && (
						<CreateWrapper
							open={Boolean(createModule)}
							// handleClose={handleCloseCreate}
						>
							{createModule === "circuit" && (
								<CreateCircuit
									handleCloseCreate={handleCloseCreate}
									RefreshCircuit={RendererFunction}
									mode="create"
								/>
							)}
							{/* {createModule === "station" && (
							<StationsDetailsCard
								handleClose={handleCloseCreate}
								stationId={selectedStationId}
								handleRenderComponent={RendererFunction}
							/>
						)} */}
							{/* {createModule === "case" && (
					<CaseCreate
						handleClose={handleCloseCreate}
						caseId={caseId}
						handleRenderComponent={RendererFunction}
					/>
				)} */}
						</CreateWrapper>
					)}
				</>
			)}
		</div>
	);
};

export default TestConfig;
