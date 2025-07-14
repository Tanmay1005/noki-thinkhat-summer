import {
	Checkbox,
	FormControl,
	FormHelperText,
	InputLabel,
	ListItemText,
	MenuItem,
	Select,
	useTheme,
} from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const UISelectField = ({
	label = "",
	options = [],
	multiple = true,
	value = multiple ? [] : "",
	customStyle = {},
	isRequired,
	errorMessage = "",
	size = "medium",
	...props
}) => {
	const [selectedAll, setSelectedAll] = useState(
		value?.length === options?.length,
	);

	const valueArray = Array.isArray(value) ? value : [value];

	useEffect(() => {
		setSelectedAll(valueArray.length === options.length);
	}, [options, valueArray.length]);

	const handleChange = (event) => {
		event.preventDefault();
		const newValue = event.target.value;

		if (selectedAll && newValue.includes("Select All")) {
			setSelectedAll(false);
			props.onChange([]);
			return;
		}

		if (newValue.length === options.length || newValue.includes("Select All")) {
			setSelectedAll(true);
			props.onChange(options.map((option) => option.value)); // Select all
			return;
		}

		setSelectedAll(false);
		props.onChange(newValue);
	};
	const theme = useTheme();
	const modifiedLabel = isRequired ? (
		<>
			{label}
			<span style={{ color: theme.palette.error.main }}> *</span>
		</>
	) : (
		label
	);

	return (
		<FormControl
			fullWidth
			required={props?.required}
			margin="normal"
			variant="filled"
			className="m-0"
			size={size}
		>
			<InputLabel
				id={`${label}-label`}
				sx={{
					color:
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.7)"
							: "rgba(0, 0, 0, 0.6)",
					".MuiFormLabel-asterisk": { color: "red" },
				}}
				error={!!errorMessage}
			>
				{modifiedLabel}
			</InputLabel>
			<Select
				labelId={`${label}-label`}
				multiple={multiple}
				value={valueArray} // Use valueArray here
				variant="filled"
				error={!!errorMessage}
				{...props}
				{...(multiple && { onChange: handleChange })}
				sx={{
					"& .MuiFormLabel-asterisk": {
						color: "red",
					},
					"&.MuiInputBase-root": {
						textTransform: "capitalize",
					},
					"&.Mui-disabled": {
						pointerEvents: "none",
						"& fieldset": {
							borderColor: "transparent",
						},
						"&:before, &:after": {
							borderBottom: "none",
						},
					},
					...requireStyle(theme),
					...customStyle,
				}}
				renderValue={() => {
					const selectedLabels = valueArray
						.map(
							(val) =>
								options.find((option) => option.value === val)?.label || val,
						)
						.join(", ");

					return (
						<div className="d-flex gap-1" title={selectedLabels}>
							{selectedLabels}
						</div>
					);
				}}
				MenuProps={{
					PaperProps: {
						style: {
							maxHeight: 224,
							width: 250,
							backgroundColor: theme.palette.background.paper,
							borderRadius: "4px",
						},
					},
				}}
			>
				{multiple && (
					<MenuItem key="ui-select-field-value-select-all" value="Select All">
						<Checkbox checked={selectedAll} />
						<ListItemText primary="Select All" />
					</MenuItem>
				)}
				{options.map((option) => (
					<MenuItem
						key={`ui-select-field-value-${option.value}`}
						value={option.value}
					>
						{multiple && (
							<Checkbox checked={valueArray.indexOf(option.value) > -1} />
						)}
						<ListItemText primary={option.label} />
					</MenuItem>
				))}
			</Select>
			<FormHelperText error={!!errorMessage}>{errorMessage}</FormHelperText>
		</FormControl>
	);
};

const requireStyle = (theme) => ({
	background: "transparent",
	border: "1px solid",
	borderColor:
		theme.palette.mode === "dark"
			? "rgba(255, 255, 255, 0.23)"
			: "rgba(0, 0, 0, 0.23)",
	borderRadius: "4px",
	"&:hover": {
		borderColor:
			theme.palette.mode === "dark"
				? "rgba(255, 255, 255, 0.87)"
				: "rgba(0, 0, 0, 0.87)",
		backgroundColor: "transparent",
	},
	"&.Mui-focused": {
		borderColor: theme.palette.primary.main,
		backgroundColor: "transparent !important",
	},
	"&.Mui-error": {
		borderColor: theme.palette.error.main,
	},
});

UISelectField.propTypes = {
	label: PropTypes.string,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		}),
	),
	multiple: PropTypes.bool,
	value: PropTypes.array, // Ensure value is an array for multiple selects
	customStyle: PropTypes.object,
};

export default UISelectField;
