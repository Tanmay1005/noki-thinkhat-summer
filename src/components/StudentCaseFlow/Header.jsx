import Timer from "components/CaseFlowComponents2/Timer";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";
import Actions from "./Actions";

const Header = ({
	handlePauseRecording,
	handleResumeRecording,
	handleStopRecording,
}) => {
	const { setValue, getValues } = useFormContext();
	const [alert, setAlert] = useState(false);
	const { stationMap } = useSelector((state) => state?.stations);
	const navigate = useNavigate();
	const caseName = useWatch({
		name: "caseName",
	});
	const currentStationId = useWatch({
		name: "currentStationId",
	});
	const { isRecording } = useSelector((state) => state.speech);
	const handleNavigation = () => {
		if (isRecording) {
			setAlert(true);
			return;
		}
		navigate(-1);
	};
	const handleDiscard = async () => {
		await handleStopRecording();
		const ehrData = getValues("studentCurrentEHRData");
		setValue("timeTaken", 0);
		setValue("student", {
			Current_Encounter_EHR: ehrData,
			expertApproach: {
				differentials: [],
				diagnostics: [],
				finalDiagnosis: {
					value: "",
				},
				PETests: [],
			},
			notes: "",
			differentials: [],
			OLDCARTS: [],
		});
		setValue("activePE", {});
		navigate(-1);
	};
	const maxTime = stationMap?.[currentStationId]?.time_limit * 60;
	return (
		<>
			<UIModal open={alert} handleClose={() => setAlert(false)} width={400}>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h6 style={{ fontWeight: "bold" }}>
								Are you sure you want to go back?
							</h6>
							<span style={{ textAlign: "center" }}>
								This action will no longer save the case, Do you really want to
								go back?
							</span>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="cancel"
							onClick={() => setAlert(false)}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text="ok"
							variant="contained"
							onClick={handleDiscard}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<div className="d-flex p-2 justify-content-between align-items-center">
				<div
					className="d-flex gap-1 align-items-center"
					style={{ color: "#5840BA" }}
				>
					<img
						src={GoBackIcon}
						alt="loading.."
						onClick={handleNavigation}
						onKeyUp={handleNavigation}
						style={{ cursor: "pointer" }}
					/>
					<div style={{ fontSize: "1rem" }} className="fw-bold">
						{caseName}
					</div>
				</div>
				<div className="d-flex gap-2 align-items-center">
					<Timer maxTime={maxTime} autoEnd={handleStopRecording} />
					<Actions
						handlePauseRecording={handlePauseRecording}
						handleResumeRecording={handleResumeRecording}
						handleStopRecording={handleStopRecording}
					/>
				</div>
			</div>
		</>
	);
};

export default Header;
