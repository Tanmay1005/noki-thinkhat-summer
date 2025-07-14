import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	FOCUSED_HISTORY,
	FOCUSED_PHYSICAL_EXAMINATION,
	PATIENT_EDUCATION,
	SOAP_NOTE,
} from "./constants";

export const imageByType = (itemType, item) => {
	const type = itemType?.toLowerCase();
	if (itemType === "Circuits" || type === "circuits") return "circuit-icon";

	const itemTypeName =
		itemType === "Stations" || type === "stations"
			? item?.type
			: item?.specialization
				? item?.specialization
				: item?.case_type;

	const findImage = {
		"Adult Reconstructive Orthopedics": "adult-reconstructive-orthopedics-icon",
		Allergy: "allergy-icon",
		"Allergy/Immunology": "allergy-immunology-icon",
		Anesthesiology: "anesthesiology-icon",
		Cardiology: "cardiology-icon",
		"Cardiovascular Surgery": "cardio-vascular-surgery-icon",
		"Colon and Rectal Surgery": "surgery-general-icon",
		"Critical Care": "critical-care-icon",
		Dentistry: "dentistry-icon",
		Dermatology: "dermatology-icon",
		"Diagnostic Radiology": "diagnostic-radiology-icon",
		"Emergency Medicine": "emergency-medicine-icon",
		"Endocrinology, Diabetes & Metabolism":
			"enocrionolgy-diabetes-metabolism-icon",
		Endodontist: "endodontist-icon",
		"Family Practice": "family-practice-icon",
		"Foot and Ankle Orthopedics": "foot-and-ankle-orthopedics-icon",
		Gastroenterology: "gastroenterology-icon",
		"General Dentistry": "general-dentistry-icon",
		"General Practice": "general-practice-icon",
		"Geriatric Medicine- IM": "geriatric-medicine-icon",
		"Gynecologic Oncology": "gynecologic-oncology-icon",
		Gynecology: "gynecology-icon",
		Hematology: "hematology-hematologyoncology-icon",
		"Hematology/Oncology": "hematology-hematologyoncology-icon",
		Hospitalist: "hospitalist-icon",
		Immunology: "immunology-icon",
		"Infectious Diseases": "infectious-diseases-icon",
		Infertility: "infertility-icon",
		"Internal Medicine": "internal-medicine-icon",
		"Interventional Cardiology": "interventional-cardiology-icon",
		"Medical Oncology": "medical-oncology-icon",
		Neonatology: "neonatology-icon",
		Nephrology: "nephrology-icon",
		"Neurological Surgery": "neurological-surgery-icon",
		Neurology: "neurology-icon",
		"Nuclear Medicine": "nuclear-medicine-icon",
		Nutrition: "nutrition-icon",
		Obstetrics: "obsetetrics-icon",
		"Obstetrics/Gynecology": "obstretics-gynecology-icon",
		"Occupational Medicine": "occupational-medicine-icon",
		Ophthalmology: "opthamology-icon",
		Optometrist: "optometrist-icon",
		"Oral and Maxillofacial Pathology": "oral-and-maxillofacial-pathology-icon",
		"Oral Surgery": "oral-surgery-icon",
		Orthodontics: "orthodontics-icon",
		Otolaryngology: "otolaryngology-icon",
		"Pain Medicine": "pain-medicine-icon",
		Pathology: "pathology-icon",
		"Pediatric Cardiology": "pediatric-cardiology-icon",
		"Pediatric Dermatology": "pediatric-dermatology-orthopedics-icon",
		"Pediatric Orthopaedic Surgery": "pediatric-dermatology-orthopedics-icon",
		Pediatrics: "pediatrics-icon",
		Pedodontist: "pedodontist-icon",
		Periodontics: "generic-specialty-icon",
		"Physical Medicine and Rehabilitation":
			"physical-medicine-and-rehabilation-icon",
		"Plastic Surgery": "plastic-surgery-icon",
		Podiatry: "podiotry-icon",
		Prosthodontist: "prosthodontist-icon",
		Psychiatry: "psychiatry-icon",
		"Pulmonary Medicine": "pulmonary-medicine-icon",
		"Radiation Oncology": "radiation-oncology-icon",
		Radiology: "radiology-icon",
		"Reproductive Endocrinology": "reproductive-enocrinology-icon",
		Rheumatology: "rheumatology-icon",
		"Spine Surgery": "spine-surgery-icon",
		"Sports Medicine": "sports-medicine-icon",
		"Surgery, General": "surgery-general-icon",
		"Surgical Oncology": "surgical-oncology-icon",
		Urology: "urology-icon",
		"Vascular Surgery": "vascular-surgery-icon",
		[FOCUSED_HISTORY]: "history-taking-icon",
		[FOCUSED_PHYSICAL_EXAMINATION]: "physical-examination-icon",
		"Interpretation of Investigative Results": "diagnostic-interpretation-icon",
		[DIAGNOSTIC_TESTS]: "diagnostic-interpretation-icon",
		[ASSESSMENT_PLAN]: "management-planning-icon",
		Professionalism: "interprofessional-collaboration-icon",
		[PATIENT_EDUCATION]: "emergency-response-icon",
		[SOAP_NOTE]: "ethical-decision-making-icon",
		Procedures: "procedural-skills-icon",
	};

	return (
		findImage[itemTypeName] ||
		(type === "stations" ? "default-station-icon" : "generic-specialty-icon")
	);
};
