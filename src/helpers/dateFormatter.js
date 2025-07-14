/**
 * Formats a date into "dd MMM yyyy HH:mm" format
 * @param {Date|string|number} date - The date to format (Date object, ISO string, or timestamp)
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date) => {
	if (!date) return "";

	const dateObj = new Date(date);
	if (Number.isNaN(dateObj.getTime())) return "";

	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const pad = (num) => String(num).padStart(2, "0");

	const day = pad(dateObj.getDate());
	const month = months[dateObj.getMonth()];
	const year = dateObj.getFullYear();
	const hours = pad(dateObj.getHours());
	const minutes = pad(dateObj.getMinutes());

	return `${day} ${month} ${year} ${hours}:${minutes}`;
};

/**
 * Returns a relative time string (e.g., "2 hours ago", "just now")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
	if (!date) return "";

	const dateObj = new Date(date);
	if (Number.isNaN(dateObj.getTime())) return "";

	const now = new Date();
	const diffInSeconds = Math.floor((now - dateObj) / 1000);

	if (diffInSeconds < 60) return "just now";

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) return `${diffInDays}d ago`;

	// If more than 7 days, return formatted date
	return formatDateTime(date);
};
