import { Close, Delete } from "@mui/icons-material";
import {
	FormControl,
	FormControlLabel,
	// FormControlLabel,
	FormHelperText,
	IconButton,
	// Radio,
	// RadioGroup,
	Skeleton,
	Stack,
	Switch,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	CREATE_OR_UPDATE_TEST_ASSIGNMENTS,
	DELETE_TEST_ASSIGNMENT_BY_ID,
	GET_ASSIGNED_TEST_ASSIGNMENTS,
} from "adapters/noki_ed.service";
import UIButton from "components/ReusableComponents/UIButton";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIModal from "components/ReusableComponents/UIModal";
import UISelectField from "components/ReusableComponents/UISelectField";
import dayjs from "dayjs";
import { getDateFromISOString } from "helpers/common_helper";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const formatAssignedGroups = (groups) => {
	return groups?.map(
		({
			user_group: { name },
			id,
			is_published,
			start_time,
			end_time,
			assigned_by,
		}) => ({
			name,
			id,
			is_published: is_published ? "yes" : "no",
			start_time: getDateFromISOString(start_time),
			end_time: getDateFromISOString(end_time),
			is_default: true,
			assigned_by,
		}),
	);
};
const PrivateGroupAssignForm = ({
	case_id,
	circuit_id,
	handleClose,
	groupsList,
	render,
	isCaseAssign,
}) => {
	const [rawAssignmentData, setRawAssignmentData] = useState([]);
	const [disableProceedAction, setDisableProceedAction] = useState(true);
	const [loading, setLoading] = useState(false);
	const [loadingTestsAssigned, setLoadingTestsAssigned] = useState(false);
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(undefined);
	const [_, setAssignedGroups] = useState([]);
	const groupListMap = groupsList?.reduce((acc, curr) => {
		acc[curr.name] = curr.id;
		return acc;
	}, {});
	const [count, setCount] = useState(0);
	const {
		control,
		handleSubmit,
		formState: { errors, isValid },
		getValues,
		setValue,
		watch,
		reset,
	} = useForm({
		mode: "onChange",
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: "circuitGroups",
	});
	const values = watch("circuitGroups");
	const assignedGroupNames = values?.map(({ name }) => name);
	const availableGroups = groupsList?.filter(
		({ name }) => !assignedGroupNames?.includes(name),
	);
	const userId = useSelector((state) => state?.auth?.personData?.id);

	const entityId = case_id ? { case_id } : { circuit_id };

	useEffect(() => {
		const currentData = getValues("circuitGroups");
		if (currentData?.length === 0) {
			append({
				group_id: "",
				is_published: "",
				start_time: "",
				end_time: "",
				name: "",
			});
		}
		if (JSON.stringify(currentData) !== JSON.stringify(rawAssignmentData)) {
			setDisableProceedAction(false);
		} else {
			setDisableProceedAction(true);
		}
	}, [watch()]);

	const handleAddGroupForm = () => {
		if (isValid) {
			append({
				group_id: "",
				is_published: "",
				start_time: "",
				end_time: "",
				name: "",
			});
		}
	};

	const handleRemoveGroupForm = (index) => {
		if (values?.[index]?.is_default) {
			setIsRemoveModalOpen(index);
		} else {
			remove(index);
		}
	};

	const handleDeleteAssignment = async () => {
		try {
			await DELETE_TEST_ASSIGNMENT_BY_ID(values?.[isRemoveModalOpen]?.id);
			toast.success("Test Assignment Successfully Deleted");
			setCount((prev) => prev + 1);
		} catch (err) {
			toast.error(err.message || "Error While Deleting Test Assignment");
		} finally {
			remove(isRemoveModalOpen);
			setRawAssignmentData((prev) =>
				prev?.filter((_item, idx) => idx !== isRemoveModalOpen),
			);
			setIsRemoveModalOpen(undefined);
		}
	};

	const onSubmit = async (data) => {
		const assignments = data?.circuitGroups
			?.filter((group) => {
				const rawGroup = rawAssignmentData.find((raw) => raw.id === group.id);
				return (
					!group.is_default ||
					!rawGroup ||
					rawGroup.name !== group.name ||
					rawGroup.start_time !== group.start_time ||
					rawGroup.end_time !== group.end_time ||
					rawGroup.is_published !== group.is_published
				);
			})
			.map(({ name, id, start_time, end_time, is_published, assigned_by }) => ({
				group_id: groupListMap?.[name],
				...entityId,
				start_time: dayjs(start_time).format("YYYY-MM-DD"),
				end_time: dayjs(end_time).format("YYYY-MM-DD"),
				is_published: is_published === "yes",
				...(id && { id }),
				...(assigned_by ? { assigned_by } : { assigned_by: userId }),
			}));

		const payload = {
			assignments,
		};
		try {
			setLoading(true);
			await CREATE_OR_UPDATE_TEST_ASSIGNMENTS(payload);
			toast.success(
				`Assignments ${rawAssignmentData?.length ? "updated" : "created"} successfully!`,
			);
			handleClose();
			render();
		} catch (error) {
			toast.error(error.message || "Group Assignment failed, Try again.");
		} finally {
			setLoading(false);
		}
	};

	const getAssignedTestGroups = async () => {
		try {
			setLoadingTestsAssigned(true);
			const response = await GET_ASSIGNED_TEST_ASSIGNMENTS(entityId);
			reset({
				circuitGroups: [...formatAssignedGroups(response.data.test_assignment)],
			});
			setAssignedGroups(response.data.test_assignment);
			setRawAssignmentData([
				...formatAssignedGroups(response.data.test_assignment),
			]);
		} catch {
			toast.error("Error Fetching Tests Assigned");
		} finally {
			setLoadingTestsAssigned(false);
		}
	};

	useEffect(() => {
		getAssignedTestGroups();
	}, [reset]);

	return (
		<>
			<UIModal
				open={isRemoveModalOpen >= 0}
				handleClose={() => setIsRemoveModalOpen(undefined)}
				width={400}
			>
				<RemoveTestAssignmentModal
					setIsRemoveModalOpen={setIsRemoveModalOpen}
					handleDeleteAssignment={handleDeleteAssignment}
				/>
			</UIModal>
			<div className="d-flex flex-column h-100">
				<div className="d-flex justify-content-between align-items-center mx-3 py-2">
					<div className="d-flex align-items-center gap-2">
						<IconButton
							disabled={loading || loadingTestsAssigned}
							fontSize="1.5rem"
							onClick={
								count > 0
									? () => {
											handleClose();
											render();
										}
									: handleClose
							}
							className="p-0"
						>
							<Close
								sx={{ fontSize: "1.5rem", color: "rgba(88, 64, 186, 1)" }}
							/>
						</IconButton>
						<Typography fontWeight="bold" fontSize={"1rem"}>
							{`Assign ${isCaseAssign ? "Case" : "Circuit"} to Groups`}
						</Typography>
					</div>
					<div className="d-flex gap-2">
						{/* <UIButton
							onClick={handleClose}
							className="p-2 px-4 rounded-pill"
							text="Go Back"
							disabled={loading || loadingTestsAssigned}
						/> */}

						<UIButton
							variant="contained"
							className="p-2 px-4 rounded-pill"
							text={"Proceed"}
							onClick={handleSubmit(onSubmit)}
							disabled={loading || disableProceedAction || loadingTestsAssigned}
						/>
					</div>
				</div>
				{/* <Typography fontSize={"1.2rem"} mx={3} fontWeight={"bold"}>
					{" "}
					Assign Circuit to Groups
				</Typography> */}
				<div className="flex-grow-1 mx-3 mt-2 mb-3 rounded-4 h-100 overflow-auto card-bg-secondary">
					{loadingTestsAssigned ? (
						<>
							{[1, 2, 3]?.map((item) => (
								<div key={item}>{LoadingSkeleton}</div>
							))}
						</>
					) : (
						<>
							<form onSubmit={handleSubmit(onSubmit)}>
								{fields?.map((field, index) => (
									<FormComponent
										key={`circuit-group-assignment-${field?.name}-${index}`}
										rawAssignmentData={rawAssignmentData}
										form={field}
										values={values?.[index]}
										index={index}
										removeForm={handleRemoveGroupForm}
										control={control}
										errors={errors}
										groupsList={groupsList}
										availableGroups={availableGroups}
										setValue={setValue}
										isCaseAssign={isCaseAssign}
									/>
								))}
								<div className="mx-3 mb-3">
									<UIButton
										variant="contained"
										onClick={handleAddGroupForm}
										disabled={!isValid || loading || loadingTestsAssigned}
										text="Add Another Group"
									/>
								</div>
							</form>
						</>
					)}
				</div>
			</div>
		</>
	);
};

const FormComponent = ({
	form,
	index,
	removeForm,
	control,
	errors,
	availableGroups,
	values,
	setValue,
	isCaseAssign,
	// rawAssignmentData,
}) => {
	const [isDisabled, setIsDisabled] = useState(form?.is_default);
	return (
		<div className="p-3">
			<div className="d-flex justify-content-between align-items-center">
				<h6 style={{ fontWeight: 600 }}>
					{values?.name ? values?.name : "Assign Group"}
				</h6>
				<div className="d-flex mb-2">
					{(index !== 0 || form?.is_default) && (
						<IconButton
							onClick={() => removeForm(index)}
							aria-label="delete"
							color="primary"
						>
							<Delete />
						</IconButton>
					)}
				</div>
			</div>
			<div className="row ">
				<div className="col-md-6">
					<Controller
						name={`circuitGroups.${index}.name`}
						control={control}
						rules={{
							required: "Group is required",
						}}
						render={({ field }) => {
							return (
								<UISelectField
									{...field}
									size="small"
									label="Group"
									required
									options={availableGroups.map(({ name }) => ({
										value: name,
										label: name,
									}))}
									error={!!errors?.circuitGroups?.[index]?.name}
									errorMessage={
										errors?.circuitGroups?.[index]?.name?.message || ""
									}
									fullWidth
									multiple={false}
									disabled={form?.is_default}
								/>
							);
						}}
					/>
				</div>
				<div className="col-md-12">
					<Controller
						name={`circuitGroups.${index}.is_published`}
						control={control}
						render={({ field }) => (
							<FormControl component="fieldset" fullWidth>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										margin: "8px",
									}}
								>
									<Typography mr={2} sx={{ fontWeight: "bold" }}>
										Visibility
									</Typography>
									<Tooltip
										title={`Toggle to change visibility of this ${isCaseAssign ? "case" : "circuit"}  for students`}
									>
										<FormControlLabel
											control={
												<Switch
													checked={field.value === "yes"}
													onChange={(e) =>
														field.onChange(e.target.checked ? "yes" : "no")
													}
												/>
											}
											label={field.value === "yes" ? "Yes" : "No"}
										/>
									</Tooltip>
								</div>
								{errors?.circuitGroups?.[index]?.is_published && (
									<FormHelperText>
										{errors.circuitGroups[index].is_published.message}
									</FormHelperText>
								)}
							</FormControl>
						)}
					/>
				</div>
				<Typography sx={{ fontWeight: "bold" }}>
					{`Availability of the ${isCaseAssign ? "Case" : "Circuit"}`}
				</Typography>
			</div>
			<div className="row">
				<div className="col-md-6 mb-2">
					<Controller
						name={`circuitGroups.${index}.start_time`}
						control={control}
						rules={{
							required: "Start Date is required",
							validate: (value) => {
								const startDate = dayjs(value).startOf("day");
								const endDate = dayjs(values?.end_time).startOf("day");
								if (!startDate.isValid()) {
									return "Start Date is Invalid";
								}
								if (endDate && startDate.isAfter(endDate)) {
									return "Start Date cannot be greater than End Date";
								}

								return true;
							},
						}}
						render={({ field }) => (
							<UIDatePicker
								{...field}
								label="Start Date"
								isRequired
								// minDate={dayjs()}
								errorMessage={
									errors?.circuitGroups?.[index]?.start_time?.message || ""
								}
								// onChange={(date) => {
								// 	field.onChange();
								// }}
							/>
						)}
					/>
				</div>

				<div className="col-md-6 mb-2">
					<Controller
						name={`circuitGroups.${index}.end_time`}
						control={control}
						rules={{
							required: "End Date is required",
							validate: (value) => {
								const startDate = dayjs(values?.start_time).startOf("day");
								const endDate = dayjs(value).startOf("day");

								if (!endDate.isValid()) {
									return "End Date is Invalid";
								}

								if (startDate && endDate.isBefore(startDate)) {
									return "End Date cannot be earlier than Start Date";
								}

								return true;
							},
						}}
						render={({ field }) => (
							<UIDatePicker
								{...field}
								label="End Date"
								isRequired
								// minDate={dayjs()}
								errorMessage={
									errors?.circuitGroups?.[index]?.end_time?.message || ""
								}
								// onChange={(date) => {
								// 	field.onChange(dayjs(date).format("YYYY-MM-DD"));
								// }}
							/>
						)}
					/>
				</div>
			</div>

			{!isDisabled && form?.is_default && (
				<div className="d-flex justify-content-end">
					<UIButton
						text="Save"
						onClick={() => {
							setIsDisabled(true);
							setValue(`circuitGroups.${index}.is_update`, true);
						}}
						sx={{
							width: "fit-content",
							textTransform: "capitalize !important",
						}}
					/>
				</div>
			)}
		</div>
	);
};
const RemoveTestAssignmentModal = ({
	setIsRemoveModalOpen,
	handleDeleteAssignment,
}) => {
	return (
		<div className="modal-content p-2">
			<div className="modal-body">
				<div className="d-flex flex-column justify-content-center align-items-center">
					<h6 style={{ fontWeight: "bold" }}>
						Are you sure you want to Delete?
					</h6>
					{/* <span style={{ textAlign: "center" }}>
					Do you really want to end this session?
				</span> */}
				</div>
			</div>
			<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
				<UIButton
					text="cancel"
					onClick={() => setIsRemoveModalOpen(undefined)}
					sx={{
						width: "100%",
						textTransform: "capitalize !important",
					}}
				/>

				<UIButton
					text="Yes"
					variant="contained"
					onClick={handleDeleteAssignment}
					sx={{
						width: "100%",
						textTransform: "capitalize !important",
					}}
				/>
			</div>
		</div>
	);
};
export default PrivateGroupAssignForm;

const LoadingSkeleton = (
	<Stack spacing={1} m={2}>
		<div className="d-flex gap-3 justify-content-between">
			<Skeleton
				className="flex-grow-1"
				variant="text"
				sx={{ fontSize: "1rem" }}
			/>
			<Skeleton variant="circular" width={40} height={40} />
		</div>
		{/* For other variants, adjust the size with `width` and `height` */}
		<Skeleton className="" variant="rectangular" width={250} height={50} />
		<Skeleton className="" variant="rectangular" width={200} height={20} />
		<div className="d-flex gap-4">
			<Skeleton className="" variant="rectangular" width={250} height={50} />
			<Skeleton className="" variant="rectangular" width={250} height={50} />
		</div>
	</Stack>
);
