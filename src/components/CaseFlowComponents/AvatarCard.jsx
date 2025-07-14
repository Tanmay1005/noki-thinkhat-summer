import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { calculateAge } from "helpers/common_helper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
// import { useNavigate, useParams } from "react-router-dom";
import virtualAvatar from "../../assets/Case_tabs_image/virtualAvatar.svg";
// import UIButton from "../ReusableComponents/UIButton";
import UICard from "../ReusableComponents/UICard";
// import UICheckbox from "../ReusableComponents/UICheckbox";

const AvatarDetails = ({ patientData, CardColor }) => (
	<div
		className="mobile-visible col-8"
		style={{
			backgroundColor: CardColor,
			borderRadius: "10px",
			marginBottom: "0px",
		}}
	>
		<div>
			<strong>Name:</strong> {patientData?.name[0]?.text || "N/A"}
		</div>
		<div>
			<strong>Age:</strong> {calculateAge(patientData?.birthDate) || "N/A"}
		</div>
		<div style={{ textTransform: "capitalize" }}>
			<strong>Gender:</strong> {patientData?.gender || "N/A"}
		</div>
		<div>
			<strong>Birth Date:</strong> {patientData?.birthDate || "N/A"}
		</div>{" "}
	</div>
);

const MobileAvatar = () => (
	<div className="col-4  d-flex justify-content-center align-items-center">
		<img
			src={virtualAvatar}
			alt="Avatar"
			style={{
				width: "100%",
				objectFit: "contain",
			}}
		/>
	</div>
);

// const AddQuizCheckbox = ({ isChecked, handleCheckboxChange }) => (
// 	<div
// 		className="d-flex justify-content-center align-items-center mb-2 p-1"
// 		style={{ borderRadius: "10px", backgroundColor: "#fff" }}
// 	>
// 		<div
// 			style={{
// 				fontSize: "10px",
// 				fontWeight: "bold",
// 				color: "black",
// 			}}
// 		>
// 			Add quiz after assessment
// 		</div>
// 		<UICheckbox
// 			size="large"
// 			checked={isChecked}
// 			onChange={() => handleCheckboxChange(isChecked)}
// 			sx={{
// 				marginLeft: "20px",
// 				color: "black",
// 				"& .MuiSvgIcon-root": { fontSize: 15 },
// 			}}
// 		/>
// 	</div>
// );

const AvatarCard = ({
	caseDetails,
	isQuiz,
	// handleQuiz,
	stationsList,
	stationIdMap,
}) => {
	const [patientData, setPatientData] = useState(null);
	const themeMode = useSelector((state) => state.app.theme);
	const CardColor1 = themeMode === "dark" ? "#201F48" : "#F6F6F6";
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const [showDialog, setShowDialog] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const data = caseDetails?.fhirPatient;
		if (data) {
			setPatientData(data);
		}
	}, [caseDetails?.fhirPatient]);

	const check = (id) => {
		if (stationIdMap && id in stationIdMap) {
			return true;
		}
		return false;
	};

	const navigateToFeedbackPage = (id) => {
		navigate(`/feedback?scoreId=${stationIdMap[id]}`, {
			state: { navigateTo: -1 },
		});
	};

	return (
		<>
			<UIModal
				open={showDialog}
				handleClose={() => setShowDialog(false)}
				width={400}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column text-center justify-content-center align-items-center">
							<h6 style={{ fontWeight: "bold" }}>
								{check(showDialog?.station?.id)
									? `Are you sure you want to retake${showDialog?.type === "virtualPatient" ? " with virtual patient" : " with role play"}? `
									: `Are you sure you want to proceed${showDialog?.type === "virtualPatient" ? " with virtual patient" : " with role play"}?`}
							</h6>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="cancel"
							onClick={() => {
								setShowDialog(false);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={check(showDialog?.station?.id) ? "Retake" : "ok"}
							onClick={() => {
								navigate(
									`/attempt${showDialog?.type === "virtualPatient" ? "/virtual" : ""}?caseId=${caseDetails?.id}&stationId=${showDialog?.station?.id}&quiz=${isQuiz}`,
									{
										state: {
											totalCases: 1,
											unAttemptedCase: 1,
											type: "case",
											caseDetails: caseDetails,
											stationDetails: showDialog?.station,
											navigateTo: -2,
										},
									},
								);
							}}
							variant="contained"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>

			<div
				className="p-0 m-0"
				style={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Desktop View - Avatar Image */}
				<UICard
					customBodyClasses="p-0"
					customClasses="p-0 border-0 d-none d-md-block"
					CardBody={
						<div
							className="card-color-1"
							style={{
								flex: "1 0 auto",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: CardColor1,
								padding: "10px",
								borderRadius: "10px",
							}}
						>
							<img
								src={virtualAvatar}
								alt="Avatar"
								style={{
									maxHeight: "100%",
									maxWidth: "100%",
									objectFit: "contain",
								}}
							/>
						</div>
					}
				/>

				<UICard
					customBodyClasses="p-0 rounded-lg "
					customClasses="p-0 border-0 d-block d-md-none"
					CardBody={
						<div
							className="d-flex flex-column align-items-center"
							style={{
								backgroundColor: CardColor2,
								borderRadius: "10px",
							}}
						>
							<div
								className=" d-flex flex-row  justify-content-between align-items-center"
								style={{
									borderRadius: "10px",
								}}
							>
								<MobileAvatar />
								<AvatarDetails
									CardColor={CardColor2}
									patientData={patientData}
								/>
							</div>
							<div className="col-12 d-md-none border-top py-3 px-4">
								{/* <AddQuizCheckbox
									isChecked={isQuiz}
									handleCheckboxChange={handleQuiz}
								/> */}
								<div
									className={
										"item d-flex gap-2 justify-content-center align-items-center w-100 flex-md-wrap flex-wrap flex-sm-nowrap"
									}
								>
									{check(stationsList?.[0]?.id) ? (
										<>
											{location?.state?.visibility !== "private" && (
												<>
													<UIButton
														text="Retake with Role Play"
														variant="contained"
														onClick={() => {
															setShowDialog({
																type: "rolePlay",
																station: stationsList?.[0],
															});
														}}
														className="w-100 rounded-4 p-2"
													/>

													<UIButton
														text="Retake With Virtual Patient"
														variant="contained"
														onClick={() => {
															setShowDialog({
																type: "virtualPatient",
																station: stationsList?.[0],
															});
														}}
														className="w-100 rounded-4 p-2"
													/>
												</>
											)}
											<UIButton
												text="View Results"
												variant="outlined"
												onClick={() =>
													navigateToFeedbackPage(stationsList?.[0]?.id)
												}
												className="w-100 rounded-4 p-2"
											/>
										</>
									) : (
										<>
											{location?.state?.visibility !== "private" && (
												<UIButton
													text="Role Play"
													variant="contained"
													onClick={() => {
														setShowDialog({
															type: "rolePlay",
															station: stationsList?.[0],
														});
													}}
													className="w-100 rounded-4 p-2"
												/>
											)}
											<UIButton
												text="Virtual Patient"
												variant="contained"
												onClick={() => {
													setShowDialog({
														type: "virtualPatient",
														station: stationsList?.[0],
													});
												}}
												className="w-100 rounded-4 p-2"
											/>
										</>
									)}
								</div>
							</div>
						</div>
					}
				/>
			</div>
		</>
	);
};

export default AvatarCard;
