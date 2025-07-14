export const caseTypes = [
	"Cardiology",
	"Gastroenterology",
	"Oncology",
	"Neurology",
	"Orthopedics",
];

export const specializations = [
	{
		label: "Adult Reconstructive Orthopedics",
		value: "Adult Reconstructive Orthopedics",
	},
	{ label: "Allergy", value: "Allergy" },
	{ label: "Allergy/Immunology", value: "Allergy/Immunology" },
	{ label: "Anesthesiology", value: "Anesthesiology" },
	{ label: "Cardiology", value: "Cardiology" },
	{ label: "Cardiovascular Surgery", value: "Cardiovascular Surgery" },
	{ label: "Colon and Rectal Surgery", value: "Colon and Rectal Surgery" },
	{ label: "Critical Care", value: "Critical Care" },
	{ label: "Dentistry", value: "Dentistry" },
	{ label: "Dermatology", value: "Dermatology" },
	{ label: "Diagnostic Radiology", value: "Diagnostic Radiology" },
	{ label: "Emergency Medicine", value: "Emergency Medicine" },
	{
		label: "Endocrinology, Diabetes & Metabolism",
		value: "Endocrinology, Diabetes & Metabolism",
	},
	{ label: "Endodontist", value: "Endodontist" },
	{ label: "Family Practice", value: "Family Practice" },
	{ label: "Foot and Ankle Orthopedics", value: "Foot and Ankle Orthopedics" },
	{ label: "Gastroenterology", value: "Gastroenterology" },
	{ label: "General Dentistry", value: "General Dentistry" },
	{ label: "General Practice", value: "General Practice" },
	{ label: "Geriatric Medicine- IM", value: "Geriatric Medicine- IM" },
	{ label: "Gynecologic Oncology", value: "Gynecologic Oncology" },
	{ label: "Gynecology", value: "Gynecology" },
	{ label: "Hematology", value: "Hematology" },
	{ label: "Hematology/Oncology", value: "Hematology/Oncology" },
	{ label: "Hospitalist", value: "Hospitalist" },
	{ label: "Immunology", value: "Immunology" },
	{ label: "Infectious Diseases", value: "Infectious Diseases" },
	{ label: "Infertility", value: "Infertility" },
	{ label: "Internal Medicine", value: "Internal Medicine" },
	{ label: "Interventional Cardiology", value: "Interventional Cardiology" },
	{ label: "Medical Oncology", value: "Medical Oncology" },
	{ label: "Neonatology", value: "Neonatology" },
	{ label: "Nephrology", value: "Nephrology" },
	{ label: "Neurological Surgery", value: "Neurological Surgery" },
	{ label: "Neurology", value: "Neurology" },
	{ label: "Nuclear Medicine", value: "Nuclear Medicine" },
	{ label: "Nutrition", value: "Nutrition" },
	{ label: "Obstetrics", value: "Obstetrics" },
	{ label: "Obstetrics/Gynecology", value: "Obstetrics/Gynecology" },
	{ label: "Occupational Medicine", value: "Occupational Medicine" },
	{ label: "Ophthalmology", value: "Ophthalmology" },
	{ label: "Optometrist", value: "Optometrist" },
	{
		label: "Oral and Maxillofacial Pathology",
		value: "Oral and Maxillofacial Pathology",
	},
	{ label: "Oral Surgery", value: "Oral Surgery" },
	{ label: "Orthodontics", value: "Orthodontics" },
	{ label: "Otolaryngology", value: "Otolaryngology" },
	{ label: "Pain Medicine", value: "Pain Medicine" },
	{ label: "Pathology", value: "Pathology" },
	{ label: "Pediatric Cardiology", value: "Pediatric Cardiology" },
	{ label: "Pediatric Dermatology", value: "Pediatric Dermatology" },
	{
		label: "Pediatric Orthopaedic Surgery",
		value: "Pediatric Orthopaedic Surgery",
	},
	{ label: "Pediatrics", value: "Pediatrics" },
	{ label: "Pedodontist", value: "Pedodontist" },
	{ label: "Periodontics", value: "Periodontics" },
	{
		label: "Physical Medicine and Rehabilitation",
		value: "Physical Medicine and Rehabilitation",
	},
	{ label: "Plastic Surgery", value: "Plastic Surgery" },
	{ label: "Podiatry", value: "Podiatry" },
	{
		label: "PReview_Of_Systemsthodontist",
		value: "PReview_Of_Systemsthodontist",
	},
	{ label: "Psychiatry", value: "Psychiatry" },
	{ label: "Pulmonary Medicine", value: "Pulmonary Medicine" },
	{ label: "Radiation Oncology", value: "Radiation Oncology" },
	{ label: "Radiology", value: "Radiology" },
	{ label: "Reproductive Endocrinology", value: "Reproductive Endocrinology" },
	{ label: "Rheumatology", value: "Rheumatology" },
	{ label: "Spine Surgery", value: "Spine Surgery" },
	{ label: "Sports Medicine", value: "Sports Medicine" },
	{ label: "Surgery, General", value: "Surgery, General" },
	{ label: "Surgical Oncology", value: "Surgical Oncology" },
	{ label: "Urology", value: "Urology" },
	{ label: "Vascular Surgery", value: "Vascular Surgery" },
];

export const applicableType = [
	{
		label: "Focused History",
		value: "Focused History",
	},
	{
		label: "Focused Physical Examination",
		value: "Focused Physical Examination",
	},
	{
		label: "Assessment/Plan",
		value: "Assessment/Plan",
	},
	{
		label: "Diagnostic Tests",
		value: "Interpretation of Investigative Results",
	},
	{
		label: "SOAP NOTE",
		value: "SOAP NOTE",
	},
	{
		label: "Professionalism",
		value: "Professionalism",
	},
	{
		label: "Patient Education",
		value: "Patient Education",
	},
	{
		label: "Procedures",
		value: "Procedures",
	},
];

export const roles = [
	{ label: "Student", value: "student" },
	{ label: "Admin", value: "admin" },
	{ label: "Teaching Staff", value: "examiner" },
];

export const tabMappings = {
	cases: 0,
	stations: 1,
	circuits: 2,
	multiStationCases: 3,
};
export const osceSections = ["Cases", "Stations", "Circuits", "Full Case"];
export const selectedCaseTextMap = {
	"in progress": "Selected Cases",
	discarded: "Select Cases to start",
};

export const genderOptions = [
	{ label: "Male", value: "male" },
	{ label: "Female", value: "female" },
	{ label: "Other", value: "other" },
];

export const promptNameByStation = {
	"Focused History": "analysis-feedback-for-focused-history",
	"Focused Physical Examination":
		"analysis-feedback-for-focused-physical-examination",
	"Interpretation of Investigative Results":
		"analysis-feedback-for-interpretation-of-investigative-results",
	"Assessment/Plan": "analysis-feedback-for-assessment-and-plan",
	Professionalism: "analysis-feedback-for-professionalism",
	"Patient Education": "analysis-feedback-for-patient-education",
	"SOAP NOTE": "analysis-feedback-for-soap-note",
	Procedures: "analysis-feedback-for-procedure",
};
export const ehrMappingConstant = {
	"Focused History": ["Vital_Signs", "Patient_Details"],
	"Focused Physical Examination": [
		"Vital_Signs",
		"Patient_Details",
		"History_of_Present_Illness",
		"Past_Medical_History",
		"Family_Medical_History",
		"Social_History",
		"Medications",
	],
	"Diagnostic Tests": [
		"Vital_Signs",
		"Patient_Details",
		"History_of_Present_Illness",
		"Past_Medical_History",
		"Family_Medical_History",
		"Social_History",
		"Medications",
		"Allergies",
		"Lab_and_Imaging_Results",
	],
	"Assessment/Plan": [
		"Vital_Signs",
		"Patient_Details",
		"History_of_Present_Illness",
		"Past_Medical_History",
		"Family_Medical_History",
		"Social_History",
		"Medications",
		"Review_Of_Systems",
		"Physical_Examination",
	],
	Professionalism: ["Patient_Details"],
	"Patient Education": [
		"Patient_Details",
		"History_of_Present_Illness",
		"Diagnostic_Reports",
		"Follow_Up",
		"Lab_and_Imaging_Results",
	],
	"SOAP NOTE": [
		"Vital_Signs",
		"History_of_Present_Illness",
		"Past_Medical_History",
		"Social_History",
		"Physical_Examination",
		"Lab_and_Imaging_Results",
	],
	Procedures: ["Vital_Signs", "Patient_Details", "History_of_Present_Illness"],
};

export const FOCUSED_HISTORY = "Focused History";
export const FOCUSED_PHYSICAL_EXAMINATION = "Focused Physical Examination";
export const ASSESSMENT_PLAN = "Assessment/Plan";
export const DIAGNOSTIC_TESTS = "Diagnostic Tests";
export const SOAP_NOTE = "SOAP NOTE";
export const PROCEDURES = "PROCEDURES";
export const PATIENT_EDUCATION = "PATIENT_EDUCATION";
export const PROFESSIONALISM = "Professionalism";
