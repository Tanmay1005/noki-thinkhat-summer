export const assessmentPlanFeedbackFormatter = (data) => {
	const expert_approach = [];
	const student_approach = [];

	const statusMap = {
		correct: ["student", "expert"],
		wrong: "student",
		missing: "expert",
		"partially correct": ["student", "expert"],
	};

	for (const item of data.Differential_Comparison) {
		const status = item.Status.toLowerCase();
		const mapped = statusMap[status];

		if (Array.isArray(mapped)) {
			for (const who of mapped) {
				if (who === "student")
					student_approach.push({
						heading: item?.Diagnosis,
						type: "tile",
						status: item?.Status,
					});
				if (who === "expert")
					expert_approach.push({
						heading: item?.Diagnosis,
						type: "tile",
						status: item?.Status,
						feedback: item?.Reason,
					});
			}
		} else if (mapped === "student") {
			student_approach.push({
				heading: item?.Diagnosis,
				type: "tile",
				status: item?.Status,
			});
		} else if (mapped === "expert") {
			expert_approach.push({
				heading: item?.Diagnosis,
				type: "tile",
				status: item?.Status,
				feedback: item?.Reason,
			});
		}
	}

	const final = {
		title: {
			student_approach: "Your Selected Differentials",
			expert_approach: "Expert Analysis and Ranking",
		},
		default: {
			student_approach,
			expert_approach,
		},
	};
	return final;
};

export const diagnosticTestsFeedbackFormatter = (data) => {
	const expert_approach = [];
	const student_approach = [];

	const statusMap = {
		correct: ["student", "expert"],
		wrong: "student",
		missing: "expert",
		"partially correct": ["student", "expert"],
	};

	for (const item of data.Diagnostic_Tests_Comparison) {
		const status = item.Status.toLowerCase();
		const mapped = statusMap[status];

		if (Array.isArray(mapped)) {
			for (const who of mapped) {
				if (who === "student")
					student_approach.push({
						heading: item?.Test_Name,
						type: "tile",
						status: item?.Status,
					});
				if (who === "expert")
					expert_approach.push({
						heading: item?.Test_Name,
						type: "tile",
						status: item?.Status,
						feedback: item?.Reason,
					});
			}
		} else if (mapped === "student") {
			student_approach.push({
				heading: item?.Test_Name,
				type: "tile",
				status: item?.Status,
			});
		} else if (mapped === "expert") {
			expert_approach.push({
				heading: item?.Test_Name,
				type: "tile",
				status: item?.Status,
				feedback: item?.Reason,
			});
		}
	}

	const final = {
		title: {
			student_approach: "Your Selected Tests",
			expert_approach: "Expert Analysis",
		},
		default: {
			student_approach,
			expert_approach,
		},
	};
	return final;
};

export const focusedHistoryExpertFeedbackFormatter = (data) => {
	const buildApproach = (field, allowedStatuses, isAdmin = false) =>
		data?.OLDCARTS?.map(({ Symptom, ...rest }) => ({
			heading: Symptom,
			type: "accordion",
			content: Object.entries(rest).map(([key, { Status, [field]: Body }]) => {
				const contentItem = { body: Body };
				const includeStatus = allowedStatuses.includes(Status?.toLowerCase());
				let status = includeStatus;
				if (
					isAdmin &&
					(status === "correct" || status === "partially correct")
				) {
					status = null;
				}
				return {
					heading: key,
					type: "tile",
					...(includeStatus && { status: Status }),
					content: [contentItem],
				};
			}),
		})) || [];

	const expertFeedBack = {
		title: {
			student_approach: "Your Approach",
			expert_approach: "Expert Approach",
		},
		default: {
			student_approach: buildApproach("Student", [
				"correct",
				"wrong",
				"partially correct",
			]),
			expert_approach: buildApproach(
				"Expert",
				["correct", "missing", "partially correct"],
				true,
			),
		},
	};
	return expertFeedBack;
};

export const physicalExaminationExpertFeedbackFormatter = (data) => {
	const studentGrouped = {};
	const expertGrouped = {};
	for (const {
		System,
		Exam_Name,
		Status,
		Reason,
	} of data.Physical_Examination_Comparison) {
		const examStatus = Status?.toLowerCase();

		// Add to student_data if status is correct or wrong
		if (["correct", "wrong", "partially correct"].includes(examStatus)) {
			if (!studentGrouped[System]) {
				studentGrouped[System] = [];
			}
			studentGrouped[System].push({
				body: Exam_Name,
				status: examStatus,
			});
		}

		// Add to expert_data if status is correct, missing, or partially correct
		if (["correct", "missing", "partially correct"].includes(examStatus)) {
			if (!expertGrouped[System]) {
				expertGrouped[System] = [];
			}
			expertGrouped[System].push({
				body: Exam_Name,
				...(examStatus === "missing" && { status: examStatus }),
				feedback: Reason,
			});
		}
	}

	const student_approach = Object.entries(studentGrouped).map(
		([system, content]) => ({
			heading: system,
			type: "tile",
			content,
		}),
	);

	const expert_approach = Object.entries(expertGrouped).map(
		([system, content]) => ({
			heading: system,
			type: "tile",
			content,
		}),
	);

	return {
		title: {
			student_approach: "Your Approach",
			expert_approach: "Expert Approach",
		},
		default: {
			student_approach,
			expert_approach,
		},
	};
};
const soapKeys = ["Subjective", "Objective", "Assessment", "Plan"];
export const soapNoteFeedbackFormatter = (SOAPData) => {
	const result = {};

	const normalize = (val) => {
		if (val == null) return "N/A";
		if (Array.isArray(val)) return val.join("\n");
		if (typeof val === "object") return JSON.stringify(val);
		return val.toString();
	};

	const buildApproachTiles = (entries, role) => {
		return entries
			.map((entry) => {
				const text = role === "student" ? entry.Student : entry.Expert;
				if (!text) return null;

				const content = [
					{
						body: normalize(text),
					},
				];

				const tile = {
					heading: entry.Topic?.replace(/_/g, " ") || "Untitled",
					type: "tile",
					content,
				};

				if (content.length === 1) {
					if (role === "expert") {
						if ((entry.Status || "").toLowerCase() === "missing") {
							tile.status = entry.Status;
						}
						tile.feedback = entry.Feedback || "";
					} else {
						if ((entry.Status || "").toLowerCase() !== "missing") {
							tile.status = entry.Status;
						}
					}
				}

				return tile;
			})
			.filter(Boolean);
	};

	const buildPlanAccordions = (entries, role) => {
		const groups = {};

		for (const entry of entries) {
			const category = entry.Category || "General";
			if (!groups[category]) groups[category] = [];

			const text = role === "student" ? entry.Student : entry.Expert;
			if (!text) continue;

			const content = [
				{
					body: normalize(text),
				},
			];

			const tile = {
				heading: entry.Topic?.replace(/_/g, " ") || "Untitled",
				type: "tile",
				content,
			};

			if (content.length === 1) {
				if (role === "expert") {
					if ((entry.Status || "").toLowerCase() === "missing") {
						tile.status = entry.Status;
					}
					tile.feedback = entry.Feedback || "";
				}
				// student — skip status/feedback
			}

			groups[category].push(tile);
		}

		return Object.entries(groups).map(([category, tiles]) => ({
			heading: category,
			type: "accordion",
			content: tiles,
		}));
	};

	// Final loop over each section
	for (const section of Object.keys(SOAPData)) {
		if (soapKeys?.includes(section)) {
			const entries = SOAPData[section];
			const isPlan = section === "Plan";

			result[section] = {
				student_approach: isPlan
					? buildPlanAccordions(entries, "student")
					: buildApproachTiles(entries, "student"),
				expert_approach: isPlan
					? buildPlanAccordions(entries, "expert")
					: buildApproachTiles(entries, "expert"),
			};
		}
	}

	return {
		title: {
			student_approach: "Your Approach",
			expert_approach: "Expert Approach",
		},
		...result,
	};
};
// export const soapNoteFeedbackFormatter = (SOAPData) => {
// 	const result = {};

// 	const normalize = (val) => {
// 		if (val == null) return "N/A";
// 		if (Array.isArray(val)) return val.join("\n");
// 		if (typeof val === "object") return JSON.stringify(val);
// 		return val.toString();
// 	};

// 	const buildApproachTiles = (entries, role) => {
// 		return entries
// 			?.map((entry) => {
// 				const text = role === "student" ? entry.Student : entry.Expert;
// 				if (!text) return null;

// 				const content = [
// 					{
// 						body: normalize(text),
// 					},
// 				];

// 				const tile = {
// 					heading: entry.Topic?.replace(/_/g, " ") || "Untitled",
// 					type: "tile",
// 					content,
// 				};

// 				// Only if there's one content entry, attach status
// 				if (content.length === 1) {
// 					tile.status = entry.Status || "";
// 					// Only add feedback for expert
// 					if (role === "expert") {
// 						tile.feedback = entry.Feedback || "";
// 					}
// 				}

// 				return tile;
// 			})
// 			.filter(Boolean);
// 	};

// 	const buildPlanAccordions = (entries, role) => {
// 		const groups = {};

// 		for (const entry of entries) {
// 			const category = entry.Category || "General";
// 			if (!groups[category]) groups[category] = [];

// 			const text = role === "student" ? entry.Student : entry.Expert;
// 			if (!text) continue;

// 			const content = [
// 				{
// 					body: normalize(text),
// 				},
// 			];

// 			const tile = {
// 				heading: entry.Topic?.replace(/_/g, " ") || "Untitled",
// 				type: "tile",
// 				content,
// 			};

// 			if (content.length === 1) {
// 				tile.status = entry.Status || "";
// 				if (role === "expert") {
// 					tile.feedback = entry.Feedback || "";
// 				}
// 			}

// 			groups[category].push(tile);
// 		}

// 		return Object.entries(groups).map(([category, tiles]) => ({
// 			heading: category,
// 			type: "accordion",
// 			content: tiles,
// 		}));
// 	};

// 	// Final construction loop
// 	for (const section of Object.keys(SOAPData)) {
// 		if (soapKeys?.includes(section)) {
// 			const entries = SOAPData[section];
// 			const isPlan = section === "Plan";

// 			result[section] = {
// 				student_approach: isPlan
// 					? buildPlanAccordions(entries, "student")
// 					: buildApproachTiles(entries, "student"),
// 				expert_approach: isPlan
// 					? buildPlanAccordions(entries, "expert")
// 					: buildApproachTiles(entries, "expert"),
// 			};
// 		}
// 	}

// 	return {
// 		title: {
// 			student_approach: "Your Approach",
// 			expert_approach: "Expert Approach",
// 		},
// 		...result,
// 	};
// };
