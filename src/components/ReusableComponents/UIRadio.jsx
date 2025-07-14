import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

const UIRadio = ({
	label,
	checked,
	onChange,
	disabled = false,
	size = "large",
	sx,
}) => {
	return (
		<FormControlLabel
			control={
				<Radio
					checked={checked}
					onChange={onChange}
					disabled={disabled}
					size={size}
					sx={sx}
				/>
			}
			label={label}
		/>
	);
};

export default UIRadio;
