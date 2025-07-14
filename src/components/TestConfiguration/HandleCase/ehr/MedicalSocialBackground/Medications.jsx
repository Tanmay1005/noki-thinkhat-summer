import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Grid, IconButton, Typography } from "@mui/material";
import DataTable from "components/DashboardWidgets/gridRenderer";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

const Medications = ({ name }) => {
	const fieldArrayName = `${name}.Medications`;
	const [medicationInput, setMedicationInput] = useState({
		Name: "",
		Dosage: "",
		Frequency: "",
		Purpose: "",
	});
	const [editIndex, setEditIndex] = useState(null);
	const [editMedicationData, setEditMedicationData] = useState(null);
	const { control } = useFormContext();

	const {
		// fields: medicationsFields,
		append: appendMedications,
		remove: removeMedications,
		update: updateMedications,
	} = useFieldArray({
		control,
		name: fieldArrayName,
	});

	const watchedMedications = useWatch({
		control,
		name: fieldArrayName,
	});
	const isFormEditable = useWatch({ control, name: "isCaseEditable" });

	const handleChange = (e) => {
		setMedicationInput({ ...medicationInput, [e.target.name]: e.target.value });
	};
	const validate = (data) => {
		return (
			!data.Name?.trim() &&
			!data.Dosage?.trim() &&
			!data.Frequency?.trim() &&
			!data.Purpose?.trim()
		);
	};
	const handleAddMedications = () => {
		if (validate(medicationInput)) {
			return;
		}
		appendMedications(medicationInput);
		setMedicationInput({ Name: "", Dosage: "", Frequency: "", Purpose: "" });
	};
	const handleRemoveMedications = (index) => {
		removeMedications(index - 1);
	};
	const handleEditMedications = (index) => {
		setEditMedicationData(watchedMedications?.[index - 1]);
		setEditIndex(index);
	};
	const handleEditChange = (e) => {
		setEditMedicationData({
			...editMedicationData,
			[e.target.name]: e.target.value,
		});
	};
	const handleSaveEdit = () => {
		if (validate(editMedicationData)) {
			return;
		}
		updateMedications(editIndex - 1, editMedicationData);
		setEditIndex(null);
		setEditMedicationData(null);
	};
	const handleCancelEdit = () => {
		setEditIndex(null);
		setEditMedicationData(null);
	};
	const columns = [
		{
			field: "id",
			headerName: "S.No",
			flex: 0.5,
			sortable: false,
			disableColumnMenu: true,
		},
		{
			field: "Name",
			headerName: "Medication Name",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) =>
				params.row.id === editIndex ? (
					<UIInputField
						name="Name"
						value={editMedicationData.Name}
						onChange={handleEditChange}
						size="small"
						customStyle={{
							".MuiFilledInput-input": {
								padding: "4px",
							},
						}}
					/>
				) : (
					params.value
				),
		},
		{
			field: "Dosage",
			headerName: "Dosage",
			flex: 0.5,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) =>
				params.row.id === editIndex ? (
					<UIInputField
						name="Dosage"
						value={editMedicationData.Dosage}
						onChange={handleEditChange}
						size="small"
						customStyle={{
							".MuiFilledInput-input": {
								padding: "4px",
							},
						}}
					/>
				) : (
					params.value
				),
		},
		{
			field: "Frequency",
			headerName: "Frequency",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) =>
				params.row.id === editIndex ? (
					<UIInputField
						name="Frequency"
						value={editMedicationData.Frequency}
						onChange={handleEditChange}
						size="small"
						customStyle={{
							".MuiFilledInput-input": {
								padding: "4px",
							},
						}}
					/>
				) : (
					params.value
				),
		},
		{
			field: "Purpose",
			headerName: "Purpose",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) => {
				return params.row.id === editIndex ? (
					<UIInputField
						name="Purpose"
						value={editMedicationData.Purpose}
						onChange={handleEditChange}
						size="small"
						customStyle={{
							".MuiFilledInput-input": {
								padding: "4px",
							},
						}}
					/>
				) : (
					params.value
				);
			},
		},
		{
			headerName: "Actions",
			flex: 1,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) =>
				params.row.id === editIndex ? (
					<>
						<IconButton
							disabled={!isFormEditable}
							onClick={handleSaveEdit}
							sx={{ color: "#5D5FEF" }}
						>
							<SaveIcon />
						</IconButton>
						<IconButton
							disabled={!isFormEditable}
							onClick={handleCancelEdit}
							sx={{ color: "red" }}
						>
							<ClearIcon />
						</IconButton>
					</>
				) : (
					<>
						<IconButton
							disabled={!isFormEditable}
							onClick={() => handleEditMedications(params.row.id)}
							sx={{ color: "#5D5FEF" }}
						>
							<EditIcon />
						</IconButton>
						<IconButton
							disabled={!isFormEditable}
							onClick={() => handleRemoveMedications(params.row.id)}
							sx={{ color: "red" }}
						>
							<DeleteIcon color="red" />
						</IconButton>
					</>
				),
		},
	];
	const tableRows = watchedMedications?.map((med, idx) => ({
		id: idx + 1,
		Name: med.Name,
		Dosage: med.Dosage,
		Frequency: med.Frequency,
		Purpose: med.Purpose,
	}));
	return (
		<div className="d-flex flex-column gap-2">
			<Grid container spacing={2}>
				<Grid item xs={12} spacing={1}>
					<Typography className="mt-2" fontWeight={"bold"}>
						Medications
					</Typography>
					<div className="d-flex gap-3 flex-column">
						<DataTable
							rows={tableRows}
							columns={columns}
							pageSizeOptions={5}
							height="auto"
							sx={{
								borderRadius: "12px",
								overflow: "hidden",
								"& .MuiDataGrid-cell:focus": {
									outline: "none",
								},
								"& .MuiDataGrid-cell:focus-within": {
									outline: "none",
								},
								"& .MuiDataGrid-container--top [role=row]": {
									background:
										"linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)",
									color: "white",
									"& .MuiDataGrid-root": {
										overflowX: "auto",
									},
								},
							}}
						/>
						{isFormEditable && (
							<div className="d-flex flex-column gap-2">
								<Grid
									container
									alignItems={"center"}
									className="rounded rounded-4 secondary-bg-color"
									spacing={2}
								>
									<Grid item xs={12} sm={3}>
										<UIInputField
											size="small"
											label="Medication Name"
											name="Name"
											value={medicationInput.Name}
											onChange={handleChange}
										/>
									</Grid>
									<Grid item xs={12} sm={1}>
										<UIInputField
											size="small"
											label="Dosage"
											name="Dosage"
											value={medicationInput.Dosage}
											onChange={handleChange}
										/>
									</Grid>
									<Grid item xs={12} sm={3.5}>
										<UIInputField
											size="small"
											label="Frequency"
											name="Frequency"
											value={medicationInput.Frequency}
											onChange={handleChange}
										/>
									</Grid>
									<Grid item xs={12} sm={3.5}>
										<UIInputField
											size="small"
											label="Display Name"
											name="Purpose"
											value={medicationInput.Purpose}
											onChange={handleChange}
										/>
									</Grid>
									<Grid
										item
										xs={12}
										sm={1}
										sx={{
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
										}}
									>
										<UIButton
											variant="contained"
											text="Add"
											sx={{
												borderRadius: "12px",
												textTransform: "none",
												width: "fit-content",
											}}
											onClick={handleAddMedications}
										/>
									</Grid>
								</Grid>
							</div>
						)}
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default Medications;
