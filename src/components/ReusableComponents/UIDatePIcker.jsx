import { TextField, useTheme } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const UIDatePicker = ({
	label = "",
	value = null,
	onChange = () => {},
	isRequired,
	errorMessage = "",
	...props
}) => {
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
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DesktopDatePicker
				label={modifiedLabel}
				inputFormat="MM/dd/yyyy"
				onChange={(date) => {
					onChange(date ? date.format("MM/DD/YYYY") : null);
				}}
				value={value ? dayjs(value) : null}
				variant="filled"
				fullWidth2020
				minDate={props.disablePast ? dayjs().startOf("day") : undefined}
				renderInput={(params) => (
					<TextField {...params} fullWidth variant="filled" />
				)}
				slotProps={{
					textField: {
						variant: "filled",
						fullWidth: true,
						helperText: errorMessage,
						error: errorMessage,
						size: props?.size,
					},
				}}
				{...props}
				sx={{ ...requireStyle(theme), ...props?.customStyle }}
			/>
		</LocalizationProvider>
	);
};

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

export default UIDatePicker;
