import TurndownService from "turndown";
function buildHtmlFromObject(obj) {
	let html = "";

	for (const [key, value] of Object.entries(obj)) {
		// Skip any 'documents' key
		if (key === "documents" || key === "fileId") continue;

		if (typeof value === "object" && value !== null) {
			html += `
				<div style="margin-left: 20px;">
					<h3>${key}</h3>
					${buildHtmlFromObject(value)}
				</div>
			`;
		} else {
			html += `
				<div style="margin-left: 20px;">
					<strong>${key}:</strong> <span>${value}</span>
				</div>
			`;
		}
	}
	return html;
}

export function createPromptFromObject(data) {
	// Initialize the Turndown service
	const turndownService = new TurndownService();

	// Helper function to convert HTML to Markdown
	function htmlToMarkdown(html) {
		if (!html) return "No data available";
		try {
			return turndownService.turndown(html);
		} catch (error) {
			console.error("Error converting HTML to Markdown:", error);
			return "Conversion failed";
		}
	}

	// Extract necessary fields
	const ehrDataValueString = data?.ehr || "No EHR Data Available";

	let ehrDataObject = {};

	try {
		ehrDataObject =
			typeof ehrDataValueString === "string"
				? JSON.parse(ehrDataValueString)
				: ehrDataValueString;
	} catch (e) {
		console.error(e);
	}

	let ehrDataHtml = "";

	try {
		ehrDataHtml = buildHtmlFromObject(ehrDataObject);
	} catch (e) {
		console.error(e);
	}

	const description = data?.description || "No description provided";
	const caseType = data?.specialization || "No case type specified";
	const scenario = data?.scenario || "No Scenario specified";
	const pePrompts =
		data?.physicalExaminationPrompts ||
		"No Physical Examination behavior specified";

	// Convert to Markdown
	const ehrDataMarkdown = htmlToMarkdown(ehrDataHtml);
	const descriptionMarkdown = htmlToMarkdown(description);

	// Create the prompt
	const prompt = `     
Description
------
${descriptionMarkdown}

Case Type
------
${caseType}

EHR Data
------
${ehrDataMarkdown}

SCENARIO
------
${scenario}

STATION
------
${data?.stationType}

ADDITIONAL BEHAVIOR
-------
${data?.additionalPrompt}
${pePrompts}
    `;

	return prompt.trim();
}
