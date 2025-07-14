import { realtimeDb } from "firebase-setup";
import {
	ref as firebaseRef,
	get,
	off,
	onChildAdded,
	update,
} from "firebase/database";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setNotificationData } from "../redux/slices/topbarSlice";

const NOTIFICATION_DIRECT_PATH = "notification/direct";
const NOTIFICATION_GROUP_PATH = "notification/group";
const NOTIFICATION_GENERAL_PATH = "notification/general";

// Toast configuration for notifications
const toastConfig = {
	position: "top-right",
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};

const NotificationListener = () => {
	const userId = useSelector((state) => state?.auth?.personData?.id);
	const groupIds = useSelector((state) => state?.auth?.personData?.groups);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!userId) return;
		const listeners = [];

		const allNotifications = [];
		let subscriptionsCompleted = 0;
		const totalSubscriptions = 1 + (groupIds?.length || 0) + 1; // 1 for direct, 1 for general, + group subscriptions

		// Helper to mark direct notification as notified
		const markDirectNotified = async (notifPath) => {
			await update(firebaseRef(realtimeDb, notifPath), { notified: true });
		};

		// Helper to add userId to group notification's notified array
		const markGroupNotified = async (notifPath, currentNotified) => {
			const notifiedArr = Array.isArray(currentNotified) ? currentNotified : [];
			if (!notifiedArr.includes(userId)) {
				await update(firebaseRef(realtimeDb, notifPath), {
					notified: [...notifiedArr, userId],
				});
			}
		};

		// Helper to show toast notification
		const showToast = (data, type = "info") => {
			const message = data.content || data.message;
			if (!message) return;

			// Validate toast type
			const validTypes = ["info", "success", "warning", "error"];
			const toastType = validTypes.includes(type) ? type : "info";

			toast[toastType](message, {
				...toastConfig,
				toastId: data.id, // Using messageId as toastId
			});
		};

		// Helper to normalize notification object
		const normalizeNotification = (raw) => {
			let createdAt = raw.createdAt || raw.created_at;
			// Convert Firestore Timestamp to JS Date if needed
			if (createdAt && typeof createdAt.toDate === "function") {
				createdAt = createdAt.toDate();
			}
			return {
				...raw,
				createdAt,
			};
		};

		// Helper to add new notification to the beginning of the list, avoiding duplicates
		const addNewNotification = (notification) => {
			if (!notification.id) return;
			const exists = allNotifications.some((n) => n.id === notification.id);
			if (exists) return;
			allNotifications.push(notification);
			// Sort by createdAt timestamp, newest first
			allNotifications.sort((a, b) => {
				const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return timeB - timeA;
			});
			dispatch(setNotificationData([...allNotifications]));
		};

		// Helper to sort and dispatch all notifications
		const sortAndDispatchNotifications = () => {
			// Sort by createdAt timestamp, newest first
			allNotifications.sort((a, b) => {
				const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return timeB - timeA;
			});
			dispatch(setNotificationData([...allNotifications]));
		};

		// Helper to check if all subscriptions are completed
		const checkSubscriptionsComplete = () => {
			subscriptionsCompleted++;
			if (subscriptionsCompleted === totalSubscriptions) {
				sortAndDispatchNotifications();
			}
		};

		// Load all direct notifications (old and live)
		const directRef = firebaseRef(
			realtimeDb,
			`${NOTIFICATION_DIRECT_PATH}/${userId}`,
		);

		// Load old direct notifications
		get(directRef)
			.then((snapshot) => {
				const data = snapshot.val();
				if (data) {
					const directNotifications = Object.values(data).map(
						normalizeNotification,
					);
					const newDirectNotifications = directNotifications.filter(
						(n) => !allNotifications.some((existing) => existing.id === n.id),
					);
					allNotifications.push(...newDirectNotifications);
				}
				checkSubscriptionsComplete();
			})
			.catch(() => {
				checkSubscriptionsComplete();
			});

		// Listen for new direct notifications
		const directCallback = (snapshot) => {
			const data = snapshot.val();
			if (!data) return;
			const notification = normalizeNotification(data);
			const { notified } = notification;
			addNewNotification(notification);

			// Only show toast and mark as notified if not already notified
			if (notified !== true) {
				showToast(notification, notification.type || "info");
				markDirectNotified(
					`${NOTIFICATION_DIRECT_PATH}/${userId}/${snapshot.key}`,
				);
			}
		};
		onChildAdded(directRef, directCallback);
		listeners.push({ ref: directRef, callback: directCallback });

		// Load all group notifications (old and live)
		if (groupIds && groupIds.length > 0) {
			for (const groupId of groupIds) {
				const groupRef = firebaseRef(
					realtimeDb,
					`${NOTIFICATION_GROUP_PATH}/${groupId}`,
				);

				// Load old group notifications
				get(groupRef)
					.then((snapshot) => {
						const data = snapshot.val();
						if (data) {
							const groupNotifications = Object.values(data).map(
								normalizeNotification,
							);
							const newGroupNotifications = groupNotifications.filter(
								(n) =>
									!allNotifications.some((existing) => existing.id === n.id),
							);
							allNotifications.push(...newGroupNotifications);
						}
						checkSubscriptionsComplete();
					})
					.catch(() => {
						checkSubscriptionsComplete();
					});

				// Listen for new group notifications
				const groupCallback = (snapshot) => {
					const data = snapshot.val();
					if (!data) return;
					const notification = normalizeNotification(data);
					const { notified = [] } = notification;
					addNewNotification(notification);

					// Only show toast and mark as notified if user hasn't been notified
					if (!Array.isArray(notified) || !notified.includes(userId)) {
						showToast(notification, notification.type || "info");
						markGroupNotified(
							`${NOTIFICATION_GROUP_PATH}/${groupId}/${snapshot.key}`,
							notified,
						);
					}
				};
				onChildAdded(groupRef, groupCallback);
				listeners.push({ ref: groupRef, callback: groupCallback });
			}
		} else {
			// If no groupIds, mark direct subscription as complete
			checkSubscriptionsComplete();
		}

		// Load all general notifications (old and live)
		const generalRef = firebaseRef(realtimeDb, NOTIFICATION_GENERAL_PATH);

		// Load old general notifications
		get(generalRef)
			.then((snapshot) => {
				const data = snapshot.val();
				if (data) {
					const generalNotifications = Object.values(data).map(
						normalizeNotification,
					);
					const newGeneralNotifications = generalNotifications.filter(
						(n) => !allNotifications.some((existing) => existing.id === n.id),
					);
					allNotifications.push(...newGeneralNotifications);
				}
				checkSubscriptionsComplete();
			})
			.catch(() => {
				checkSubscriptionsComplete();
			});
		// Listen for new general notifications
		const generalCallback = (snapshot) => {
			const data = snapshot.val();
			if (!data) return;
			const notification = normalizeNotification(data);
			addNewNotification(notification);
			showToast(notification, notification.type || "info");
		};
		onChildAdded(generalRef, generalCallback);
		listeners.push({ ref: generalRef, callback: generalCallback });

		return () => {
			for (const { ref, callback } of listeners) {
				off(ref, "child_added", callback);
			}
		};
	}, [userId, groupIds, dispatch]);

	return null;
};

export default NotificationListener;
