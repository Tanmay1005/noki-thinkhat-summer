import { Close, Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import {
	CREATE_STATIONS,
	GET_STATION_BY_ID,
	UPDATE_STATION_BY_ID,
} from "adapters/noki_ed.service";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import UISelectField from "components/ReusableComponents/UISelectField";
import { applicableType as stationTypes } from "helpers/constants";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import CommonProgress from "../ReusableComponents/Loaders";
import UICard from "../ReusableComponents/UICard";

const StationsDetailsCard = ({
	handleClose: setOpen,
	stationId,
	handleRenderComponent,
}) => {
	const {
		handleSubmit,
		setValue,
		control,
		watch,
		getValues,
		formState: { errors },
	} = useForm({
		defaultValues: {
			type: "",
			time_limit: "",
			description: "",
			objectives: [{ value: "" }],
		},
	});
	const [loading, setLoading] = useState(!!stationId);
	const [defaultValues, setDefaultValues] = useState({});
	const [disableUpdate, setDisableUpdate] = useState(true);
	const fetchStationDetails = async () => {
		try {
			setLoading(true);
			const response = await GET_STATION_BY_ID(`/${stationId}`);
			const data = response;
			if (data) {
				const { type, time_limit, description, objectives } = data;
				setValue("type", type);
				setValue("time_limit", time_limit.toString());
				setValue("description", description);
				setValue(
					"objectives",
					objectives.map((obj) => ({ value: obj })),
				);
				setDefaultValues({
					type,
					time_limit: time_limit?.toString(),
					description,
					objectives: objectives?.map((obj) => ({ value: obj })),
				});
			}
		} catch (e) {
			console.error("Error fetching station details:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (stationId) {
			fetchStationDetails();
		} else {
			setLoading(false);
			setValue("type", "");
			setValue("time_limit", "");
			setValue("description", "");
			setValue("objectives", [{ value: "" }]);
		}
	}, [stationId]);

	const { fields, append, remove } = useFieldArray({
		control,
		name: "objectives",
	});
	useEffect(() => {
		const currentData = getValues();
		setDisableUpdate(
			JSON.stringify(currentData) === JSON.stringify(defaultValues),
		);
	}, [watch()]);
	const onSubmit = async (data) => {
		data.objectives = data?.objectives?.map((item) => ({
			value: item?.value?.trim(),
		}));
		try {
			if (typeof data.time_limit === "string") {
				data.time_limit = Number.parseInt(data.time_limit, 10);
			}
			data.objectives = data.objectives.map((item) => item.value);
			let response;
			if (stationId) {
				response = await UPDATE_STATION_BY_ID(`/${stationId}`, data);
			} else {
				response = await CREATE_STATIONS(data);
			}
			toast.success(
				`Station ${stationId ? "Updated" : "Created"} Successfully`,
			);
			return response;
		} catch (e) {
			console.error(e);
			toast.error(`Station ${stationId ? "Update" : "Create"} failed`);
		} finally {
			setOpen(false);
			handleRenderComponent();
		}
	};

	return (
		<>
			<div className="d-flex flex-column h-100">
				<div className="mx-3 py-2 d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center gap-2">
						<IconButton
							onClick={() => setOpen(false)}
							fontSize="1.5rem"
							className="p-0"
						>
							<Close
								sx={{ fontSize: "1.5rem", color: "rgba(88, 64, 186, 1)" }}
							/>
						</IconButton>
						<span style={{ fontWeight: 600, fontSize: "16px" }}>
							{stationId ? "Edit Station" : "Add Station"}
						</span>
					</div>
					<UIButton
						text={stationId ? "Update Station" : "Add Station"}
						variant="contained"
						size="large"
						onClick={handleSubmit(onSubmit)}
						disabled={loading || (stationId && disableUpdate)}
					/>
				</div>
				<div className="p-3 flex-grow-1 overflow-auto card-bg-secondary">
					<div className="">
						{loading ? (
							<div className="h-100 d-flex align-items-center justify-content-center h-100">
								<CommonProgress />
							</div>
						) : (
							<>
								<UICard
									customClasses="border-none"
									customBodyClasses={"p-4"}
									CardBody={
										<form className="row m-0 p-0">
											<div
												className="col-12 mb-2"
												style={{ fontWeight: "bold", fontSize: "16px" }}
											>
												Station Details
											</div>

											<div className="col-md-4">
												<Controller
													name="type"
													control={control}
													defaultValue=""
													rules={{ required: "Station type is required" }}
													render={({ field }) => (
														<UISelectField
															{...field}
															label="Station Type *"
															options={stationTypes}
															error={!!errors.type}
															multiple={false}
															errorMessage={
																errors.type ? errors.type.message : ""
															}
															fullWidth
														/>
													)}
												/>
											</div>

											<div className="col-md-4">
												<Controller
													name="time_limit"
													control={control}
													defaultValue=""
													render={({ field }) => (
														<UIInputField
															{...field}
															onChange={(e) => {
																const value = e.target.value;
																if (value === "" || /^\d+$/.test(value)) {
																	field?.onChange(value);
																}
															}}
															label="Time limit to complete (In minutes) *"
															error={!!errors.time_limit}
															helperText={
																errors.time_limit
																	? errors.time_limit.message
																	: ""
															}
															fullWidth
														/>
													)}
													rules={{
														required: "Time limit to complete is required",
														validate: (value) => {
															const parsedValue = Number.parseInt(value);

															if (parsedValue > 720) {
																return "Time limit to complete cannot exceed 720 minutes";
															}

															if (parsedValue <= 0) {
																return "Time limit to complete must be greater than 0";
															}

															return true;
														},
													}}
												/>
											</div>

											<div className="col-md-12 mt-2">
												<Controller
													name="description"
													control={control}
													defaultValue=""
													render={({ field }) => (
														<CustomRichTextEditor
															{...field}
															label="Description *"
															onChange={(e) => setValue("description", e)}
															error={!!errors.description}
															fullWidth
															errorMessage={
																errors.description
																	? errors.description.message
																	: ""
															}
														/>
													)}
													rules={{ required: "Description is required" }}
												/>
											</div>
										</form>
									}
								/>

								<UICard
									customClasses="border-none my-4"
									customBodyClasses={"p-4"}
									CardBody={
										<div className="px-4 py-0">
											{fields?.map((item, idx) => (
												<div
													className="d-flex gap-2 py-2"
													key={`station-details-card-fields-${item.id}-${idx}`} // Should be unique as we are using id and index
												>
													<Controller
														name={`objectives.${idx}.value`}
														control={control}
														render={({ field }) => (
															<UIInputField
																{...field}
																label={`Objective ${idx + 1} *`}
																type="text"
																error={!!errors.objectives?.[idx]?.value}
																helperText={
																	errors.objectives?.[idx]?.value
																		? errors.objectives[idx].value.message
																		: ""
																}
																fullWidth
															/>
														)}
														rules={{
															required: "Objective is required",
															validate: (value) =>
																value.trim() !== "" ||
																"Objective cannot be empty",
															maxLength: {
																value: 300,
																message:
																	"Objective cannot exceed 300 characters",
															},
														}}
													/>
													<IconButton
														onClick={() => {
															if (fields.length > 1) {
																remove(idx);
															}
														}}
														disabled={fields.length === 1}
													>
														<Delete />
													</IconButton>
												</div>
											))}
											{fields.length >= 10 ? (
												<p style={{ color: "red", fontSize: "0.9rem" }}>
													You can only add up to 10 objectives.
												</p>
											) : (
												<UIButton
													onClick={() => {
														if (fields.length < 10) {
															append({ value: "" });
														}
													}}
													text="Add objective"
													className="rounded rounded-pill px-3 my-2"
												/>
											)}
										</div>
									}
								/>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default StationsDetailsCard;
