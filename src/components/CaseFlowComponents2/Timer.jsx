import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import {
	ASSESSMENT_PLAN,
	DIAGNOSTIC_TESTS,
	SOAP_NOTE,
} from "helpers/constants";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { TopBarTime } from "./TopTimerComponents";

const Timer = ({ maxTime = 5, autoEnd = () => {}, interval = 1000 }) => {
	const { setValue, getValues } = useFormContext();
	const timeTaken = useWatch({
		name: "timeTaken",
		defaultValue: 0,
	});
	const { isRecording, isPaused } = useSelector((state) => state.speech);
	const [timeAlert, setTimeAlert] = useState(false);
	const [isAutoEndNotified, setIsAutoEndNotified] = useState(false);
	const timerRef = useRef();
	const isAlertShownRef = useRef();
	const currentStationId = getValues("currentStationId");
	const { stationMap } = useSelector((state) => state.stations);
	const formTypeStations = [ASSESSMENT_PLAN, DIAGNOSTIC_TESTS, SOAP_NOTE];
	const currentStationName = stationMap?.[currentStationId]?.type || "";
	useEffect(() => {
		if (isRecording && !isPaused) {
			timerRef.current = setInterval(() => {
				if (maxTime - timeTaken <= 120 && !isAlertShownRef.current) {
					setTimeAlert(true);
					setIsAutoEndNotified(true);
					isAlertShownRef.current = true;
				}
				if (timeTaken >= maxTime) {
					clearInterval(timerRef.current);
					if (autoEnd) {
						if (formTypeStations.includes(currentStationName)) {
							autoEnd(false, currentStationName);
							return;
						}
						autoEnd(true);
					}
					return;
				}
				setValue("timeTaken", timeTaken + 1);
			}, interval);
		}

		return () => clearInterval(timerRef.current);
	}, [maxTime, isRecording, isPaused, timeTaken]);

	return (
		<>
			<UIModal
				open={timeAlert}
				handleClose={() => setTimeAlert(false)}
				width={400}
			>
				<div className="modal-content">
					<div className="d-flex justify-content-center align-items-center">
						⏳ Only 2 minutes remaining before the session ends automatically.
						Please try to complete your objectives before the timer runs out.
					</div>
					<div className="modal-footer mt-2">
						<UIButton text="Got it" onClick={() => setTimeAlert(false)} />
					</div>
				</div>
			</UIModal>
			<div
				className="d-flex align-items-center gap-2 "
				style={{
					borderRadius: "10px",
					backgroundColor: "#EAE7F466",
					padding: "5px",
					marginRight: "0.5rem",
					...(isAutoEndNotified && { color: "#ff0000" }),
				}}
			>
				<TimerOutlinedIcon
					sx={{ color: isAutoEndNotified ? "#ff0000" : "#5840BA" }}
				/>
				<span
					style={{
						fontSize: "16px",
						fontWeight: "bold",
						whiteSpace: "nowrap",
					}}
				>
					{TopBarTime(timeTaken)} / {TopBarTime(maxTime)}
				</span>
			</div>
		</>
	);
};

export default Timer;
