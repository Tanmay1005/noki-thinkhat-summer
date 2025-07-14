import { Tune } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import { Tab, Tabs } from "@mui/material";
import Filter from "components/ReusableComponents/Filter";
import OSCEPage from "components/Student/OSCEPage";
import StudentCaseList from "components/TestConfiguration/StudentCaseList";
import { specializations } from "helpers/constants";
// import useDebounce from "hooks/useDebounce";
import { removeQuery, setQuery, useQuery } from "hooks/useQuery";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getStations } from "../../redux/thunks/stations";
import TabPanel from "../ReusableComponents/Tabs";
import { UITabs } from "../ReusableComponents/Tabs";
import UIButton from "../ReusableComponents/UIButton";
import StudentCircuitPage from "../TestConfiguration/StudentCircuitPage";

const OSCETraining = () => {
	const [value, setValue] = useState(0);
	const [caseFilter, setCaseFilter] = useState([]);
	const [circuitFilter, setCircuitFilter] = useState([]);
	const [filter, setFilter] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [caseValue, setCaseValue] = useState(0);
	const queryParams = useQuery();
	const navigate = useNavigate();
	const memoizedFilter = useMemo(() => filter, [JSON.stringify(filter)]);
	const stations = useSelector((state) => state.stations?.data);
	const reduxDispatch = useDispatch();
	// const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const handleFilterSelect = (item) => {
		setFilter(item);
	};

	const unselectAll = () => {
		setFilter([]);
	};
	const handleTabChange = (_event, newValue) => {
		setSearchTerm("");
		setValue(newValue);
		setQuery("tab", newValue);
		if (newValue === 1) {
			if (!queryParams.get("stationTab")) {
				setQuery("stationTab", 0);
			}
		} else {
			removeQuery("stationTab");
		}
		if (newValue === 0) {
			if (!queryParams.get("caseTab")) {
				setQuery("caseTab", 0);
			}
		} else {
			removeQuery("caseTab");
			setCaseValue(0);
		}
	};
	const handleCaseTabChange = (_event, newValue) => {
		setSearchTerm("");
		setCaseValue(newValue);
		setQuery("caseTab", newValue);
	};

	useEffect(() => {
		const tabParam = queryParams.get("tab");
		const stationTabParam = queryParams.get("stationTab");
		const caseTabParam = queryParams.get("caseTab");
		const tabValue = Number.parseInt(tabParam, 10);
		if (!Number.isNaN(tabValue)) {
			setValue(tabValue);
			if (tabValue === 1) {
				if (!stationTabParam) {
					setQuery("stationTab", 0);
				}
			} else {
				if (stationTabParam) {
					removeQuery("stationTab");
				}
			}
			if (tabValue === 0) {
				if (caseTabParam !== null) {
					const caseTabValue = Number.parseInt(caseTabParam, 10);
					if (!Number.isNaN(caseTabValue)) {
						setCaseValue(caseTabValue);
					}
				} else {
					setCaseValue(0);
				}
			} else {
				if (caseTabParam) {
					removeQuery("caseTab");
					setCaseValue(0);
				}
			}
		}
		if (!stations) {
			reduxDispatch(getStations());
		}
	}, [queryParams]);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const tabLabels = ["Single Station Cases", "Full Cases"];
	return (
		<div className="d-flex flex-column h-100">
			<div className="d-flex justify-content-between px-4 pt-4">
				<div>
					<h3>OSCE Training</h3>
				</div>
				<div className="d-flex flex-row gap-4">
					<TextField
						variant="outlined"
						placeholder={value === 2 ? "Search for circuit" : "Search for case"}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<SearchIcon style={{ color: "#5D5FEF" }} />
								</InputAdornment>
							),
						}}
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": {
									border: "none",
								},
								borderBottom: "1px solid #5D5FEF",
								borderRadius: "0px",
							},
						}}
						size="small"
						value={searchTerm}
						onChange={handleSearchChange}
					/>
					{value !== 2 && (
						<Filter
							list={
								value === 2
									? [
											...new Map(
												circuitFilter.map((item) => [item.name, item]),
											).values(),
										]?.map((o) => {
											return { label: o?.name, value: o?.name };
										})
									: specializations?.map((o) => {
											return { label: o?.value, value: o?.value };
										})
							}
							handleFilter={handleFilterSelect}
							buttonComponent={<UIButton text="Filters" endIcon={<Tune />} />}
							selectedItem={filter}
							isMultiSelect={true}
							clearSelection={unselectAll}
						/>
					)}
				</div>
			</div>

			<div className="px-2 d-flex justify-content-between align-items-center">
				<UITabs
					scrollButtons={false}
					tabList={["Cases", "Stations", "Circuits"]}
					handleTabChange={handleTabChange}
					className="border-0"
					value={value}
					sx={{
						width: "max-content",
					}}
				/>

				<UIButton
					text={"Score Card"}
					variant="contained"
					onClick={() => navigate("/allscores")}
				/>
				{/* <CreateWrapper
					open={openScores}
					handleClose={() => setOpenScores(false)}
					allowBackdorpClose={true}
				>
					<AllScoresTabs setOpenScores={setOpenScores} />
				</CreateWrapper> */}
			</div>

			<div style={{ height: "90%", overflow: "auto" }}>
				<TabPanel
					className="rounded-bottom-4 px-2"
					value={value}
					index={0}
					key="osce-assessment-tabpanel-0" // Key is unique
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
					<StudentCaseList
						key={caseValue}
						filter={memoizedFilter}
						setCaseFilter={setCaseFilter}
						caseFilter={caseFilter}
						setFilter={setFilter}
						searchTerm={searchTerm}
						isMultiStationCase={caseValue === 1}
					/>
				</TabPanel>
				<TabPanel
					className="rounded-bottom-4 px-2"
					value={value}
					index={1}
					key="osce-assessment-tabpanel-1" // Key is unique
				>
					<OSCEPage
						filter={memoizedFilter}
						setCaseFilter={setCaseFilter}
						caseFilter={caseFilter}
						setFilter={setFilter}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
					/>
				</TabPanel>
				<TabPanel
					className="rounded-bottom-4"
					value={value}
					index={2}
					key="osce-assessment-test-tab" // Key is unique
				>
					<StudentCircuitPage
						filter={filter}
						circuitFilter={circuitFilter}
						setCircuitFilter={setCircuitFilter}
						setFilter={setFilter}
						searchTerm={searchTerm}
					/>
				</TabPanel>
			</div>
		</div>
	);
};

export default OSCETraining;
