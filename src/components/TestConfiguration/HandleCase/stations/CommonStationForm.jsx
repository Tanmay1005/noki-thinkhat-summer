import { Close } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import UISelectField from "components/ReusableComponents/UISelectField";
import {
	useFieldArray,
	useFormContext,
	useFormState,
	useWatch,
} from "react-hook-form";
import FormFieldController from "../sections/FormFieldController";
import AccordionFormHelper from "./AccordionFormHelper";

const scoreRangeOptions = Array.from({ length: 10 }, (_, i) => ({
	label: `${i + 1}`,
	value: i + 1,
}));

const TaskComponent = ({ selectedStation = {} }) => {
	return (
		<div>
			<FormFieldController
				name={`stations.${selectedStation?.value}.task`}
				Component={UIInputField}
				extraProps={{ rows: 4, multiline: true }}
			/>
		</div>
	);
};

const ObjectiveComponent = ({ selectedStation = {} }) => {
	const methods = useFormContext();
	const { control, getValues } = methods;
	const {
		fields: objectiveFields,
		append: appendObjective,
		remove: removeObjective,
	} = useFieldArray({
		control,
		name: `stations.${selectedStation?.value}.caseObjectives`,
	});

	const handleAddCaseObjectives = () => {
		appendObjective({ value: "" });
	};

	const handleRemoveCaseObjective = (index) => {
		removeObjective(index);
	};
	const isCaseEditable = getValues("isCaseEditable");
	return (
		<div>
			{Array.isArray(objectiveFields) &&
				objectiveFields?.map((obj, index) => (
					<div key={obj.id} className="d-flex mb-2 align-items-center">
						<div className="w-100">
							<FormFieldController
								label={`Objective ${index + 1}`}
								name={`stations.${selectedStation?.value}.caseObjectives.${index}.value`}
								Component={UIInputField}
								rules={{
									required: "Objective is required",
									validate: (value) =>
										value?.trim() !== "" || "Objective cannot be empty",
								}}
							/>
						</div>
						{isCaseEditable && (
							<div>
								<IconButton
									onClick={() => handleRemoveCaseObjective(index)}
									sx={{ ml: 1 }}
									disabled={objectiveFields.length === 1}
								>
									<Close />
								</IconButton>
							</div>
						)}
					</div>
				))}
			{objectiveFields.length === 0 && appendObjective({ value: "" })}
			{isCaseEditable && (
				<UIButton
					variant="contained"
					text="Add Objective"
					onClick={handleAddCaseObjectives}
					className="mt-2"
				/>
			)}
		</div>
	);
};

const RubricsComponent = ({ selectedStation = {} }) => {
	const { control, getValues, setValue } = useFormContext();
	const minValue = useWatch({
		name: `stations.${selectedStation?.value}.scoreRange.min`,
		defaultValue: 1,
	});
	const {
		fields: rubricsFields,
		append: appendRubrics,
		remove: removeRubrics,
	} = useFieldArray({
		control,
		name: `stations.${selectedStation?.value}.rubrics`,
	});
	const isCaseEditable = getValues("isCaseEditable");

	const handleAddRubrics = () => {
		appendRubrics({ category: "", criteria: [""] });
	};

	const handleRemoveRubrics = (index) => {
		removeRubrics(index);
	};

	const handleAddCriteria = (rubricIndex) => {
		const path = `stations.${selectedStation?.value}.rubrics`;
		const currentRubrics = [...getValues(path)];
		currentRubrics[rubricIndex].criteria.push("");
		setValue(path, currentRubrics);
	};

	const handleRemoveCriteria = (rubricIndex, criteriaIndex) => {
		const path = `stations.${selectedStation?.value}.rubrics`;
		const currentRubrics = [...getValues(path)];
		currentRubrics[rubricIndex].criteria.splice(criteriaIndex, 1);
		setValue(path, currentRubrics);
	};

	return (
		<div>
			<div className="mb-3">
				<Typography className="mt-2 mb-2" fontWeight={"bold"}>
					Score Range
				</Typography>
				<Box className="d-flex gap-2" sx={{ width: "250px" }}>
					<FormFieldController
						name={`stations.${selectedStation?.value}.scoreRange.min`}
						label="Min"
						Component={UISelectField}
						extraProps={{
							options: scoreRangeOptions,
							multiple: false,
							customStyle: {
								width: "100px",
							},
							disabled: true,
						}}
						rules={{
							min: { value: 1, message: "Min must be at least 1" },
							max: { value: 10, message: "Min must be at most 10" },
						}}
					/>
					<FormFieldController
						name={`stations.${selectedStation?.value}.scoreRange.max`}
						label="Max"
						Component={UISelectField}
						required
						extraProps={{
							options: scoreRangeOptions,
							multiple: false,
							customStyle: {
								width: "100px",
							},
						}}
						rules={{
							min: { value: 1, message: "Max must be at least 1" },
							max: { value: 10, message: "Max must be at most 10" },
							validate: (value) => {
								return value > minValue || "Max must be greater than Min";
							},
						}}
					/>
				</Box>
			</div>
			{rubricsFields.map((rubric, rubricIndex) => (
				<div key={rubric.id} className="mb-3">
					<Typography className="mt-2 mb-2" fontWeight={"bold"}>
						Category
					</Typography>
					<FormFieldController
						name={`stations.${selectedStation?.value}.rubrics.${rubricIndex}.category`}
						label="Category"
						Component={UIInputField}
						rules={{
							required: "Rubric Category is required",
							validate: (value) =>
								value?.trim() !== "" || "Rubric Category cannot be empty",
						}}
					/>

					<Typography className="mt-2 mb-2" fontWeight={"bold"}>
						Criteria
					</Typography>

					{rubric.criteria.map((_, criteriaIndex) => (
						<div
							key={`${rubric.id}-criteria-${criteriaIndex}`}
							className="d-flex mt-2 align-items-center"
						>
							<div className="flex-grow-1">
								<FormFieldController
									name={`stations.${selectedStation?.value}.rubrics.${rubricIndex}.criteria.${criteriaIndex}`}
									label={`Criteria ${criteriaIndex + 1}`}
									Component={UIInputField}
									rules={{
										required: "Criteria is required",
										validate: (value) =>
											value?.trim() !== "" || "Criteria cannot be empty",
									}}
								/>
							</div>
							{isCaseEditable && (
								<IconButton
									onClick={() =>
										handleRemoveCriteria(rubricIndex, criteriaIndex)
									}
									disabled={rubric.criteria.length === 1}
									sx={{ ml: 1 }}
								>
									<Close />
								</IconButton>
							)}
						</div>
					))}

					{isCaseEditable && (
						<div className="d-flex gap-2 mt-2">
							<UIButton
								variant="outlined"
								text="Add Criteria"
								onClick={() => handleAddCriteria(rubricIndex)}
							/>
							<UIButton
								variant="contained"
								text="Remove Rubric"
								onClick={() => handleRemoveRubrics(rubricIndex)}
								sx={{
									whiteSpace: "nowrap",
									backgroundColor: "#ce3a1b",
									textTransform: "none",
									"&:hover": { backgroundColor: "red" },
									width: { xs: "100%", sm: "auto" },
								}}
							/>
						</div>
					)}
				</div>
			))}

			{rubricsFields.length === 0 &&
				appendRubrics({ category: "", criteria: [""] })}

			{isCaseEditable && (
				<UIButton
					variant="contained"
					text="Add Rubric"
					onClick={handleAddRubrics}
					className="mt-2"
				/>
			)}
		</div>
	);
};

export const GenericExplanationForm = ({ selectedStation = {} }) => {
	return (
		<div>
			<Typography Typography className="mt-2 mb-2" fontWeight={"bold"}>
				Generic Explanation
			</Typography>
			<FormFieldController
				name={`stations.${selectedStation?.value}.expertApproach.Generic_Explanation`}
				Component={CustomRichTextEditor}
				extraProps={{ rows: 4, multiline: true }}
			/>
		</div>
	);
};

const CommonStationForm = ({ selectedStation = {} }) => {
	const { control } = useFormContext();
	const { errors } = useFormState({ control });
	const stationErrors = errors?.stations?.[selectedStation?.value] || {};
	const hasTaskError = stationErrors?.task;
	const hasObjectiveError = stationErrors?.caseObjectives?.some(
		(obj) => obj?.value,
	);

	const hasRubricError = stationErrors?.rubrics?.some(
		(rubric) => rubric?.category || rubric?.criteria?.some((crit) => crit),
	);
	return (
		<div>
			<div className="mt-3">
				<AccordionFormHelper
					hasErrors={hasTaskError}
					label="Task"
					JSX={<TaskComponent selectedStation={selectedStation} />}
				/>
			</div>
			<div className="mt-3">
				<AccordionFormHelper
					hasErrors={hasObjectiveError}
					label="Objective"
					JSX={<ObjectiveComponent selectedStation={selectedStation} />}
				/>
			</div>
			<div className="mt-3">
				<AccordionFormHelper
					hasErrors={hasRubricError}
					label="Rubrics"
					JSX={<RubricsComponent selectedStation={selectedStation} />}
				/>
			</div>
		</div>
	);
};

export default CommonStationForm;
