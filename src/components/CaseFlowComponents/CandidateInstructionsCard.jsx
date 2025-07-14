// import { CREATE_ATTEMPT } from "adapters/noki_ed.service";
import UIModal from "components/ReusableComponents/UIModal";
import { imageByType } from "helpers/imageHelper";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import UIButton from "../ReusableComponents/UIButton";
import UICard from "../ReusableComponents/UICard";
// import UICheckbox from "../ReusableComponents/UICheckbox";

const CandidateInstructionsCard = ({
	caseDetails,
	isQuiz,
	// handleQuiz,
	stationsList,
	stationIdMap,
}) => {
	const [showDialog, setShowDialog] = useState(false);
	const themeMode = useSelector((state) => state.app.theme);
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const navigate = useNavigate();
	const location = useLocation();

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
						<div className="d-flex flex-column justify-content-center align-items-center text-center">
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
									className={`${imageByType("cases", caseDetails)}`}
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
										__html: caseDetails?.description,
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
					</>
				}
			/>
		</>
	);
};

export default CandidateInstructionsCard;
