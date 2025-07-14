import { convert } from "html-to-text";
import { jsonrepair } from "jsonrepair";
import { jwtDecode } from "jwt-decode";
import { isEmpty } from "lodash";
import { tabMappings } from "./constants";

export const getTenantFromToken = () => {
	let token = localStorage?.getItem("jwtToken");
	if (token) {
		token = jwtDecode(token);
		return token?.firebase?.tenant || "";
	}
	return "";
};

export const formatTime = (time) => {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = time % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const isEmptyRichTextEditor = (content) => {
	const cleanedContent = content
		.replace(/<p>\s*<\/p>/g, "")
		.replace(/<p><br><\/p>/g, "")
		.replace(/<\/?p>/g, "");

	return cleanedContent.trim() === "";
};

export const convertHtmlToText = (htmlContent) => {
	const text = convert(htmlContent);
	return text;
};

export function jsonToHtml(json) {
	function capitalizeWords(str) {
		return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function processValue(value, key, parentTag) {
		let html = "";
		const displayKey = capitalizeWords(key);

		if (typeof value === "object" && value !== null) {
			if (Array.isArray(value)) {
				// For arrays
				if (displayKey) {
					html += `<div><strong>${displayKey}:</strong></div>`;
				}
				html += "<ul>";
				for (const item of value) {
					if (typeof item === "object") {
						// If the array item is an object, recursively process it
						html += "<li>";
						for (const subKey in item) {
							if (Object.prototype.hasOwnProperty.call(item, subKey)) {
								html += processValue(item[subKey], subKey, "div");
							}
						}
						html += "</li>";
					} else {
						// If the array item is a primitive value, display it directly
						html += `<li>${item}</li>`;
					}
				}
				html += "</ul>";
			} else {
				// For nested objects
				if (parentTag === "ul") {
					html += `<li><strong>${displayKey}:</strong></li>`;
				} else {
					html += `<div><strong>${displayKey}:</strong></div>`;
				}
				html += "<ul>";
				for (const subKey in value) {
					if (Object.prototype.hasOwnProperty.call(value, subKey)) {
						html += processValue(value[subKey], subKey, "ul");
					}
				}
				html += "</ul>";
			}
		} else {
			// For primitive values
			if (parentTag === "ul") {
				html += `<li><strong>${displayKey}:</strong> ${value}</li>`;
			} else {
				html += `<div><strong>${displayKey}:</strong> ${value}</div>`;
			}
		}
		return html;
	}

	let html = "";
	if (Array.isArray(json)) {
		html += processValue(json, "", "");
	} else {
		for (const key in json) {
			if (Object.prototype.hasOwnProperty.call(json, key)) {
				html += processValue(json[key], key, "");
			}
		}
	}
	return html;
}

export function parseToNumber(input) {
	if (!input) {
		return null;
	}
	if (typeof input === "number") {
		return input;
	}

	if (typeof input === "string") {
		const trimmedInput = input.trim();

		// Handle "x/y" format
		if (trimmedInput.includes("/")) {
			const parts = trimmedInput.split("/");
			const firstPart = parts[0].trim();
			const parsedFirstPart = Number(firstPart);
			if (!Number.isNaN(parsedFirstPart)) {
				return parsedFirstPart;
			}
		}

		// Handle "%" suffix
		if (trimmedInput.endsWith("%")) {
			const numberPart = trimmedInput.slice(0, -1).trim();
			const parsedNumber = Number(numberPart);
			if (!Number.isNaN(parsedNumber)) {
				return parsedNumber;
			}
		}

		// Attempt to convert the entire string to a number
		const parsedNumber = Number(trimmedInput);
		if (!Number.isNaN(parsedNumber)) {
			return parsedNumber;
		}
	}

	// Return null if input doesn't match any valid format
	return null;
}

export const constructAttemptPath = (data, key, model) => {
	return `/attempt${model === "virtualPatient" ? "/virtual" : ""}?caseId=${data.caseId}&stationId=${data.stationId}&attemptId=${key}`;
};

export const convertCaseDetailsToString = (caseDetails) => {
	try {
		return convertHtmlToText(caseDetails.description).trim();
	} catch (e) {
		console.error("Error converting case details to string: ", e);
		return caseDetails;
	}
};

export const getEhrDetailsfromCaseDetails = (caseDetails) => {
	const ehrData = JSON.parse(
		caseDetails?.ehrData[0]?.resource?.extension[0]?.valueString,
	);
	try {
		for (const key in ehrData) {
			if (Object.prototype.hasOwnProperty.call(ehrData, key)) {
				const lowerCaseKey = key.toLowerCase();
				ehrData[lowerCaseKey] = convertHtmlToText(ehrData[key]);
				ehrData[lowerCaseKey] = ehrData[lowerCaseKey].replace(/\n/g, " ");
				if (lowerCaseKey !== key) {
					delete ehrData[key];
				}
			}
		}
		const filteredEhrData = Object.keys(ehrData).reduce((acc, key) => {
			if (ehrData[key] !== "None") {
				acc[key] = ehrData[key];
			}
			return acc;
		}, {});
		return filteredEhrData;
	} catch (e) {
		console.error("Error getting ehr details from case details: ", e);
		return {};
	}
};

export const repairJson = (jsonString) => {
	let json = jsonString;
	try {
		// If it's already an object, return it as is
		if (typeof json === "object") {
			return json;
		}

		// Ensure json is a string
		if (typeof json !== "string") {
			throw new Error("Input must be a string or an object");
		}

		// Remove leading content before the first '{'
		const startIndex = json.indexOf("{");
		if (startIndex === -1) {
			throw new Error("No valid JSON object found");
		}
		json = json.slice(startIndex);

		// Find the last occurrence of '}'
		const endIndex = json.lastIndexOf("}");
		if (endIndex === -1) {
			throw new Error("No valid JSON object found");
		}
		json = json.slice(0, endIndex + 1);

		// Repair the JSON string
		json = JSON.parse(jsonrepair(json));
		return json;
	} catch (error) {
		console.error("Error in repairJson function:", error.message);
		console.error("Input JSON string:", jsonString);
		return { error: "Something went wrong. Please try again later" };
	}
};

export const isJsonString = (str) => {
	try {
		JSON.parse(str);
	} catch (e) {
		console.error(e);
		return false;
	}
	return true;
};

export const getCachedTenant = (email) => {
	if (!localStorage.getItem("tenants")) {
		localStorage.setItem("tenants", JSON.stringify([]));
	}
	let tenantsList = localStorage.getItem("tenants");
	if (isJsonString(tenantsList)) {
		tenantsList = JSON.parse(tenantsList);
		const tenantData = tenantsList.filter((f) => f?.email === email);
		if (tenantData.length) {
			return tenantData[0]?.tenant;
		}
		return false;
	}
	return false;
};

export const getRandomDOBFromAge = (
	age = Math.floor(Math.random() * 100) + 1,
) => {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const birthYear = currentYear - age;
	const month = Math.floor(Math.random() * 12);
	const daysInMonth = new Date(birthYear, month + 1, 0).getDate();
	const day = Math.floor(Math.random() * daysInMonth) + 1;
	const formattedDOB = `${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}/${birthYear}`;
	return formattedDOB;
};

export const extractNumberFromString = (string) => {
	const match = string.match(/\d+/g);
	return match ? match : null;
};

export const getDateFromISOString = (date) => {
	return new Date(date).toISOString().split("T")[0];
};

export const getTabValue = (type) => tabMappings[type] ?? 0;

export const convertSecToTime = (value = 0) => {
	let seconds = Math.floor(value);
	const days = Math.floor(seconds / (24 * 3600));
	seconds %= 24 * 3600;
	const hours = Math.floor(seconds / 3600);
	seconds %= 3600;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const timeParts = [];

	if (days > 0) timeParts.push(`${days} day${days !== 1 ? "s" : ""}`);
	if (hours > 0) timeParts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
	if (minutes > 0) timeParts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);
	if (remainingSeconds > 0 || timeParts.length === 0)
		timeParts.push(
			`${remainingSeconds} sec${remainingSeconds !== 1 ? "s" : ""}`,
		);

	return timeParts.join(" ");
};

export const isGivenValueEmpty = (value) => {
	const emptyValues = [
		null,
		undefined,
		"null",
		"undefined",
		"",
		" ",
		"NULL",
		"Null",
		"UNDEFINED",
		"Undefined",
	];
	return !value || isEmpty(value) || emptyValues.includes(value);
};

export const hasEditPrivileges = (createdByID, userRole, userID) => {
	if (userRole === "Admin") {
		return true;
	}

	if (userRole === "Examiner") {
		if (createdByID === userID) {
			return true;
		}
		return false;
	}

	return false;
};

export function calculateAge(dobString) {
	const dob = new Date(dobString);
	const today = new Date();

	let age = today.getFullYear() - dob.getFullYear();
	const monthDiff = today.getMonth() - dob.getMonth();

	// Adjust if the birthday hasn't occurred yet this year
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age--;
	}

	return age;
}

export function getScore(data) {
	let score = 0;
	let total = 0;
	if (data?.value?.Sections?.length > 0) {
		for (const section of data.value.Sections) {
			for (const criterion of section.Criteria) {
				score += Number.parseInt(criterion.Score, 10);
				total += 5;
			}
		}
	}

	return { score, total };
}
export const generateFormScoreHelper = (content) => {
	const hasValue = (input) => {
		if (input == null || input === "") return false;

		if (Array.isArray(input)) {
			return input.some((item) => hasValue(item));
		}

		if (typeof input === "object") {
			return Object.values(input).some((value) => hasValue(value));
		}

		// Primitive value like number, boolean, string (non-empty)
		return true;
	};

	return hasValue(content)
		? content
		: { notes: content, error: "Please fill out the form" };
};

// export const generateFormScoreHelper = async (content) => {
// 	for (const value of Object.values(content)) {
// 		if (value) {
// 			return content;
// 		}
// 	}

// 	return { error: "Please fill out the form" };
// };

export const getSpeechComponentTabStyles = (isSelected) => ({
	minWidth: "2rem",
	minHeight: "2rem",
	padding: 0,
	borderRadius: "50%",
	margin: "0 0.5rem",
	background: isSelected ? "#5840BA" : "transperent",
	"& .Mui-selected": {
		color: isSelected ? "#fff !important" : "#000 !important",
	},
	"& .MuiTab-iconWrapper": {
		color: isSelected ? "#fff" : "#000",
		borderRadius: "50%",
		padding: 8,
		transition: "all 0.3s ease",
	},
	"& .MuiSvgIcon-root": {
		fill: isSelected ? "white" : "black",
	},
});

export const createTree = (data, node, level = 0) => {
	if (!data.category_path_names?.[level]) {
		if (!node.tests) {
			node.tests = [];
		}
		node.tests.push({
			name: data.test_name || data.name,
			id: data.test_id || data.id,
			description: data.test_description || data.description,
			flatIndex: data.flatIndex,
			fileId: data.fileId,
		});
		return;
	}

	const categoryName = data.category_path_names[level];
	const categoryId = data.category_path_ids[level];
	// Check if child with this category exists already
	if (!node.children) {
		node.children = [];
	}
	let child = node.children.find((c) => c.category === categoryName);

	if (!child) {
		child = { category: categoryName, id: categoryId, children: [] };
		node.children.push(child);
	}

	// Recurse into the child node
	createTree(data, child, level + 1);
};

export const buildPEHierarchy = (data) => {
	const root = { category: "root", children: [] };
	for (const test of data) {
		createTree(test, root);
	}
	return root.children;
};
