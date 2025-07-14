export const NOKI_TENANT_ID = process.env.REACT_APP_FORMD_TENANT_ID;
export const caseTypes = [
	"Cardiology",
	"Gastroenterology",
	"Oncology",
	"Neurology",
	"Orthopedics",
];

export const stationType = [
	"Focused History",
	"Focused Physical Examination",
	"Interpretation of Investigative Results",
	"Assessment/Plan",
	"Professionalism",
	"Patient Education",
	"SOAP NOTE",
	"Procedures",
];

export const circuitModesConfig = {
	edit: {
		title: "Add Cases to Circuit",
		saveButtonTitle: "Update",
		isNameEdit: true,
		isDescriptionEdit: true,
		isVisibility: false,
	},
	create: {
		title: "Create Circuit",
		saveButtonTitle: "Build a Circuit",
		isNameEdit: true,
		isDescriptionEdit: true,
		isVisibility: true,
	},
};
export const breadCrumbsMap = {
	Admin: {
		"/": "Dashboard",
		"/configuration-hub": "Configuration Hub",
		"/users-and-groups": "Users & Groups",
		"/station-details": "Configuration Hub",
		"/group-management": "Group Management",
		"/quiz-config": "Quiz Config",
		"/admin-feedback": "Assignments",
		"/edit-score": "Edit Score",
		"/ai-tutor": "FORMD AI Tutor",
	},
	Student: {
		"/": "Dashboard",
		"/case": "Train up",
		"/attempt": "Train up",
		"/allscores": "Score Card",
		"/OSCE": "Tests",
		"/feedback": "Assignments",
		"/OSCETraining": "Train up",
		"/my-practice": "My Practice",
		"/ai-tutor": "FORMD AI Tutor",
	},
	Examiner: {
		"/": "Dashboard",
		"/configuration-hub": "Configuration Hub",
		"/group-management": "Group Management",
		"/admin-feedback": "Assignments",
		"/edit-score": "Edit Score",
	},
};
export const titleMap = {
	...breadCrumbsMap?.Admin,
	...breadCrumbsMap?.Student,
	"/login": "Login",
};
