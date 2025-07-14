import DeleteIcon from "@mui/icons-material/Delete";
import { Grid, IconButton, Typography } from "@mui/material";
import { ReactComponent as EnvironmentalAllergyIcon } from "assets/environment.svg";
import { ReactComponent as FoodAllergyIcon } from "assets/food.svg";
import { ReactComponent as DrugAllergyIcon } from "assets/tablet.svg";
import { ReactComponent as OtherAllergyIcon } from "assets/virus.svg";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import FormFieldController from "../../sections/FormFieldController";
const iconStyle = { width: "1.25rem", height: "auto" };
const Icons = {
	Drug_Allergies: <DrugAllergyIcon style={iconStyle} />,
	Environmental_Allergies: <EnvironmentalAllergyIcon style={iconStyle} />,
	Food_Allergies: <FoodAllergyIcon style={iconStyle} />,
	Other_Allergies: <OtherAllergyIcon style={iconStyle} />,
};
const Allergy = ({ name = "", allergyType }) => {
	const { control } = useFormContext();
	const isFormEditable = useWatch({ control, name: "isCaseEditable" });
	const {
		fields: allergyFields,
		append: appendAllergy,
		remove: removeAllergy,
	} = useFieldArray({
		control,
		name: `${name}.Allergies.${allergyType.type}`,
	});
	const handleAddAllergy = () => {
		appendAllergy({
			name: "",
		});
	};
	const handleRemoveAllergy = (index) => {
		removeAllergy(index);
	};
	return (
		<div className="d-flex flex-column gap-2">
			<Grid container spacing={2}>
				<Grid item xs={12} spacing={1}>
					<Typography className="mt-2 mb-3" fontWeight={"bold"}>
						{Icons[allergyType.type]}&nbsp; {`${allergyType.label} Allergies`}
					</Typography>
					<div className="d-flex flex-column gap-2">
						{allergyFields?.map((surgery, index) => (
							<Grid
								key={surgery.id}
								container
								alignItems={"center"}
								className="rounded rounded-4 secondary-bg-color"
								spacing={2}
							>
								<Grid item xs={12} sm={6}>
									<FormFieldController
										label={`${allergyType.label} Allergen`}
										name={`${name}.Allergies.${allergyType.type}.${index}.Substance`}
										Component={UIInputField}
									/>
								</Grid>
								<Grid item xs={12} sm={5.5}>
									<FormFieldController
										label="Allergic Reaction"
										name={`${name}.Allergies.${allergyType.type}.${index}.Reaction`}
										Component={UIInputField}
									/>
								</Grid>
								{allergyFields?.length > 1 && (
									<Grid item xs={12} sm={0.5}>
										<IconButton
											onClick={() => handleRemoveAllergy(index)}
											sx={{ color: "#FF0000" }}
										>
											<DeleteIcon />
										</IconButton>
									</Grid>
								)}
							</Grid>
						))}
					</div>
					{allergyFields.length === 0 && handleAddAllergy()}
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
								handleAddAllergy();
							}}
						/>
					)}
				</Grid>
			</Grid>
		</div>
	);
};

const Allergies = ({ name = "" }) => {
	const allergiesType = [
		{ type: "Drug_Allergies", label: "Drug" },
		{ type: "Environmental_Allergies", label: "Environmental" },
		{ type: "Food_Allergies", label: "Food" },
		{ type: "Other_Allergies", label: "Other" },
	];
	return (
		<div className="d-flex flex-column gap-2">
			<Typography fontSize="1.25rem" fontWeight="400" color="#5840BA">
				Allergies
			</Typography>
			{allergiesType?.map((allergy) => (
				<Allergy key={allergy.type} name={name} allergyType={allergy} />
			))}
		</div>
	);
};
export default Allergies;
