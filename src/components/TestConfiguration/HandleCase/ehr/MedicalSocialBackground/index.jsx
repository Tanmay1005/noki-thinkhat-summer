import Allergies from "./Allergies";
import FamilyHistory from "./FamilyHistory";
import Medications from "./Medications";
import PastMedicalHistory from "./PastMedicalHistory";
import PreventiveHealthImmunizations from "./PreventiveHealthImmunisations";
import SocialHistory from "./SocialHistory";
import SurgicalHistory from "./SurgicalHistory";

const MedicalSocialBackground = ({ name = "" }) => {
	return (
		<div className="ehr-tab-style-case-creation overflow-auto p-4 d-flex flex-column gap-4">
			<div>
				<PastMedicalHistory name={name} />
			</div>
			<div>
				<SurgicalHistory name={name} />
			</div>
			<div>
				<Medications name={name} />
			</div>
			<div>
				<Allergies name={name} />
			</div>
			<div>
				<PreventiveHealthImmunizations name={name} />
			</div>
			<div>
				<SocialHistory name={name} />
			</div>
			<div>
				<FamilyHistory name={name} />
			</div>
		</div>
	);
};

export default MedicalSocialBackground;
