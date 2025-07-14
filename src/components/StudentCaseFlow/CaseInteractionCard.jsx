// import { CREATE_ATTEMPT } from "adapters/noki_ed.service";
import UIModal from "components/ReusableComponents/UIModal";
import { imageByType } from "helpers/imageHelper";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UIButton from "../ReusableComponents/UIButton";
import UICard from "../ReusableComponents/UICard";

const CaseInteractionCard = ({ stationsList, stationIdMap }) => {
	const [showConfirmation, setShowConfirmation] = useState(false);
	const themeMode = useSelector((state) => state.app.theme);
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const navigate = useNavigate();
	// const location = useLocation();
	// const { _stationName, isMultiStationCase, multiStationCaseItem } =
	// 	location.state || {};
	// const {
	// 	findAttempt,
	// 	showDialog,
	// 	selectedModel,
	// 	setShowDialog,
	// 	handleModelChange,
	// 	attemptDetails,
	// 	getNextStation,
	// 	createAttempt,
	// 	caseDetails,
	// 	nextLoading,
	// } = useMultiStationCase("public");
	const methods = useFormContext();
	const { watch } = methods;

	const caseData = watch();
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

	const handleRolePlayClick = () => {
		// if (isMultiStationCase) {
		// 	findAttempt(multiStationCaseItem);
		// } else {
		setShowConfirmation({
			type: "rolePlay",
			station: caseData?.applicable_types?.[0],
		});
		// }
	};

	const handleVirtualPatientClick = () => {
		// if (isMultiStationCase) {
		// 	findAttempt(multiStationCaseItem);
		// } else {
		setShowConfirmation({
			type: "virtualPatient",
			station: caseData?.applicable_types?.[0],
		});
		// }
	};

	return (
		<>
			{/* <MultiStationCaseSelectionModal
				showDialog={showDialog}
				setShowDialog={setShowDialog}
				attemptDetails={attemptDetails}
				caseDetails={caseDetails}
				handleModelChange={handleModelChange}
				selectedModel={selectedModel}
				getNextStation={getNextStation}
				createAttempt={createAttempt}
				loading={nextLoading}
			/> */}
			<UIModal
				open={showConfirmation}
				handleClose={() => setShowConfirmation(false)}
				width={400}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center text-center">
							<h6 style={{ fontWeight: "bold" }}>
								{check(showConfirmation?.station?.id)
									? `Are you sure you want to retake${showConfirmation?.type === "virtualPatient" ? " with virtual patient" : " with role play"}? `
									: `Are you sure you want to proceed${showConfirmation?.type === "virtualPatient" ? " with virtual patient" : " with role play"}?`}
							</h6>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="cancel"
							onClick={() => {
								setShowConfirmation(false);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={check(showConfirmation?.station?.id) ? "Retake" : "ok"}
							onClick={() => {
								navigate(
									`/attempt${showConfirmation?.type === "virtualPatient" ? "/virtual" : ""}?caseId=${caseData?.id}&stationId=${showConfirmation?.station}&attemptId=${caseData?.attemptId}&osceType=${caseData?.osceType}`,
									{
										state: {
											totalCases: 1,
											unAttemptedCase: 1,
											type: "case",
											caseDetails: caseData,
											stationDetails: showConfirmation?.station,
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
			<UICard
				customBodyClasses={"p-0"}
				customClasses={"p-0 border-0"}
				CardBody={
					<>
						<div
							style={{
								background: CardColor2,
								padding: "15px",
								borderRadius: "10px",
							}}
						>
							<h5 className="p-2">{stationsList?.[0]?.type}</h5>
							<div className="d-flex justify-content-center align-items-center">
								<div
									className={`${imageByType("cases", caseData)}`}
									style={{
										height: "150px",
										width: "150px",
										backgroundPosition: "center",
									}}
								/>
							</div>

							<div className="p-2">
								<strong className="m-2">Case Details: </strong>
								<div
									className="editInnerHtml p-1"
									dangerouslySetInnerHTML={{
										__html: caseData?.description,
									}}
								/>
							</div>
							{/* <div>
								<div
									className="d-flex border justify-content-center align-items-center mb-3 p-1"
									style={{ borderRadius: "10px", backgroundColor: "white" }}
								>
									<div
										style={{
											fontSize: "12px",
											fontWeight: "bold",
											color: "black",
										}}
									>
										Add quiz after assessment
									</div>
									<UICheckbox
										size="large"
										checked={isQuiz}
										onChange={() => handleQuiz(isQuiz)}
										sx={{
											marginLeft: "20px",
											color: "black",
											"& .MuiSvgIcon-root": { fontSize: 20 },
										}}
									/>
								</div>
							</div> */}
							<div>
								<div
									// className={
									// 	"item d-flex gap-2 justify-content-center align-items-center w-100 flex-wrap flex-xl-nowrap"
									// }
									className="d-flex flex-column gap-2"
								>
									{check(stationsList?.[0]?.id) ? (
										<>
											{caseData?.visibility !== "private" && (
												<>
													<UIButton
														text="Retake with Role Play"
														variant="contained"
														onClick={() => {
															setShowConfirmation({
																type: "rolePlay",
																station: caseData?.applicable_types?.[0],
															});
														}}
														className="w-100 rounded-4 p-2"
													/>

													<UIButton
														text="Retake With Virtual Patient"
														variant="contained"
														onClick={() => {
															setShowConfirmation({
																type: "virtualPatient",
																station: caseData?.applicable_types?.[0],
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
													navigateToFeedbackPage(
														caseData?.applicable_types?.[0],
													)
												}
												className="w-100 rounded-4 p-2"
											/>
										</>
									) : (
										<>
											{caseData?.visibility !== "private" && (
												<UIButton
													text="Role Play"
													variant="contained"
													onClick={() => handleRolePlayClick()}
													className="w-100 rounded-4 p-2"
												/>
											)}
											<UIButton
												text="Virtual Patient"
												variant="contained"
												onClick={() => handleVirtualPatientClick()}
												className="w-100 rounded-4 p-2"
											/>
										</>
									)}
								</div>
							</div>
						</div>
					</>
				}
			/>
		</>
	);
};

export default CaseInteractionCard;
