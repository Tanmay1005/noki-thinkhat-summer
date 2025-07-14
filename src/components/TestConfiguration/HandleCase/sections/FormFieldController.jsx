import { useController, useFormContext, useWatch } from "react-hook-form";

const FormFieldController = ({
	name,
	label,
	Component,
	rules = {},
	disabled = false,
	extraProps = {},
}) => {
	const { control } = useFormContext();
	const isLoading = useWatch({ control, name: "loading" });
	const isCaseEditable = useWatch({ control, name: "isCaseEditable" });
	const caseId = useWatch({ control, name: "id" });
	const {
		field,
		fieldState: { error },
	} = useController({ name, control, rules });

	const errorMessage = error?.message;

	return (
		<Component
			{...field}
			disabled={disabled || isLoading || (!isCaseEditable && caseId)}
			size="small"
			isRequired={rules.required}
			label={label}
			error={!!errorMessage}
			helperText={errorMessage || ""}
			errorMessage={errorMessage || ""}
			{...extraProps}
		/>
	);
};

export default FormFieldController;
