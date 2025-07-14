import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, Radio, TextField } from "@mui/material";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import UIButton from "components/ReusableComponents/UIButton";
import { Controller, useFieldArray } from "react-hook-form";

const OptionsForQuiz = ({
	control,
	questionIndex,
	getValues,
	tabValue,
	setValue,
	disabled,
}) => {
	const {
		fields: optionFields,
		append: appendOption,
		remove: removeOption,
	} = useFieldArray({
		control,
		name: `quiz.${tabValue}.${questionIndex}.options`,
	});

	const selectedValue = getValues(
		`quiz.${tabValue}.${questionIndex}.correctAnswer`,
	);

	return (
		<div className="mb-4">
			{optionFields.map((option, oIndex) => (
				<div
					key={`options-for-quiz-id-${option.id}-${oIndex}`} // Must be unique as we are using index and option id
					className="d-flex gap-2 align-items-center mb-3"
				>
					<Controller
						name={`quiz.${tabValue}.${questionIndex}.correctAnswer`}
						control={control}
						render={({ field }) => (
							<Radio
								className="m-0 p-0 mt-4"
								checked={field.value === oIndex}
								onChange={() => field.onChange(oIndex)}
								value={oIndex}
							/>
						)}
					/>

					<div className="flex-grow-1">
						<Controller
							name={`quiz.${tabValue}.${questionIndex}.options.${oIndex}.optionText`}
							control={control}
							rules={{
								required: "Option cannot be empty",
								validate: (value) =>
									value.trim() !== "" || "Option cannot be empty",
								maxLength: {
									value: 200,
									message: `Option ${oIndex + 1} cannot exceed 200 characters`,
								},
							}}
							render={({ field, fieldState: { error } }) => (
								<TextField
									variant="standard"
									fullWidth
									{...field}
									label={
										<CustomFormLabel
											name={`Enter option ${oIndex + 1} for question`}
											required={true}
										/>
									}
									helperText={error ? error.message : ""}
									multiline
									error={!!error}
								/>
							)}
						/>
					</div>

					{optionFields.length > 2 && (
						<IconButton
							className="m-0 p-0"
							onClick={() => {
								removeOption(oIndex);
								if (oIndex === selectedValue) {
									setValue(
										`quiz.${tabValue}.${questionIndex}.correctAnswer`,
										0,
									);
								}
							}}
							disabled={optionFields.length <= 2 || disabled}
						>
							<ClearIcon />
						</IconButton>
					)}
				</div>
			))}
			{selectedValue !== "" && (
				<Controller
					name={`quiz.${tabValue}.${questionIndex}.shortDescription`}
					control={control}
					rules={{
						required: "Short Description cannot be empty",
						maxLength: {
							value: 300,
							message: "Short Description cannot exceed 300 characters",
						},
						validate: (value) =>
							value.trim() !== "" || "Short Description cannot be empty",
					}}
					render={({ field, fieldState: { error } }) => (
						<TextField
							size="small"
							fullWidth
							{...field}
							label={
								<CustomFormLabel
									name={"Enter Short Description for answer"}
									required={true}
								/>
							}
							helperText={error ? error.message : ""}
							multiline
							error={!!error}
						/>
					)}
				/>
			)}
			{optionFields.length < 4 && (
				<div className="my-3">
					<UIButton
						onClick={() => appendOption({ optionText: "" })}
						disabled={optionFields.length >= 4 || disabled}
						variant="outlined"
						text="Add Option"
					/>
				</div>
			)}
		</div>
	);
};

export default OptionsForQuiz;
