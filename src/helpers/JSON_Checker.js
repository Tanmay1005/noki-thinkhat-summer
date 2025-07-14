export function isValidJSON(str) {
	if (typeof str !== "string") {
		return false;
	}

	try {
		const parsed = JSON.parse(str);
		return typeof parsed === "object" && parsed !== null;
	} catch (e) {
		console.error(e);
		return false;
	}
}
