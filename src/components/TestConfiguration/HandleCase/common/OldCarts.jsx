import { Box, Grid, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import FormFieldController from "../sections/FormFieldController";
import AccordionFormHelper from "../stations/AccordionFormHelper";

const oldCartsStructure = {
	Description: "",
	Onset: "",
	Location: "",
	Duration: "",
	Characteristics: "",
	Aggravating: "",
	Relieving: "",
	Timing: "",
	Severity: "",
};
const OldCarts = ({
	formFieldName,
	header = "History of Present Illness",
	title = "OLD & CARTS",
}) => {
	const methods = useFormContext();
	const { control } = methods;
	const {
		fields: oldCartsFields,
		append: appendOldCarts,
		remove: removeOldCarts,
	} = useFieldArray({
		control,
		name: `${formFieldName}.OLDCARTS`,
	});
	const data = useWatch({
		control,
		name: `${formFieldName}.OLDCARTS`,
	});
	const isFormEditable = useWatch({ control, name: "isCaseEditable" });
	const handleAddSymptom = () => {
		appendOldCarts(oldCartsStructure);
	};

	const handleRemoveSymptom = (index) => {
		removeOldCarts(index);
	};
	return (
		<>
			<div className="d-flex flex-column gap-3">
				<Typography fontSize="1.2rem" fontWeight="400">
					{title}
				</Typography>
				<div className="d-flex flex-column gap-3">
					{oldCartsFields?.map((oldCart, parentIndex) => (
						<AccordionFormHelper
							key={oldCart.id}
							label={`Symptom ${parentIndex + 1}`}
							summary={data?.[parentIndex]?.Symptom}
							backgroundColor="#F9F9F9"
							hasErrors={false}
							JSX={
								<div className="d-flex flex-column gap-2">
									<div className="d-flex flex-column gap-3">
										<Box className="d-flex gap-3">
											<FormFieldController
												label="Symptom"
												name={`${formFieldName}.OLDCARTS.${parentIndex}.Symptom`}
												Component={UIInputField}
											/>
											<FormFieldController
												label="Description"
												name={`${formFieldName}.OLDCARTS.${parentIndex}.Description`}
												Component={UIInputField}
											/>
										</Box>
										<Grid
											container
											spacing={1}
											className="rounded rounded-4 mt-1 secondary-bg-color p-4"
										>
											<Grid item xs={12}>
												<Typography color=" #BB31C2" fontSize="1.2rem">
													{header}
												</Typography>
												<Typography color=" #5E5E5E" fontSize="12px">
													Summarize key information and instructions
												</Typography>
											</Grid>
											{Object.entries(oldCart)
												.filter(
													([key]) =>
														key !== "Description" &&
														key !== "id" &&
														key !== "Symptom",
												)
												.map(([key, value]) => (
													<Grid item xs={12} sm={6} key={`${key}${value}`}>
														<Typography
															className="mt-2 mb-2"
															fontWeight={"bold"}
														>
															{key.charAt(0).toUpperCase() + key.slice(1)}
														</Typography>
														<FormFieldController
															label="Description"
															name={`${formFieldName}.OLDCARTS.${parentIndex}.${key}`}
															Component={UIInputField}
														/>
													</Grid>
												))}
										</Grid>
									</div>
									{oldCartsFields?.length > 1 && isFormEditable && (
										<UIButton
											variant="contained"
											text="Remove Symptom"
											onClick={() => handleRemoveSymptom(parentIndex)}
											sx={{
												whiteSpace: "nowrap",
												backgroundColor: "#ce3a1b",
												textTransform: "none",
												"&:hover": { backgroundColor: "red" },
												width: { xs: "100%", sm: "auto" },
												alignSelf: "flex-end",
											}}
										/>
									)}
								</div>
							}
						/>
					))}
					{oldCartsFields.length === 0 && handleAddSymptom()}
				</div>
				{isFormEditable && (
					<UIButton
						variant="outlined"
						text="+ Add Symptom"
						className="w-100"
						sx={{ borderRadius: "12px", textTransform: "none" }}
						onClick={() => {
							handleAddSymptom();
						}}
					/>
				)}
			</div>
		</>
	);
};

export default OldCarts;
