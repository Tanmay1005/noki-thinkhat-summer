import DeleteIcon from "@mui/icons-material/Delete";
import { Grid, IconButton, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIDatePicker from "components/ReusableComponents/UIDatePIcker";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import FormFieldController from "../../sections/FormFieldController";

const SurgicalHistory = ({ name = "" }) => {
	const { control } = useFormContext();
	const isFormEditable = useWatch({ control, name: "isCaseEditable" });

	const {
		fields: surgeryFields,
		append: appendSurgeries,
		remove: removeSurgeries,
	} = useFieldArray({
		control,
		name: `${name}.Surgical_History.Surgeries`,
	});
	const handleAddSurgery = () => {
		appendSurgeries({
			Surgery_Type: "",
			Date: "",
		});
	};
	const handleRemoveSurgery = (index) => {
		removeSurgeries(index);
	};
	const {
		fields: hospitalAdmissionFields,
		append: appendHospitalAdmissions,
		remove: removeHospitalAdmissions,
	} = useFieldArray({
		control,
		name: `${name}.Hospital_Admissions`,
	});
	const handleAddHospitalAdmissions = () => {
		appendHospitalAdmissions({
			Reason: "",
		});
	};
	const handleRemoveHospitalAdmissions = (index) => {
		removeHospitalAdmissions(index);
	};
	return (
		<div className="d-flex flex-column gap-2">
			<Typography fontSize="1.25rem" fontWeight="400" color="#5840BA">
				Surgical History
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} spacing={1}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Surgeries
					</Typography>
					<Typography className="mb-4" color=" #5E5E5E" fontSize="12px">
						List Your Surgeries
					</Typography>
					<div className="d-flex flex-column gap-2">
						{surgeryFields?.map((surgery, index) => (
							<Grid
								key={surgery.id}
								container
								alignItems={"center"}
								className="rounded rounded-4 secondary-bg-color"
								spacing={2}
							>
								<Grid item xs={12} sm={6}>
									<FormFieldController
										label="Surgery Name"
										name={`${name}.Surgical_History.Surgeries.${index}.Surgery_Type`}
										Component={UIInputField}
									/>
								</Grid>
								<Grid item xs={12} sm={5.5}>
									<FormFieldController
										label="Date if Known"
										name={`${name}.Surgical_History.Surgeries.${index}.Date`}
										Component={UIDatePicker}
									/>
								</Grid>
								{surgeryFields?.length > 1 && (
									<Grid item xs={12} sm={0.5}>
										<IconButton
											onClick={() => handleRemoveSurgery(index)}
											sx={{ color: "#FF0000" }}
										>
											<DeleteIcon />
										</IconButton>
									</Grid>
								)}
							</Grid>
						))}
					</div>
					{surgeryFields.length === 0 && handleAddSurgery()}
					{isFormEditable && (
						<UIButton
							variant="outlined"
							text="+ Add"
							className="mt-2"
							sx={{
								borderRadius: "12px",
								textTransform: "none",
								width: "fit-content",
							}}
							onClick={() => {
								handleAddSurgery();
							}}
						/>
					)}
				</Grid>
				<Grid item xs={12}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Hospital Admission
					</Typography>
					<Typography className="mb-4" color=" #5E5E5E" fontSize="12px">
						List any times you were admitted to the hospital.
					</Typography>
					<div className="d-flex flex-column gap-2">
						{hospitalAdmissionFields?.map((hospitalAdmission, index) => (
							<Grid
								key={hospitalAdmission.id}
								container
								alignItems={"center"}
								className="rounded rounded-4 secondary-bg-color"
								spacing={2}
							>
								<Grid item xs={11.5}>
									<FormFieldController
										label="Description"
										name={`${name}.Surgical_History.Hospital_Admissions.${index}.Reason`}
										Component={UIInputField}
										extraProps={{ rows: 4, multiline: true }}
									/>
								</Grid>
								{hospitalAdmissionFields?.length > 1 && (
									<Grid item xs={12} sm={0.5}>
										<IconButton
											onClick={() => handleRemoveHospitalAdmissions(index)}
											sx={{ color: "#FF0000" }}
										>
											<DeleteIcon />
										</IconButton>
									</Grid>
								)}
							</Grid>
						))}
					</div>
					{hospitalAdmissionFields.length === 0 &&
						handleAddHospitalAdmissions()}
					{isFormEditable && (
						<UIButton
							variant="outlined"
							text="+ Add"
							className="mt-2"
							sx={{
								borderRadius: "12px",
								textTransform: "none",
								width: "fit-content",
							}}
							onClick={() => {
								handleAddHospitalAdmissions();
							}}
						/>
					)}
				</Grid>
			</Grid>
		</div>
	);
};

export default SurgicalHistory;
