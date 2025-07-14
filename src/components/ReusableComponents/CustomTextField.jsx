import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { IconButton, InputAdornment, MenuItem, TextField } from "@mui/material";
import { useRef } from "react";

const CustomTextField = ({
	label,
	options,
	value,
	onChange,
	width = "120px",
	size = "small",
	IconComponent = KeyboardArrowDownIcon,
	isNone = true,
}) => {
	const textFieldRef = useRef(null);

	const handleClear = () => {
		onChange({ target: { value: "" } });
	};

	const handleIconClick = () => {
		if (textFieldRef.current) {
			textFieldRef.current.focus();
		}
	};

	return (
		<TextField
			ref={textFieldRef}
			label={label}
			variant="outlined"
			fullWidth
			select
			title={value}
			size={size}
			value={value}
			onChange={onChange}
			InputProps={{
				endAdornment: value ? (
					<InputAdornment position="end">
						<IconButton
							onClick={handleClear}
							style={{ fontSize: "10px", marginRight: "8px" }}
						>
							<ClearIcon />
						</IconButton>
					</InputAdornment>
				) : null,
			}}
			SelectProps={{
				IconComponent: (props) => (
					<IconButton
						{...props}
						onClick={handleIconClick}
						style={{ color: "#5840BA", bottom: "8px" }}
					>
						<IconComponent />
					</IconButton>
				),
			}}
			sx={{
				minWidth: "170px",
				width: width,
				paddingRight: "0px",
				"& .MuiOutlinedInput-root": {
					"& fieldset": {
						borderColor: "#5840BA",
					},
					"&:hover fieldset": {
						borderColor: "#5840BA",
					},
					"&.Mui-focused fieldset": {
						borderColor: "#5840BA",
					},
				},
				"& .MuiInputLabel-root": {
					color: "#5840BA",
				},
				"& .MuiInputBase-input": {
					color: "#5840BA",
				},
			}}
		>
			{isNone && (
				<MenuItem value="">
					<em>None</em>
				</MenuItem>
			)}
			{options?.map((item, idx) => (
				<MenuItem
					key={`custom-text-field-${idx + 1}`} // Key should be unique as we are using index
					value={item.value}
				>
					{" "}
					{item.label}
				</MenuItem>
			))}
		</TextField>
	);
};

export default CustomTextField;
