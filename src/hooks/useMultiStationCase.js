import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
	CREATE_MULTI_STATION_ATTEMPT,
	FIND_MULTI_STATION_ATTEMPT,
	GET_NEXT_STATION,
	UPDATE_MULTI_STATION_ATTEMPT,
} from "../adapters/noki_ed.service";

const useMultiStationCase = (attemptType) => {
	const [attemptDetails, setAttemptDetails] = useState({});
	const [showDialog, setShowDialog] = useState(false);
	const [caseDetails, setCaseDetails] = useState(null);
	const [selectedModel, setSelectedModel] = useState("rolePlay");
	const [nextLoading, setNextLoading] = useState(false);
	const auth = useSelector((state) => state?.auth?.personData);
	const navigate = useNavigate();
	const findAttempt = async (item) => {
		try {
			setCaseDetails(item);
			const response = await FIND_MULTI_STATION_ATTEMPT({
				caseId: item?.id,
				practitionerId: auth?.fhir_practitioner_id,
				attemptType,
			});
			setAttemptDetails(response?.data?.data?.[0]);
		} catch (error) {
			console.error("Error in finding Attempt: ", error);
		} finally {
			setShowDialog(true);
		}
	};
	const discardAttempt = async () => {
		try {
			await UPDATE_MULTI_STATION_ATTEMPT(attemptDetails?.id, {
				status: "discarded",
			});
		} catch (error) {
			console.error("Error in discarding Attempt: ", error);
		}
	};
	const createAttempt = async () => {
		try {
			setNextLoading(true);
			const practitionerId = auth?.fhir_practitioner_id;
			if (attemptDetails?.status === "in progress") {
				await discardAttempt(practitionerId, attemptType);
			}
			const payload = {
				practitioner_id: practitionerId,
				case_id: caseDetails?.id,
				selected_stations: caseDetails?.applicable_types,
				attempt_type: attemptType,
				status: "in progress",
			};
			const response = await CREATE_MULTI_STATION_ATTEMPT(payload);
			if (response?.data) {
				setAttemptDetails(response?.data);
				await getNextStation(response?.data?.id);
			}
		} catch (error) {
			console.error("Error in creating Attempt: ", error);
		} finally {
			setShowDialog(false);
			setNextLoading(false);
		}
	};
	const handleModelChange = (value) => {
		setSelectedModel(value);
	};
	const getNextStation = async (id, _model, attempt_type = attemptType) => {
		try {
			setNextLoading(true);
			const response = await GET_NEXT_STATION({
				attemptId: id || attemptDetails?.id,
				attemptType: attempt_type,
			});
			if (response?.data) {
				const { caseId, stationId } = response.data;
				const path = `/case/${caseId}?stationId=${stationId}&attemptId=${id || attemptDetails?.id}&osceType=multi`;
				navigate(path);
			}
		} catch (error) {
			console.error("Error in finding next Station: ", error);
		} finally {
			setNextLoading(false);
		}
	};
	return {
		findAttempt,
		attemptDetails,
		selectedModel,
		showDialog,
		caseDetails,
		setShowDialog,
		handleModelChange,
		getNextStation,
		createAttempt,
		nextLoading,
	};
};
export default useMultiStationCase;
