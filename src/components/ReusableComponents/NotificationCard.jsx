import { Check, Group, Info, Person } from "@mui/icons-material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo } from "react";
import { getRelativeTime } from "../../helpers/dateFormatter";

// Colors based on notification type (similar to react-toastify)
const typeColors = {
	info: "#3498db",
	success: "#07bc0c",
	warning: "#f1c40f",
	error: "#e74c3c",
	default: "#5840BA",
};

const NotificationCard = ({ notification, onMarkAsRead }) => {
	const { type = "default", message, createdAt, read, target } = notification;

	const iconColor = useMemo(
		() => typeColors[type.toLowerCase()] || typeColors.default,
		[type],
	);
	const backgroundColor = useMemo(() => (read ? "#f4f4f4" : "#ffffff"), [read]);
	const textColor = useMemo(() => (read ? "#aaa" : "inherit"), [read]);

	const LeftIcon = useMemo(() => {
		if (target === "group") return <Group sx={{ color: "#ffffff" }} />;
		if (target === "direct") return <Person sx={{ color: "#ffffff" }} />;
		return <Info sx={{ color: "#ffffff" }} />;
	}, [target]);

	const handleMarkAsRead = useCallback(() => {
		onMarkAsRead(notification);
	}, [onMarkAsRead, notification]);

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				padding: "0.75em",
				backgroundColor,
				borderRadius: "0.5em",
				gap: "1em",
				"&:hover": {
					backgroundColor: read ? "#ededed" : "#f8f9fa",
				},
				margin: "0.5em 0",
				boxShadow: "0 0.063em 0.188em rgba(0,0,0,0.1)",
				border: `0.063em ${read ? "dotted" : "solid"} ${iconColor}40`,
				position: "relative",
				"&::before": {
					content: '""',
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					width: "0.188em",
					backgroundColor: iconColor,
					borderRadius: "0.5em 0 0 0.5em",
				},
			}}
		>
			{/* Left Icon */}
			<Box
				sx={{
					backgroundColor: iconColor,
					padding: "0.5em",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					transition: "transform 0.2s ease",
					"&:hover": {
						transform: "scale(1.05)",
					},
				}}
			>
				{LeftIcon}
			</Box>

			{/* Content */}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					variant="body1"
					sx={{
						fontWeight: read ? 400 : 500,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						lineHeight: 1.5,
						mb: "0.5em",
						fontSize: "0.95rem",
						color: textColor,
					}}
				>
					{message}
				</Typography>
				<Typography
					variant="body2"
					sx={{
						color: read ? "#bbb" : "text.secondary",
						fontSize: "0.8rem",
						display: "flex",
						alignItems: "center",
						gap: "0.375em",
					}}
				>
					{getRelativeTime(createdAt)}
				</Typography>
			</Box>

			{/* Mark as Read Button or Double Tick */}
			{read ? (
				<Tooltip title="Read">
					<Box sx={{ display: "flex", alignItems: "center", color: "#bbb" }}>
						<DoneAllIcon fontSize="small" />
					</Box>
				</Tooltip>
			) : (
				<Tooltip title="Mark as read">
					<IconButton
						size="small"
						onClick={handleMarkAsRead}
						sx={{
							flexShrink: 0,
							color: "text.secondary",
							"&:hover": {
								color: iconColor,
							},
						}}
					>
						<Check />
					</IconButton>
				</Tooltip>
			)}
		</Box>
	);
};

export default NotificationCard;
