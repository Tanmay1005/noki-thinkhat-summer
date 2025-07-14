import { Box, CircularProgress, Typography } from "@mui/material";

function CustomCircularProgress({
	value,
	size = 28,
	thickness = 8,
	innerText = "",
	shadeCircleColor = "#e0e0e0",
	valueCircleColor = "rgba(103, 186, 64, 1)",
	textColor = "textSecondary", // Can be "primary", "secondary", "textPrimary", etc.
	fontSize = "",
	textWeight = "",
	loading = false,
}) {
	return (
		<Box
			position="relative"
			display="inline-flex"
			alignItems="center"
			justifyContent="center"
		>
			<CircularProgress
				variant="determinate"
				value={100}
				sx={{ color: shadeCircleColor }}
				size={size}
				thickness={thickness}
			/>
			<CircularProgress
				variant="determinate"
				value={value}
				size={size}
				sx={{
					position: "absolute",
					left: 0,
					color: valueCircleColor,
				}}
				thickness={thickness}
			/>
			{innerText && !loading && (
				<Typography
					variant="caption"
					component="div"
					fontWeight={textWeight}
					color={textColor}
					sx={{
						position: "absolute",
						fontSize: fontSize ? fontSize : size * 0.4,
					}}
				>
					{innerText}
				</Typography>
			)}
		</Box>
	);
}

export default CustomCircularProgress;
