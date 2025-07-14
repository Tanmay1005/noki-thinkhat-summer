import { TextField, useTheme } from "@mui/material";
import { forwardRef } from "react";

const UIInputField = forwardRef(
	({ label = "", isRequired, value = "", ...props }, ref) => {
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
			<TextField
				variant="filled"
				value={value}
				{...props}
				sx={{ ...requireStyle(theme), ...props?.customStyle }}
				label={modifiedLabel}
				fullWidth
				ref={ref}
				disabled={props?.disabled}
			/>
		);
	},
);

const requireStyle = (theme) => ({
	".MuiFilledInput-root": {
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
		},
		"&.Mui-error": {
			borderColor: theme.palette.error.main,
		},
	},
	".MuiFilledInput-input": {
		color: theme.palette.text.primary,
	},
	".MuiFilledInput-root:before, .MuiFilledInput-root:after": {
		borderBottom: "none !important",
	},
	".MuiInputLabel-root": {
		color:
			theme.palette.mode === "dark"
				? "rgba(255, 255, 255, 0.7)"
				: "rgba(0, 0, 0, 0.6)",
		"&.Mui-focused": {
			color: theme.palette.primary.main,
		},
		"&.Mui-error": {
			color: theme.palette.error.main,
		},
	},
	".MuiInputLabel-asterisk": { color: theme.palette.error.main },
});

export default UIInputField;
