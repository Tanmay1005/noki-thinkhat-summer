import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
	Autocomplete,
	Box,
	Grid,
	IconButton,
	TextField,
	Typography,
} from "@mui/material";
import { CREATE_OR_UPDATE_TEST_ASSIGNMENTS } from "adapters/noki_ed.service";
import UIButton from "components/ReusableComponents/UIButton";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import TestConfig from "pages/TestConfig";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AssignmentSuccessModal = ({
	open,
	onClose,
	numCases,
	numCircuits,
	groupNames,
}) => {
	const parts = [];
	if (numCases) parts.push(`${numCases} case${numCases > 1 ? "s" : ""}`);
	if (numCircuits)
		parts.push(`${numCircuits} circuit${numCircuits > 1 ? "s" : ""}`);
	const subject = parts.join(" and ");
	const groups = groupNames.join(", ");

	return (
		<UIModal
			open={open}
			handleClose={onClose}
			width={400}
			height="auto"
			displayCloseIcon={false}
		>
			<Box
				py={4}
				px={3}
				display="flex"
				flexDirection="column"
				alignItems="center"
				textAlign="center"
			>
				<CheckCircleIcon
					sx={{
						fontSize: 60,
						color: "success.main",
						mb: 2,
					}}
				/>
				<Typography
					variant="h5"
					component="h2"
					fontWeight={700}
					color="success.main"
					mb={1}
				>
					Successfully Assigned
				</Typography>
				<Typography variant="body1" mb={3} sx={{ color: "text.secondary" }}>
					<strong>{subject}</strong> assigned to <strong>{groups}</strong>{" "}
					successfully.
				</Typography>
				<UIButton
					variant="contained"
					text="Continue"
					size="medium"
					onClick={onClose}
					sx={{
						minWidth: 140,
						textTransform: "capitalize !important",
						fontWeight: 500,
						px: 4,
						py: 1.5,
					}}
				/>
			</Box>
		</UIModal>
	);
};

const AssignTest = ({ onClose, userGroups, refresh }) => {
	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isValid },
	} = useForm({
		mode: "onChange",
		defaultValues: {
			groups: [],
			startDate: dayjs(),
			endDate: dayjs().add(7, "day"),
		},
	});

	const [selectedCases, setSelectedCases] = useState([]);
	const [selectedCircuits, setSelectedCircuits] = useState([]);
	const [loading, setLoading] = useState(false);

	const [successOpen, setSuccessOpen] = useState(false);
	const [successData, setSuccessData] = useState({
		numCases: 0,
		numCircuits: 0,
		groupNames: [],
	});

	const userId = useSelector((state) => state?.auth?.personData?.id);

	const hasSelections = selectedCases.length > 0 || selectedCircuits.length > 0;
	const isAssignDisabled = !isValid || !hasSelections || loading;

	const groupListMap = userGroups?.reduce((acc, { id, name }) => {
		acc[name] = id;
		return acc;
	}, {});

	const groupNameOptions = userGroups?.map(({ name }) => name) || [];
	useEffect(() => {}, [watch("groups")]);

	const handleClose = () => {
		reset();
		setSelectedCases([]);
		setSelectedCircuits([]);
		onClose();
	};

	const onSubmit = async ({ groups: selectedGroups, startDate, endDate }) => {
		if (!selectedCases.length && !selectedCircuits.length) {
			return toast.warn("No cases/circuits selected – nothing to assign.");
		}

		const assignments = [];

		for (const groupName of selectedGroups) {
			for (const caseId of selectedCases) {
				assignments.push({
					group_id: groupListMap[groupName],
					case_id: caseId,
					start_time: dayjs(startDate).format("YYYY-MM-DD"),
					end_time: dayjs(endDate).format("YYYY-MM-DD"),
					is_published: true,
					assigned_by: userId,
				});
			}
			for (const circuitId of selectedCircuits) {
				assignments.push({
					group_id: groupListMap[groupName],
					circuit_id: circuitId,
					start_time: dayjs(startDate).format("YYYY-MM-DD"),
					end_time: dayjs(endDate).format("YYYY-MM-DD"),
					is_published: true,
					assigned_by: userId,
				});
			}
		}

		try {
			setLoading(true);
			await CREATE_OR_UPDATE_TEST_ASSIGNMENTS({ assignments });
			setSuccessData({
				numCases: selectedCases.length,
				numCircuits: selectedCircuits.length,
				groupNames: selectedGroups,
			});
			setSuccessOpen(true);
			refresh?.();
		} catch (err) {
			toast.error(err.message || "Assignment failed");
		} finally {
			setLoading(false);
		}
	};
	const handleSuccessClose = () => {
		setSuccessOpen(false);
		handleClose();
	};

	return (
		<>
			<Box
				sx={{ display: "flex", flexDirection: "column", height: "100vh", p: 2 }}
			>
				<Box sx={{ flexShrink: 0 }}>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						mb={1}
					>
						<Box display="flex" alignItems="center">
							<IconButton onClick={handleClose}>
								<CloseIcon sx={{ color: "rgba(88, 64, 186, 1)" }} />
							</IconButton>
							<Typography fontWeight="bold" fontSize="1.1rem">
								Assign Tests
							</Typography>
						</Box>
						<Box display="flex" gap={2}>
							<UIButton
								variant="outlined"
								text="Cancel"
								size="medium"
								onClick={handleClose}
								sx={{ minWidth: "120px" }}
							/>
							<UIButton
								variant="contained"
								text="Assign"
								size="medium"
								onClick={handleSubmit(onSubmit)}
								disabled={isAssignDisabled}
								sx={{ minWidth: "120px" }}
							/>
						</Box>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<Controller
								name="groups"
								control={control}
								rules={{
									validate: (val) =>
										val.length > 0 || "Select at least one group",
								}}
								render={({ field }) => (
									<Autocomplete
										multiple
										{...field}
										options={groupNameOptions}
										value={field.value}
										onChange={(_, newVal) => field.onChange(newVal)}
										limitTags={3}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Groups"
												required
												error={!!errors.groups}
												helperText={errors.groups?.message}
											/>
										)}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={6} md={3}>
							<Controller
								name="startDate"
								control={control}
								rules={{ required: "Start date required" }}
								render={({ field }) => (
									<UIDatePicker
										{...field}
										label="Start Date"
										isRequired
										disablePast
										minDate={dayjs().startOf("day")}
										errorMessage={errors.startDate?.message || ""}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={6} md={3}>
							<Controller
								name="endDate"
								control={control}
								rules={{
									required: "End date required",
									validate: (val) =>
										dayjs(val).isAfter(watch("startDate")) ||
										"End must be after start",
								}}
								render={({ field }) => (
									<UIDatePicker
										{...field}
										label="End Date"
										isRequired
										minDate={
											watch("startDate") ? dayjs(watch("startDate")) : undefined
										}
										errorMessage={errors.endDate?.message || ""}
									/>
								)}
							/>
						</Grid>
					</Grid>
					<Typography
						sx={{
							color: "red",
							mb: 2,
							mt: 2,
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
						variant="body2"
					>
						<WarningAmberIcon fontSize="small" />
						If any selected cases or circuits already exist in the group, their
						assignments will be updated.
					</Typography>
				</Box>
				<Box sx={{ flex: 1, overflowY: "auto", pr: 2 }}>
					<TestConfig
						isModal
						isAssign
						selectedCases={selectedCases}
						selectedCircuits={selectedCircuits}
						onCaseSelect={setSelectedCases}
						onCircuitSelect={setSelectedCircuits}
					/>
				</Box>
			</Box>

			<AssignmentSuccessModal
				open={successOpen}
				onClose={handleSuccessClose}
				numCases={successData.numCases}
				numCircuits={successData.numCircuits}
				groupNames={successData.groupNames}
			/>
		</>
	);
};

export default AssignTest;
