import { TextField } from "@mui/material";

const FormField = ({
	label,
	type,
	register,
	errors,
	errorKey,
	inputProps,
	...rest
}) => (
	<TextField
		label={label}
		type={type}
		fullWidth
		{...register}
		error={!!errors[errorKey]}
		size="small"
		InputLabelProps={{
			style: { color: "#fff", fontSize: "14px" },
		}}
		InputProps={{
			style: { color: "#fff", fontSize: "16px" },
			...inputProps,
		}}
		variant="outlined"
		sx={{
			backgroundColor: "rgba(255, 255, 255, 0.1)",
			"& .MuiOutlinedInput-root": {
				"& fieldset": {
					borderColor: "rgba(255, 255, 255, 0.4)",
				},
				"&:hover fieldset": {
					borderColor: "rgba(255, 255, 255, 0.6)",
				},
				"&.Mui-focused fieldset": {
					borderColor: "beige",
				},
			},
			// Autofill color styling
			"& input:-webkit-autofill": {
				WebkitBoxShadow: "0 0 0 100px rgb(138, 121, 207) inset",
				WebkitTextFillColor: "#fff",
			},
		}}
		{...rest}
	/>
);

export default FormField;
