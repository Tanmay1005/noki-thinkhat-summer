import getSvgFileInfo from "helpers/PESVGHelper";
import { calculateAge } from "helpers/common_helper";
import { getColorByStationType } from "helpers/station_helpers";
import _ from "lodash";
import { useFormContext } from "react-hook-form";
import coughPerson from "../../assets/case_description_images/coughPerson.png";

const getRandomStationType = (stationList) => {
	if (!Array.isArray(stationList) || stationList.length === 0) return "Station";
	const randomIndex = Math.floor(Math.random() * stationList.length);
	return stationList[randomIndex]?.type || "Station";
};

const CasePatientInfoCard = ({ stationsList }) => {
	const methods = useFormContext();
	const { getValues } = methods;
	const gender = getValues("gender");
	const dob = getValues("dob");
	const appearance = getValues("appearance");
	const displayedType = getRandomStationType(stationsList);
	const _stationColor = getColorByStationType(displayedType);
	const patientAge = calculateAge(dob);
	const patientGender = _?.capitalize(gender);
	const patientHealthConcerns = getValues("current-chief-complaint");
	const patientExpectations =
		"Expect examiner follow-up questions based on your history.";
	const imageName = getSvgFileInfo(patientAge, appearance, gender, true);
	const imageSrc = imageName
		? `${process.env.REACT_APP_GCS_PUBLIC_BUCKET_URL}/avatars/${imageName}`
		: coughPerson;
	const handleImageError = (e) => {
		e.target.onerror = null;
		e.target.src = coughPerson;
	};
	return (
		<div className="d-flex flex-column flex-md-row gap-4 p-4 rounded-4 w-100 case-card-bg-secondary">
			{/* Left Section: Avatar */}
			<div
				className="d-flex justify-content-center w-40"
				style={{ height: "13em" }}
			>
				<img
					src={imageSrc}
					loading="lazy"
					alt="Patient avatar"
					className="p-2"
					onError={handleImageError}
					style={{
						// maxWidth: '500px',
						width: "100%",
						height: "100%",
						objectFit: "contain",
					}}
				/>
			</div>
			{/* Right Section: Patient Details */}
			<div className="d-flex flex-column flex-grow-1">
				{/* Top Row: Age & Gender Boxes */}
				<div className="d-flex justify-content-center justify-content-lg-start align-items-center gap-3 mb-3 mt-2">
					<div className="px-3 py-1 border rounded-3 text-center bg-white">
						<div className="text-muted" style={{ fontSize: "0.8rem" }}>
							Age
						</div>
						<div className="fw-semibold fs-8">{patientAge}</div>
					</div>

					<div className="px-3 py-1 border rounded-3 text-center bg-white">
						<div className="text-muted" style={{ fontSize: "0.8rem" }}>
							Gender
						</div>
						<div className="fw-semibold fs-8">{patientGender}</div>
					</div>

					{/* <div className="px-3 py-2 text-muted rounded-pill text-center">
						{station || "Station"}
						{displayedType && (
							<div
								className="px-3 py-2 text-white mt-1 rounded-pill text-center"
								style={{
									backgroundColor: stationColor,
									fontSize: "0.8rem",
									lineHeight: "1.4",
									whiteSpace: "nowrap",
									minWidth: "fit-content",
								}}
							>
								{displayedType}
							</div>
						)}
					</div> */}
				</div>

				{/* Separator */}
				<hr className="my-2" />

				{/* Bottom Section: Health Details */}
				<div className="d-flex flex-column gap-3 mt-2">
					<div>
						<span className="text-muted">Health Concerns:</span>
						<span className="ms-2 fw-medium">{patientHealthConcerns}</span>
					</div>
					<div>
						<span className="text-muted">Expectations:</span>
						<span className="ms-2 fw-medium">{patientExpectations}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CasePatientInfoCard;
