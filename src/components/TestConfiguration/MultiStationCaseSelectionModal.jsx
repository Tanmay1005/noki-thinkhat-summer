import {
	// FormControl,
	// FormControlLabel,
	// Radio,
	// RadioGroup,
	Typography,
} from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useSelector } from "react-redux";

export const MultiStationCaseSelectionModal = ({
	showDialog,
	setShowDialog,
	attemptDetails,
	// selectedModel,
	handleModelChange,
	getNextStation,
	createAttempt,
	caseDetails,
	loading,
}) => {
	const stationMap = useSelector((state) => state.stations?.stationMap);
	return (
		<UIModal
			open={showDialog}
			handleClose={() => {
				setShowDialog(false);
				handleModelChange("rolePlay");
			}}
			width={800}
		>
			<div className="modal-content p-2">
				<div className="modal-body">
					{attemptDetails && (
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h5 style={{ fontWeight: "bold" }}>
								{attemptDetails.status === "in progress" &&
									"Continue the Case?"}
								{attemptDetails.status === "completed" && "Retake the Case?"}
								{/* {attemptDetails.attemptDetails[0].status === "discarded" &&
                            "Retake the discarded circuit?"} */}
							</h5>
							<span style={{ textAlign: "center" }}>
								{attemptDetails.status === "in progress" && (
									<span>
										This Case is already in progress. Do you want to continue?
									</span>
								)}
								{attemptDetails.status === "completed" && (
									<span>This Case is completed. Do you want to retake?</span>
								)}
								{/* {attemptDetails.status === "discarded" && (
                                        <h5 style={{ fontWeight: "bold" }}>
                                            This Case is discarded.
                                        </h5>
                                    )} */}
							</span>
						</div>
					)}
					{!attemptDetails && (
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h5 style={{ fontWeight: "bold" }}>Start the Case?</h5>
							<span style={{ textAlign: "center" }}>
								Do you want to start the Case?
							</span>
						</div>
					)}
					{/* <div className="d-flex flex-column align-items-center">
						<h5 className="m-0 p-0 mt-2" style={{ fontWeight: "bold" }}>
							Model
						</h5>
						<FormControl>
							<RadioGroup
								row
								value={selectedModel}
								onChange={(event) => handleModelChange(event.target.value)}
							>
								<FormControlLabel
									value="rolePlay"
									control={<Radio />}
									label="Role Play"
								/>
								<FormControlLabel
									value="virtualPatient"
									control={<Radio />}
									label="Virtual Patient"
								/>
							</RadioGroup>
						</FormControl>
					</div> */}
					<div>
						{<h5>Stations</h5>}
						<ul
							className="d-grid grid-column-250"
							style={{ maxHeight: "40vh" }}
						>
							{caseDetails?.applicable_types?.map((item) => (
								<li
									className="p-1"
									key={`student-multi-station-case-page-2-${caseDetails?.id}-${item}`} // Must be unique as we are using index and case id
								>
									<Typography>{stationMap?.[item]?.type || item}</Typography>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
					<UIButton
						className={`${
							attemptDetails?.status === "in progress" && "d-none "
						} rounded rounded-pill`}
						text={"cancel"}
						onClick={() => setShowDialog(false)}
						size="medium"
						disabled={loading}
						sx={{
							width: "100%",
							textTransform: "capitalize !important",
						}}
					/>
					{attemptDetails?.status === "in progress" && (
						<UIButton
							className="rounded rounded-pill"
							text={loading ? "loading... " : "Continue"}
							onClick={() => getNextStation()}
							disabled={loading}
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					)}

					<UIButton
						className="rounded rounded-pill"
						text={
							loading
								? "loading.."
								: !attemptDetails
									? "ok"
									: (attemptDetails?.status === "in progress" &&
											"Discard & Retake") ||
										((attemptDetails?.status === "completed" ||
											attemptDetails?.status === "discarded") &&
											"Retake")
						}
						disabled={loading}
						onClick={createAttempt}
						size="medium"
						variant="contained"
						sx={{
							width: "100%",
							textTransform: "capitalize !important",
						}}
					/>
				</div>
			</div>
		</UIModal>
	);
};

export default MultiStationCaseSelectionModal;
