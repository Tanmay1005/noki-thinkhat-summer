import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	IconButton,
	Paper,
	Tooltip,
	Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	GET_OLD_NOTIFICATIONS,
	MARK_NOTIFICATIONS_AS_READ,
} from "../../adapters/noki_ed.service";
import { markNotificationsAsReadById } from "../../redux/slices/topbarSlice";
import NotificationCard from "./NotificationCard";

// Notification target constants
export const NOTIFICATION_TARGET_DIRECT = "direct";
export const NOTIFICATION_TARGET_GROUP = "group";
export const NOTIFICATION_TARGET_GENERAL = "general";
export const notificationTargets = [
	NOTIFICATION_TARGET_DIRECT,
	NOTIFICATION_TARGET_GROUP,
	NOTIFICATION_TARGET_GENERAL,
];

const NotificationModal = ({ open, onClose }) => {
	const notifications = useSelector((state) => state.topbar.notifications);
	const dispatch = useDispatch();
	const userId = useSelector((state) => state?.auth?.personData?.id);
	const groupIds =
		useSelector((state) => state?.auth?.personData?.groups) || [];

	const [oldNotifications, setOldNotifications] = useState([]);
	const [oldPage, setOldPage] = useState(1);
	const [noMoreOld, setNoMoreOld] = useState(false);
	const [loading, setLoading] = useState(false);

	// Reset old notifications if user changes (login/logout)
	useEffect(() => {
		setOldNotifications([]);
		setOldPage(1);
		setNoMoreOld(false);
	}, [userId]);

	const markAsRead = async (notifs) => {
		setLoading(true);
		const notifArray = Array.isArray(notifs) ? notifs : [notifs];
		const payload = notifArray.map(({ id, target, target_id }) => {
			const obj = { id, target };
			if ((target === "direct" || target === "group") && target_id)
				obj.target_id = target_id;
			return obj;
		});
		try {
			const response = await MARK_NOTIFICATIONS_AS_READ({
				notifications: payload,
			});
			const successfulIds = (response?.data?.results || [])
				.filter((r) => r.success)
				.map((r) => r.id);
			if (successfulIds.length > 0) {
				dispatch(markNotificationsAsReadById(successfulIds));
				// Also update oldNotifications if present
				setOldNotifications((prev) =>
					prev.map((n) =>
						successfulIds.includes(n.id) ? { ...n, read: true } : n,
					),
				);
			}
		} catch (_e) {
		} finally {
			setLoading(false);
		}
	};

	const handleClearAllNotifications = () => {
		markAsRead(notifications);
	};

	const handleMarkAsRead = (notification) => {
		markAsRead(notification);
	};

	const handleLoadOldNotifications = async () => {
		setLoading(true);
		try {
			// Build targetIds as a comma-separated string of userId and all groupIds
			const targetIds = [userId, ...groupIds].filter(Boolean).join(",");
			// Build target as a comma-separated string of notificationTargets
			const target = notificationTargets.join(",");
			const response = await GET_OLD_NOTIFICATIONS({
				page: oldPage,
				pageSize: 20,
				targetIds,
				target,
			});
			const apiData = response?.data?.data || [];
			if (apiData.length === 0) {
				setNoMoreOld(true);
				return;
			}
			// Deduplicate: filter out notifications already in Redux or oldNotifications
			const allCurrentIds = new Set([
				...notifications.map((n) => n.id),
				...oldNotifications.map((n) => n.id),
			]);
			const deduped = apiData.filter((n) => !allCurrentIds.has(n.id));
			if (deduped.length > 0) {
				setOldNotifications((prev) => [...prev, ...deduped]);
			}
			setOldPage((p) => p + 1);
			if (apiData.length < 20) setNoMoreOld(true);
		} catch (_e) {
		} finally {
			setLoading(false);
		}
	};

	// Merge notifications: deduplicate by id, prefer Redux (live) notification if present
	const mergedNotifications = useMemo(() => {
		const notifMap = new Map();
		for (const n of oldNotifications) {
			if (!notifMap.has(n.id)) {
				notifMap.set(n.id, {
					...n,
					read: true,
					createdAt: n.createdAt || n.created_at,
				});
			}
		}
		for (const n of notifications) {
			notifMap.set(n.id, n); // Redux/live notifications overwrite old ones
		}
		// Sort: unread first, then by createdAt (newest first)
		return Array.from(notifMap.values()).sort((a, b) => {
			if ((a.read ? 1 : 0) !== (b.read ? 1 : 0)) {
				return (a.read ? 1 : 0) - (b.read ? 1 : 0);
			}
			const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return timeB - timeA;
		});
	}, [notifications, oldNotifications]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			hideBackdrop
			PaperProps={{
				sx: {
					position: "fixed",
					right: "2rem",
					top: "3.5rem",
					m: 0,
					width: "25rem",
					maxWidth: "90vw",
					maxHeight: "50vh",
					display: "flex",
					flexDirection: "column",
					borderRadius: "0.5rem",
					boxShadow:
						"0 0.5rem 1.5rem rgba(0,0,0,0.15), 0 0.25rem 0.5rem rgba(0,0,0,0.12)",
					"& .MuiPaper-root": {
						borderRadius: "0.5rem",
					},
				},
			}}
			sx={{
				"& .MuiBackdrop-root": {
					backgroundColor: "transparent",
				},
				"& .MuiPaper-root": {
					borderRadius: "0.5rem",
				},
			}}
		>
			<Paper
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					borderRadius: "0.5rem",
					boxShadow: "none",
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						px: 2,
						py: 1.5,
						borderBottom: "1px solid",
						borderColor: "divider",
						flexShrink: 0,
					}}
				>
					<DialogTitle sx={{ p: 0, fontSize: "1.1rem" }}>
						Notifications
					</DialogTitle>
					<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
						{notifications?.length > 0 && (
							<Tooltip title="Mark all as read">
								<IconButton
									onClick={handleClearAllNotifications}
									size="small"
									sx={{ color: "text.secondary" }}
								>
									<ClearAllRoundedIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}
						<IconButton
							onClick={onClose}
							size="small"
							sx={{ color: "text.secondary" }}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				</Box>

				{/* Notification List */}
				<Box
					sx={{
						flexGrow: 1,
						overflowY: "auto",
						px: 2,
						py: 1,
						"&::-webkit-scrollbar": {
							width: "0.5rem",
							backgroundColor: "transparent",
						},
						"&::-webkit-scrollbar-thumb": {
							backgroundColor: "rgba(0,0,0,0.1)",
							borderRadius: "0.25rem",
							"&:hover": {
								backgroundColor: "rgba(0,0,0,0.2)",
							},
						},
					}}
				>
					{mergedNotifications.length === 0 && !loading ? (
						<Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
							<NotificationsOffOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
							<Typography>No notifications</Typography>
							<Button
								onClick={handleLoadOldNotifications}
								variant="outlined"
								size="small"
								disabled={noMoreOld || loading}
								sx={{ mt: 2 }}
							>
								Load Old Notifications
							</Button>
						</Box>
					) : (
						<>
							{mergedNotifications.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									onMarkAsRead={handleMarkAsRead}
								/>
							))}
							{!noMoreOld && !loading && (
								<Button
									onClick={handleLoadOldNotifications}
									variant="outlined"
									size="small"
									fullWidth
									disabled={noMoreOld || loading}
									sx={{ mt: 1, fontSize: "0.8rem" }}
								>
									Load Old Notifications
								</Button>
							)}
						</>
					)}
				</Box>

				{/* Loader Overlay */}
				{loading && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							zIndex: 10,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(255,255,255,0.6)",
						}}
					>
						<CircularProgress size={48} thickness={4} />
					</Box>
				)}
			</Paper>
		</Dialog>
	);
};

export default NotificationModal;
