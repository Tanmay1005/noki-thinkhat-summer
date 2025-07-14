import { Box, Grid, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import UIButton from "components/ReusableComponents/UIButton";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIInputField from "components/ReusableComponents/UIInputField";
import UISelectField from "components/ReusableComponents/UISelectField";
import dayjs from "dayjs";
import { isEmptyRichTextEditor } from "helpers/common_helper";
import { specializations } from "helpers/constants";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { visibilityOptions } from "../manageCaseHelper";
import FormFieldController from "./FormFieldController";

const CaseDetailsAndDescription = ({
	loading,
	isCaseEditable,
	questionnaireCount,
}) => {
	const methods = useFormContext();
	const stationList = useSelector((state) => state?.stations?.data);
	const { control } = methods;
	const visibility = useWatch({ control, name: "visibility" });
	const attempts_count = useWatch({ control, name: "attempts_count" });
	const test_assignments_count = useWatch({
		control,
		name: "test_assignments_count",
	});
	const multi_station_case_attempts_count = useWatch({
		control,
		name: "multi_station_case_attempts_count ",
	});

	const options = stationList?.map(({ type, id }) => ({
		label: type,
		value: id,
	}));

	return (
		<>
			<div className="secondary-bg-color m-3 rounded rounded-4 flex-grow-1">
				<Grid container className="p-2 px-3">
					<Grid
						item
						xs={12}
						className="mb-3 mt-2 d-flex justify-content-between align-items-center"
					>
						<Typography fontSize={"1.1rem"} fontWeight={"bold"}>
							Case Details
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={4}>
								<FormFieldController
									name="firstName"
									label="First Name"
									Component={UIInputField}
									rules={{
										required: "First Name is required",
										validate: (value) =>
											value?.trim() !== "" || "First Name cannot be empty",
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<FormFieldController
									name="lastName"
									label="Last Name"
									Component={UIInputField}
									rules={{
										required: "Last Name is required",
										validate: (value) =>
											value?.trim() !== "" || "Last Name cannot be empty",
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<FormFieldController
									name="caseName"
									label="Case Name"
									Component={UIInputField}
									rules={{
										required: "Case Name is required",
										validate: (value) =>
											value?.trim() !== "" || "Case Name cannot be empty",
									}}
								/>
							</Grid>
						</Grid>
						<Grid container className="mt-2" spacing={2}>
							<Grid item xs={12} sm={4}>
								<FormFieldController
									name="gender"
									label="Gender"
									Component={UISelectField}
									rules={{
										required: "Gender is required",
									}}
									extraProps={{
										options: [
											{ label: "Male", value: "male" },
											{ label: "Female", value: "female" },
											{ label: "Other", value: "other" },
										],
										multiple: false,
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<FormFieldController
									name="dob"
									label="Date of Birth"
									Component={UIDatePicker}
									rules={{
										required: "Date of Birth is required",
										min: {
											value: dayjs().subtract(100, "year").toDate(),
											message:
												"Ensure the Date of Birth is not more than 100 years in the past",
										},
										max: {
											value: dayjs().toDate(),
											message:
												"Invalid date of birth. The date entered is in the future.",
										},
										validate: {
											validYear: (value) => {
												const minYear = dayjs().subtract(100, "year").year();
												const year = dayjs(value).year();
												return (
													year >= minYear ||
													"Ensure the Date of Birth is not more than 100 years in the past"
												);
											},
										},
									}}
									extraProps={{
										maxDate: dayjs(),
										minDate: dayjs().subtract(100, "year"),
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<FormFieldController
									name="specialization"
									label="Specialty"
									Component={UISelectField}
									rules={{
										required: "Specialty is required",
									}}
									extraProps={{
										options: specializations,
										multiple: false,
										disabled: true,
									}}
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2} className="mt-2">
							<Grid item xs={8}>
								<FormFieldController
									name="applicable_types"
									label="Applicable Station Types"
									Component={UISelectField}
									rules={{
										required: "Applicable Station Types is required",
									}}
									extraProps={{
										options: options,
										multiple: false,
										disabled: true,
									}}
								/>
							</Grid>
							<Grid item xs={4}>
								<FormFieldController
									name="visibility"
									label="Mode"
									Component={UISelectField}
									rules={{
										required: "Mode is required",
									}}
									extraProps={{
										options: visibilityOptions,
										multiple: false,
										disabled:
											(visibility === "private" &&
												(attempts_count > 0 || test_assignments_count > 0)) ||
											multi_station_case_attempts_count > 0 ||
											(visibility === "public" && questionnaireCount > 0) ||
											!isCaseEditable ||
											loading?.initialLoading ||
											loading?.proceedLoading,
									}}
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2} className="mt-2">
							<Grid item xs={12} sm={5}>
								<FormFieldController
									name="appearance"
									label="Appearance"
									Component={UISelectField}
									rules={{
										required: "Appearance is required",
									}}
									extraProps={{
										options: [
											{
												label: "Brown",
												value: "brown",
											},
											{
												label: "Black",
												value: "black",
											},
											{
												label: "White",
												value: "white",
											},
										],
										multiple: false,
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={3}>
								<Controller
									name="cdss_request"
									defaultValue={false}
									control={control}
									render={({ field: { value, onChange } }) => {
										const isDisabled =
											!isCaseEditable ||
											loading?.initialLoading ||
											loading?.proceedLoading;

										const handleToggle = () => {
											if (!isDisabled) {
												onChange(!value);
											}
										};

										return (
											<Box
												onClick={handleToggle}
												sx={{
													width: "100%",
													cursor: isDisabled ? "not-allowed" : "pointer",
												}}
											>
												<UIButton
													disabled={isDisabled}
													text="CDSS On-Request Button"
													endIcon={
														<Switch
															disabled={isDisabled}
															checked={value}
															onChange={(e) => onChange(e.target.checked)}
															onClick={(e) => e.stopPropagation()}
															color="primary"
														/>
													}
													sx={{
														width: "100%",
														backgroundColor: "#5840BA1A",
														textTransform: "capitalize !important",
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														px: 2,
													}}
												/>
											</Box>
										);
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<Controller
									name="objective_auto_check"
									defaultValue={false}
									control={control}
									render={({ field: { value, onChange } }) => {
										const isDisabled =
											!isCaseEditable ||
											loading?.initialLoading ||
											loading?.proceedLoading;

										const handleToggle = () => {
											if (!isDisabled) {
												onChange(!value);
											}
										};

										return (
											<Box
												onClick={handleToggle}
												sx={{
													width: "100%",
													cursor: isDisabled ? "not-allowed" : "pointer",
												}}
											>
												<UIButton
													disabled={isDisabled}
													text="Auto-Completion of Station Objectives Button"
													endIcon={
														<Switch
															disabled={isDisabled}
															checked={value}
															onChange={(e) => onChange(e.target.checked)}
															onClick={(e) => e.stopPropagation()}
															color="primary"
														/>
													}
													sx={{
														width: "100%",
														backgroundColor: "#5840BA1A",
														textTransform: "capitalize !important",
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														px: 2,
													}}
												/>
											</Box>
										);
									}}
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2} className="mt-2">
							<Grid item xs={12}>
								<FormFieldController
									name="additional_prompt"
									label="Additional Prompt for AI Avatar Behavior"
									Component={UIInputField}
								/>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</div>

			<div className="secondary-bg-color m-3 rounded rounded-4 flex-grow-1">
				<div className="px-3">
					<div className="mb-3 mt-2 d-flex justify-content-between align-items-center">
						<Typography fontSize={"1.1rem"} fontWeight={"bold"}>
							Case Description
						</Typography>
					</div>
					<div className="mb-2">
						<FormFieldController
							name="description"
							label="Description"
							Component={CustomRichTextEditor}
							rules={{
								required: "Description is required",
								validate: (value) =>
									!isEmptyRichTextEditor(value) ||
									"Description cannot be empty",
							}}
							extraProps={{
								required: true,
								heightClass: "small",
								readOnly:
									loading?.initialLoading ||
									loading?.proceedLoading ||
									!isCaseEditable,
							}}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default CaseDetailsAndDescription;
