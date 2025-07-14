import { Grid, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import FormFieldController from "../../sections/FormFieldController";

const FamilyHistory = ({ name = "" }) => {
	const { control } = useFormContext();
	const isFormEditable = useWatch({ control, name: "isCaseEditable" });

	const {
		fields: familyHistoryFields,
		append: appendFamilyHistoryFields,
		remove: removeFamilyHistoryFields,
	} = useFieldArray({
		control,
		name: `${name}.Family_History`,
	});
	const handleAddFamilyHistory = () => {
		appendFamilyHistoryFields({
			Relation: "",
			// Full_Name: "",
			Generic_Conditions: "",
		});
	};
	const handleRemoveFamilyHistory = (index) => {
		removeFamilyHistoryFields(index);
	};
	return (
		<div className="d-flex flex-column gap-2">
			<Typography fontSize="1.25rem" fontWeight="400" color="#5840BA">
				Family History
			</Typography>
			<Typography className="mb-3" color=" #5E5E5E" fontSize="12px">
				First degree Relatives
			</Typography>
			{familyHistoryFields?.map((surgery, index) => (
				<Grid
					key={surgery.id}
					container
					alignItems={"center"}
					className="rounded rounded-4 card-bg-secondary mb-4"
					spacing={2}
					sx={{ padding: "0 16px 16px 0" }}
				>
					<Grid item xs={12}>
						<FormFieldController
							label="Relation"
							name={`${name}.Family_History.${index}.Relation`}
							Component={UIInputField}
						/>
					</Grid>
					{/* <Grid item xs={12} sm={6}>
						<FormFieldController
							label="Full Name"
							name={`${name}.Family_History.${index}.Full_Name`}
							Component={UIInputField}
						/>
					</Grid> */}
					<Grid item xs={12}>
						<FormFieldController
							label="Genetic Condition"
							name={`${name}.Family_History.${index}.Genetic_Conditions`}
							Component={UIInputField}
							extraProps={{ rows: 4, multiline: true }}
						/>
					</Grid>
					{familyHistoryFields?.length > 1 && (
						<Grid item xs={12} sm={12}>
							<div className="d-flex w-100 justify-content-end">
								<UIButton
									variant="contained"
									text="Delete"
									sx={{
										whiteSpace: "nowrap",
										backgroundColor: "#ce3a1b",
										textTransform: "none",
										"&:hover": { backgroundColor: "red" },
										width: { xs: "100%", sm: "auto" },
									}}
									onClick={() => {
										handleRemoveFamilyHistory(index);
									}}
								/>
							</div>
						</Grid>
					)}
				</Grid>
			))}
			{familyHistoryFields.length === 0 && handleAddFamilyHistory()}
			{isFormEditable && (
				<UIButton
					variant="outlined"
					text="+ Add"
					sx={{
						borderRadius: "12px",
						textTransform: "none",
						width: "fit-content",
					}}
					onClick={() => {
						handleAddFamilyHistory();
					}}
				/>
			)}
		</div>
	);
};

export default FamilyHistory;
