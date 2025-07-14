import { Button, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

const CollapsibleText = ({
	value,
	lines = 1,
	type = "",
	fontWeight,
	color = "",
	className,
	...props
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	const clippedTextStyle = {
		display: "-webkit-box",
		WebkitLineClamp: lines,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
		textOverflow: "ellipsis",
	};

	return (
		<div className={className}>
			{type === "tooltip" ? (
				<Tooltip
					title={value}
					PopperProps={{
						modifiers: [
							{
								name: "flip",
								enabled: true,
							},
							{
								name: "preventOverflow",
								enabled: true,
								options: {
									padding: 8,
								},
							},
						],
					}}
				>
					<Typography
						fontWeight={fontWeight || ""}
						color={color}
						sx={{
							wordBreak: "break-word",
							...clippedTextStyle,
							...(props?.sx || {}),
						}}
					>
						{value}
					</Typography>
				</Tooltip>
			) : (
				<>
					<Typography
						sx={{
							wordBreak: "break-word",
							...(isExpanded ? {} : clippedTextStyle),
						}}
						fontWeight={fontWeight || ""}
						color={color}
					>
						{value}
					</Typography>
					<Button
						onClick={toggleExpand}
						size="small"
						sx={{ textTransform: "none" }}
					>
						{isExpanded ? "Less^" : "More..."}
					</Button>
				</>
			)}
		</div>
	);
};

export default CollapsibleText;
