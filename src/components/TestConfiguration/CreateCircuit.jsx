import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import {
	Checkbox,
	IconButton,
	InputAdornment,
	TextField,
	Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "components/ReusableComponents/Card";
import CustomTextField from "components/ReusableComponents/CustomTextField";
import CommonProgress from "components/ReusableComponents/Loaders";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import UIInputField from "components/ReusableComponents/UIInputField";
import UISelectField from "components/ReusableComponents/UISelectField";
import { convertHtmlToText } from "helpers/common_helper";
import { specializations } from "helpers/constants";
import { imageByType } from "helpers/imageHelper";
import { useUserType } from "hooks/useUserType";
import _, { isEqual } from "lodash";
import { useEffect, useState } from "react";
import {
	Controller,
	FormProvider,
	useForm,
	useFormContext,
} from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	CREATE_CIRCUIT_WITH_BULK_CASES,
	GET_CASE_BY_STATION_TYPE,
	GET_STATIONS_LIST,
	UPDATE_CIRCUIT,
} from "../../adapters/noki_ed.service";
import DoneIconGif from "../../assets/icons/done_png.gif";
import { circuitModesConfig } from "../../constants";
import UIButton from "../ReusableComponents/UIButton";
import UIModal from "../ReusableComponents/UIModal";
import ManageCase from "./HandleCase/ManageCase";

const visibilityOptions = [
	{ value: "private", label: "Test" },
	{ value: "public", label: "Practice" },
];

const CreateCircuit = ({ handleCloseCreate, RefreshCircuit, mode, data }) => {
	const defaultValues = {
		circuit: data?.name,
		description: data?.description,
		stations: data?.stations || [],
		visibility: data?.visibility || "public",
	};
	const methods = useForm({
		defaultValues,
	});
	const {
		handleSubmit,
		setValue,
		control,
		formState: { errors, isDirty },
		getValues,
	} = methods;
	const [isDone, setIsDone] = useState(false);
	const [loading, setLoading] = useState(false);
	const [successModalData, setSuccessModalData] = useState(null);
	const userRole = useUserType();
	const userID = useSelector((state) => state?.auth?.personData?.id);

	// const handleCloseModal = () => {
	// 	setIsDone(false);
	// 	reset();
	// 	setSuccessModalData();
	// };

	const transformDataToPayload = (data, isEdit = false) => {
		const {
			circuit,
			stations,
			description,
			circuit_id,
			visibility,
			created_by,
			updated_by,
		} = data;
		const circuit_name = circuit?.trim();
		const circuit_description = description?.trim();

		const stationsPayload = stations.map((station) => ({
			id: station.stationId,
			cases: station.cases,
		}));

		return {
			circuit_name,
			stations: stationsPayload,
			circuit_description,
			circuit_id,
			visibility,
			role: userRole.toLowerCase(),
			...(isEdit
				? { updated_by, created_by }
				: { created_by: userID, updated_by: userID }),
		};
	};
	const updatedStationCases = (formData) => {
		const stations = [];
		const dataMap = new Map(
			data.stations.map((station) => [station.stationId, station.cases]),
		);

		for (const { stationId, cases } of formData) {
			if (dataMap.has(stationId)) {
				const prevCases = dataMap.get(stationId);
				const uniqueCases = cases.filter((cases) => !prevCases.includes(cases));
				if (uniqueCases?.length > 0) {
					stations.push({ stationId, cases: uniqueCases });
				}
			} else {
				stations.push({ stationId, cases });
			}
		}

		return stations;
	};

	const onSubmitHandlers = {
		create: async (data) => {
			const values = getValues();

			if (values.stations.length === 0) {
				toast.error("Please select at least one station with cases.");
				return;
			}

			setLoading(true);

			try {
				const _response = await CREATE_CIRCUIT_WITH_BULK_CASES(
					transformDataToPayload(data, false),
				);
				setIsDone(true);
				setSuccessModalData({
					header: "Circuit Created Successfully!",
				});
				toast.success("Circuit Created Successfully!");
				// RefreshCircuit();
			} catch (err) {
				toast.error(err.message || "Error creating circuit");
				setSuccessModalData({
					message: err.message,
					header: "Circuit Creation Failed!",
				});
			} finally {
				setLoading(false);
			}
		},
		edit: async (formData) => {
			try {
				const existingData = { ...data };
				setLoading(true);

				const hasMetadataChanges =
					formData.circuit !== existingData.name ||
					formData.description !== existingData.description;

				const hasStationChanges = !isEqual(
					formData?.stations,
					existingData?.stations,
				);
				const message =
					hasMetadataChanges && hasStationChanges
						? "Circuit Updated Successfully!"
						: hasMetadataChanges
							? "Circuit Details Updated Successfully!"
							: "Circuit Cases Updated Successfully!";
				if (!hasMetadataChanges && !hasStationChanges) {
					toast.info(
						"It looks like you haven't made any changes. Please update something before proceeding.",
					);
					return;
				}

				if (hasMetadataChanges) {
					const metadataResponse = await UPDATE_CIRCUIT(existingData.id, {
						name: formData.circuit,
						description: formData.description,
						role: userRole.toLowerCase(),
						created_by: existingData?.created_by,
						updated_by: userID,
					});

					if (!metadataResponse) {
						throw new Error("Failed to update circuit details");
					}
				}

				if (hasStationChanges) {
					const stationPayload = {
						circuit_id: existingData.id,
						stations: updatedStationCases(formData?.stations),
						created_by: existingData.created_by,
						updated_by: userID,
					};

					const stationResponse = await CREATE_CIRCUIT_WITH_BULK_CASES(
						transformDataToPayload(stationPayload, true),
					);

					if (!stationResponse) {
						throw new Error("Failed to update circuit stations");
					}
				}

				setIsDone(true);
				RefreshCircuit();
				toast.success(message);
				setSuccessModalData({
					header: message,
				});
			} catch (error) {
				setSuccessModalData({
					message: error.message,
					header: "Circuit Update Failed!",
				});
				toast.error("Circuit Update Failed");
			} finally {
				setLoading(false);
			}
		},
	};

	return (
		<FormProvider {...methods}>
			<div className="d-flex flex-column h-100">
				<div className="p-2 d-flex justify-content-between align-items-center flex-wrap">
					<div className="d-flex align-items-center gap-2">
						<IconButton
							color="primary"
							onClick={handleCloseCreate}
							className="p-0"
						>
							<Close
								sx={{ fontSize: "1.5rem", color: "rgba(88, 64, 186, 1)" }}
							/>
						</IconButton>
						<div
							style={{
								fontSize: "1rem",
								fontWeight: "bold",
							}}
						>
							{circuitModesConfig?.[mode]?.title}
						</div>
					</div>
					<div className="d-flex justify-content-between align-items-center gap-3">
						{/* <UIButton text="Save as Draft" className="p-2 px-4 rounded-pill" /> */}
						<UIButton
							text={
								loading ? (
									<CommonProgress />
								) : (
									circuitModesConfig?.[mode]?.saveButtonTitle
								)
							}
							variant="contained"
							className="p-2 px-4 rounded-pill"
							onClick={handleSubmit(onSubmitHandlers?.[mode])}
							disabled={loading || !isDirty}
						/>
					</div>
				</div>
				<div
					className={`card-bg-secondary p-3 flex-grow-1 overflow-auto ${mode === "edit" && "circuit-card-height"}`}
				>
					<div className="rounded-4 secondary-bg-color p-3">
						<h4 className="m-0">Circuit Configuration</h4>
						<Grid container spacing={2} className="mt-0 p-0">
							<Grid item xs={12} md={3}>
								<Controller
									name={"circuit"}
									control={control}
									rules={{
										required: "Circuit Name is required",
										validate: (value) =>
											value.trim() !== "" || "Circuit cannot be empty",
									}}
									render={({ field }) => (
										<UIInputField
											{...field}
											label="Circuit Name"
											isRequired={true}
											disabled={!circuitModesConfig?.[mode]?.isNameEdit}
											error={!!errors?.circuit}
											helperText={errors?.circuit?.message}
											size={"small"}
											fullWidth
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} md={3}>
								<Controller
									name="visibility"
									control={control}
									rules={{ required: "Visibility is required" }}
									render={({ field }) => (
										<UISelectField
											// {...field}
											label="Mode"
											options={visibilityOptions}
											error={!!errors.visibility}
											multiple={false}
											value={field?.value ? [field.value] : []}
											onChange={(e) => {
												field.onChange(e.target.value);
												setValue("stations", []);
											}}
											errorMessage={
												errors?.visibility ? errors.visibility.message : ""
											}
											disabled={!circuitModesConfig?.[mode]?.isVisibility}
											size="small"
											fullWidth
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<Controller
									name={"description"}
									control={control}
									rules={{
										required: "Description is required",
										validate: (value) =>
											value.trim() !== "" || "Description cannot be empty",
									}}
									render={({ field }) => (
										<UIInputField
											{...field}
											label="Description"
											isRequired={true}
											disabled={!circuitModesConfig?.[mode]?.isDescriptionEdit}
											error={!!errors?.description}
											helperText={errors?.description?.message}
											size={"small"}
											fullWidth
										/>
									)}
								/>
							</Grid>
						</Grid>

						<div>
							<form onSubmit={handleSubmit(onSubmitHandlers?.[mode])}>
								<StationsList
									setValue={setValue}
									control={control}
									prevSelected={data?.stations}
									isDirty={isDirty}
								/>

								<UIModal
									open={isDone}
									handleClose={() => {
										RefreshCircuit();
										handleCloseCreate();
									}}
									closeOnBackdropClick={false}
									loading={loading}
								>
									<SuccessMessage
										handleClose={() => {
											RefreshCircuit();
											handleCloseCreate();
										}}
										loading={loading}
										data={successModalData}
									/>
								</UIModal>
							</form>
						</div>
					</div>
				</div>
			</div>
		</FormProvider>
	);
};

export default CreateCircuit;

const StationsList = ({ prevSelected }) => {
	const { control, setValue, clearErrors, getValues, watch } = useFormContext();
	const [stationList, setStationList] = useState([]);
	const [casesList, setCasesList] = useState([]);
	const [originalCaseList, setOriginalCaseList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [stationLoading, setStationLoading] = useState(true);
	const [value, setTabValue] = useState(0);
	const [searchText, setSearchText] = useState("");
	const [specialty, setSpecialty] = useState("");
	const [viewCase, setViewCase] = useState(null);

	const getStations = async () => {
		try {
			setStationLoading(true);
			const res = await GET_STATIONS_LIST();
			setStationList(res?.data?.stations || []);
		} catch (e) {
			console.error(e);
		} finally {
			setStationLoading(false);
		}
	};

	useEffect(() => {
		getStations();
	}, []);

	useEffect(() => {
		if (stationList.length > 0 && value >= 0) {
			setLoading(true);
			const stationType = stationList[value]?.id;
			getCasesByStationType(stationType, ["public", "private"]);
		}
	}, [value, stationList]);

	const getCasesByStationType = async (
		stationType,
		visibility = ["public", "private"],
	) => {
		try {
			const { data } = await GET_CASE_BY_STATION_TYPE({
				stationType,
				visibility,
				page: 0,
				pageSize: 99999,
			});
			setOriginalCaseList(data?.data || []);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		let filteredCases = originalCaseList;
		setLoading(true);
		if (specialty) {
			filteredCases = filteredCases.filter(
				(item) =>
					_.toLower(_.trim(item?.case_type)) === _.toLower(_.trim(specialty)),
			);
		}

		if (searchText) {
			filteredCases = filteredCases.filter((item) =>
				_.toLower(_.trim(item?.name)).includes(_.toLower(_.trim(searchText))),
			);
		}

		const filteredValue = getValues("visibility");
		if (filteredValue) {
			filteredCases = filteredCases.filter(
				(item) => filteredValue === item?.visibility,
			);
		}
		setLoading(false);
		setCasesList(filteredCases);
	}, [searchText, specialty, originalCaseList, watch("visibility"), getValues]); // Added getValues as a dependency

	const handleTabChange = (_, newValue) => setTabValue(newValue);

	const handleCheckboxChange = (stationId, caseId, isChecked) => {
		const updatedStations = getValues("stations") || [];
		const stationIndex = updatedStations.findIndex(
			(station) => station.stationId === stationId,
		);

		if (stationIndex > -1) {
			const station = updatedStations[stationIndex];
			if (isChecked) {
				if (!station.cases.includes(caseId)) station.cases.push(caseId);
			} else {
				station.cases = station.cases.filter((id) => id !== caseId);
				if (station.cases.length === 0) updatedStations.splice(stationIndex, 1);
			}
		} else if (isChecked) {
			updatedStations.push({ stationId, cases: [caseId] });
		}

		setValue("stations", updatedStations, { shouldDirty: true });
		if (updatedStations.length > 0) clearErrors("stations");
	};

	const getCheckboxState = (stationId, caseId) => {
		const currentStations = getValues("stations") || [];
		const station = currentStations.find(
			(station) => station.stationId === stationId,
		);
		const checked = station ? station.cases.includes(caseId) : false;
		const disabled = prevSelected
			?.find((station) => station.stationId === stationId)
			?.cases.includes(caseId);
		return { checked, disabled };
	};

	const handleSearchChange = (e) => setSearchText(e.target.value.toLowerCase());
	const handleSpecialtyChange = (e) => setSpecialty(e.target.value);

	return (
		<>
			<ManageCase
				id={viewCase}
				open={!!viewCase}
				handleClose={() => setViewCase(null)}
				viewOnly={true}
			/>

			<div className="flex-grow-1 overflow-auto d-flex flex-column my-3">
				{stationLoading ? (
					<div className="h-100 d-flex justify-content-center align-items-center">
						<CommonProgress />
					</div>
				) : (
					<>
						<UITabs
							tabList={stationList.map((item) => item.type)}
							handleTabChange={handleTabChange}
							value={value}
						/>
						<div className="d-flex justify-content-between align-items-center flex-wrap p-3 gap-2 flex-row">
							<div className="d-flex flex-grow-1">
								Cases Selected:{" "}
								{watch("stations")?.reduce(
									(acc, station) => acc + station?.cases?.length,
									0,
								) || 0}
							</div>
							<div className="d-flex flex-grow-1 justify-content-center gap-2">
								<TextField
									variant="outlined"
									placeholder="Search for case"
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<SearchIcon style={{ color: "#5D5FEF" }} />
											</InputAdornment>
										),
									}}
									size="small"
									value={searchText}
									onChange={handleSearchChange}
									fullWidth
								/>
								<CustomTextField
									label="Select Specialty"
									options={specializations}
									value={specialty}
									onChange={handleSpecialtyChange}
									width="100%"
								/>
							</div>
						</div>

						<div className="overflow-auto">
							{stationList.map((station, idx) => (
								<TabPanel
									key={`station-${station.id}-${idx}`}
									value={value}
									index={idx}
								>
									{loading ? (
										<div className="h-100 d-flex align-items-center justify-content-center">
											<CommonProgress />
										</div>
									) : !casesList.length ? (
										<div
											className="d-flex align-items-center justify-content-center"
											style={{ height: "50vh" }}
										>
											No Data Found
										</div>
									) : (
										<div className="row p-0 m-0">
											{casesList.map((item, idx) => (
												<div
													className="col-md-6 col-lg-4 p-2"
													key={`case-${item.id}-${idx}`}
												>
													<Card
														cardImageClass={imageByType("Circuit", item)}
														item={item}
														name={item.name}
														description={convertHtmlToText(item.description)}
														badgeText={item.case_type}
														jsx={
															<Controller
																name={`stations.${station.id}.cases.${item.id}`}
																control={control}
																render={({ field }) => (
																	<Checkbox
																		{...field}
																		{...getCheckboxState(station.id, item.id)}
																		onChange={(e) =>
																			handleCheckboxChange(
																				station.id,
																				item.id,
																				e.target.checked,
																			)
																		}
																	/>
																)}
															/>
														}
														actions={[
															{
																label: "View",
																handler: () => setViewCase(item?.id),
															},
														]}
													/>
												</div>
											))}
										</div>
									)}
								</TabPanel>
							))}
						</div>
					</>
				)}
			</div>
		</>
	);
};

const SuccessMessage = ({ handleClose, loading, data }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "16px",
				textAlign: "center",
			}}
		>
			<Typography variant="h6" style={{ fontWeight: 600 }}>
				{data?.header}
			</Typography>

			<Box>
				{loading ? (
					<div className="d-flex justify-content-center align-items-center h-100">
						<CommonProgress />
					</div>
				) : data?.message ? (
					<Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
						{data.message}
					</Typography>
				) : (
					<img src={DoneIconGif} alt="Done" width={"100%"} />
				)}
			</Box>
			{!loading && (
				<UIButton
					text="Done"
					className="rounded rounded-pill px-3 w-100"
					variant="contained"
					color="primary"
					disabled={loading}
					onClick={handleClose}
				/>
			)}
		</Box>
	);
};
