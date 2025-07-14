import { Grid, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import FormFieldController from "components/TestConfiguration/HandleCase/sections/FormFieldController";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import AccordionFormHelper from "../../AccordionFormHelper";

const PlanTab = ({ fieldName }) => {
	const basePath = `${fieldName}.Plan`;
	const methods = useFormContext();
	const { control, getValues } = methods;
	const isCaseEditable = getValues("isCaseEditable");
	const {
		fields: planFields,
		append: appendPlan,
		remove: removePlan,
	} = useFieldArray({
		control,
		name: basePath,
	});
	const handleAddPlan = () => {
		appendPlan({
			Diagnostics: "",
			Problem: "",
			Therapeutics: "",
			Referrals: "",
			Follow_Up: "",
			Education: "",
		});
	};

	const handleRemovePlan = (index) => {
		removePlan(index);
	};
	const data = useWatch({
		control,
		name: basePath,
	});
	return (
		<>
			<div className="d-flex flex-column gap-3 p-3">
				<Typography fontWeight="bold" fontSize={"1rem"}>
					Plan (Per Problem)
				</Typography>
				<p>
					Outline a management plan for each listed problem. Include any of the
					following as appropriate:
				</p>
				<div className="d-flex flex-column gap-3">
					{planFields?.map((plan, parentIndex) => (
						<AccordionFormHelper
							key={plan.id}
							label={`Problem ${parentIndex + 1}`}
							summary={data?.[parentIndex]?.Problem}
							backgroundColor="#F9F9F9"
							hasErrors={false}
							JSX={
								<div className="d-flex flex-column gap-2">
									<div className="d-flex flex-column gap-3">
										<FormFieldController
											label="Problem Description"
											name={`${basePath}.${parentIndex}.Problem`}
											Component={UIInputField}
										/>
										<Grid
											container
											spacing={1}
											className="rounded rounded-4 mt-1 secondary-bg-color p-4"
										>
											{Object.entries(plan)
												.filter(
													([key]) =>
														key !== "Problem" &&
														key !== "problemDescription" &&
														key !== "id",
												)
												.map(([key, value]) => (
													<Grid item xs={12} key={`${key}${value}`}>
														<Typography
															className="mt-2 mb-2"
															fontWeight={"bold"}
														>
															{key.charAt(0).toUpperCase() +
																key.slice(1).replaceAll("_", " ")}
														</Typography>
														<FormFieldController
															label="Description"
															name={`${basePath}.${parentIndex}.${key}`}
															Component={UIInputField}
															extraProps={{ multiline: true, rows: 4 }}
														/>
													</Grid>
												))}
										</Grid>
									</div>
									{planFields?.length > 1 && isCaseEditable && (
										<UIButton
											variant="contained"
											text="Remove Plan"
											onClick={() => handleRemovePlan(parentIndex)}
											sx={{
												whiteSpace: "nowrap",
												backgroundColor: "#ce3a1b",
												textTransform: "none",
												"&:hover": { backgroundColor: "var(--color-danger)" },
												width: { xs: "100%", sm: "auto" },
												alignSelf: "flex-end",
											}}
										/>
									)}
								</div>
							}
						/>
					))}
					{planFields.length === 0 && handleAddPlan()}
				</div>
				{isCaseEditable && (
					<UIButton
						variant="outlined"
						text="+ Add Plan"
						className="w-100"
						sx={{ borderRadius: "12px", textTransform: "none" }}
						onClick={() => {
							handleAddPlan();
						}}
					/>
				)}
			</div>
		</>
	);
};

export default PlanTab;
