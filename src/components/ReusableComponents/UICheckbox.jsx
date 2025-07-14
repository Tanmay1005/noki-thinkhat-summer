import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const UICheckbox = ({
	label,
	checked,
	onChange,
	disabled = false,
	size = "large",
	sx,
	FormControlLabelStyles,
}) => {
	return (
		<FormControlLabel
			control={
				<Checkbox
					checked={checked}
					onChange={onChange}
					disabled={disabled}
					size={size}
					sx={sx}
				/>
			}
			label={label}
			sx={FormControlLabelStyles}
		/>
	);
};

export default UICheckbox;
