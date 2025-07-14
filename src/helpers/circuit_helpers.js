import {
	CREATE_ATTEMPT,
	GET_ATTEMPT_BY_CIRCUIT_ID_AND_PRACTITIONER_ID,
	GET_NEXT_CASE,
	UPDATE_ATTEMPT_BY_ID,
} from "adapters/noki_ed.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useCircuitHelpers = () => {
	const [loading, setLoading] = useState(false);
	const [nextLoader, setNextLoader] = useState(false);
	const [startCircuitLoader, setStartCircuitLoader] = useState(false);
	const [selectedCases, setSelectedCases] = useState([]);
	const [attemptDetails, setAttemptDetails] = useState({
		attemptDetails: {},
		circuitDetails: {},
	});
	const [showDialog, setShowDialog] = useState(false);
	const navigate = useNavigate();

	const handleSetSelectedCases = (checked, value) => {
		if (checked) {
			setSelectedCases((prevState) => [...prevState, value]);
			return;
		}
		const filteredSelectedCases = selectedCases.filter(
			(item) => item !== value,
		);
		setSelectedCases(filteredSelectedCases);
	};

	const findAttempt = async (
		circuit,
		practitionerId,
		attemptType = "public",
	) => {
		try {
			setLoading(true);
			const query = `practitionerId=${practitionerId}&circuitId=${circuit?.id}&attemptType=${attemptType}`;
			const response =
				await GET_ATTEMPT_BY_CIRCUIT_ID_AND_PRACTITIONER_ID(query);

			setAttemptDetails({
				attemptDetails: response?.data,
				circuitDetails: circuit,
			});

			let selectedCasesMap = [];
			if (response?.data?.[0]?.status === "in progress") {
				selectedCasesMap = response?.data?.[0]?.selected_cases
					? JSON.parse(response.data[0].selected_cases).map(
							({ stationId, caseId }) => `${stationId}/${caseId}`,
						)
					: circuit?.cases?.map(({ station_id, id }) => `${station_id}/${id}`);
				setSelectedCases(selectedCasesMap);
				return;
			}
			selectedCasesMap = circuit?.cases?.map(
				({ station_id, id }) => `${station_id}/${id}`,
			);
			setSelectedCases(selectedCasesMap);
		} catch (e) {
			console.error("Error finding attempt:", e);
		} finally {
			setShowDialog(true);
			setLoading(false);
		}
	};

	const discardAttempt = async (practitionerId, attemptType) => {
		try {
			await UPDATE_ATTEMPT_BY_ID(attemptDetails?.attemptDetails?.[0]?.id, {
				status: "discarded",
			});
			if (attemptType === "public") {
				await findAttempt(
					attemptDetails?.circuitDetails,
					practitionerId,
					attemptType,
				);
			}
		} catch (error) {
			console.error("Error discarding attempt:", error);
		}
	};

	const createAttempt = async (
		practitionerId,
		status,
		attemptType = "public",
		model = "",
	) => {
		try {
			setStartCircuitLoader(true);
			if (status === "in progress") {
				await discardAttempt(practitionerId, attemptType);
				if (attemptType === "public") {
					return;
				}
			}
			if (selectedCases?.length < 1) {
				toast.info("Please select at least one case");
				return;
			}
			const selectedCasesList = selectedCases?.map((selectedCase) => {
				const [stationId, caseId] = selectedCase.split("/");
				return { stationId, caseId };
			});
			const payload = {
				practitionerId,
				circuitId: attemptDetails?.circuitDetails?.id,
				selectedCases: selectedCasesList,
				attemptType,
			};
			const response = await CREATE_ATTEMPT(payload);
			if (response?.data) {
				await getNextCase(response?.data, "discard", attemptType, model);
			}
		} catch (error) {
			console.error("Error creating attempt:", error);
		} finally {
			if (status !== "in progress" && selectedCases?.length > 0) {
				setShowDialog(false);
			}
			setStartCircuitLoader(false);
		}
	};

	const getNextCase = async (
		data,
		way = "",
		attemptType = "public",
		_model = "",
	) => {
		const query = {
			// id: [data?.id || attemptDetails?.attemptDetails?.[0]?.id],
			circuitId: [data?.circuit_id],
			practitionerId: data?.practitioner_id,
			// status: "in progress",
			attemptType,
		};
		try {
			if (way === "continue") {
				setNextLoader(true);
			}

			const response = await GET_NEXT_CASE(query);
			const keys = Object.keys(response?.data || {});
			const lastKey = keys[keys.length - 1];
			if (!lastKey) {
				await findAttempt(
					attemptDetails?.circuitDetails,
					data?.practitioner_id,
					"public",
				);
				toast.info("Looks like admin has updated the circuit, please retake");
				return;
			}
			const { caseId, stationId } = response.data[lastKey];
			const navigationPath = `/case/${caseId}?stationId=${stationId}&attemptId=${lastKey}&osceType=circuit`;

			navigate(navigationPath, {
				state: {
					totalCases: response?.data[lastKey]?.totalCases,
					unAttemptedCase: response?.data[lastKey]?.unAttemptedCase,
					circuitId:
						attemptDetails?.circuitDetails?.id ||
						response?.data[lastKey]?.circuitId,
					circuitName:
						attemptDetails?.circuitDetails?.name ||
						response?.data[lastKey]?.name,
					attemptType,
					type: "circuit",
					navigateTo: -2,
				},
			});
		} catch (e) {
			console.error("Error getting next case:", e);
		} finally {
			setNextLoader(false);
		}
	};

	return {
		findAttempt,
		createAttempt,
		getNextCase,
		loading,
		nextLoader,
		startCircuitLoader,
		showDialog,
		setShowDialog,
		attemptDetails,
		setAttemptDetails,
		selectedCases,
		handleSetSelectedCases,
	};
};

export default useCircuitHelpers;
