import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	Radio,
	RadioGroup,
	Typography,
} from "@mui/material";

const UIRadioGroup = ({
	name,
	value,
	label,
	onChange,
	options,
	row = true,
	disabled = false,
	radioColor = "rgba(88, 64, 186, 1)",
	className = "",
	error = false,
	helperText = "",
}) => {
	return (
		<FormControl error={error}>
			<div className={"d-flex flex-row align-items-center gap-4"}>
				{label && (
					<Typography id={label} fontWeight={"bold"} width="80px">
						{label}
					</Typography>
				)}
				<RadioGroup
					row={row}
					name={name}
					aria-labelledby={label}
					value={value}
					onChange={onChange}
					className={className}
				>
					{options.map((option) => (
						<FormControlLabel
							key={option.value}
							value={option.value}
							control={
								<Radio
									sx={{
										"&.Mui-checked": { color: radioColor },
									}}
								/>
							}
							label={option.label}
							disabled={disabled}
						/>
					))}
				</RadioGroup>
			</div>

			{helperText && <FormHelperText>{helperText}</FormHelperText>}
		</FormControl>
	);
};

export default UIRadioGroup;
