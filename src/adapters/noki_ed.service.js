import { HTTPNokiEDService } from "./http";

export const GET_CIRCUITS_LIST = async (params) => {
	try {
		const response = await HTTPNokiEDService("circuits", { params });
		return response;
	} catch (e) {
		console.error(e);
	}
};
export const GET_CIRCUITS_DETAILS = async (params) => {
	try {
		const response = await HTTPNokiEDService("allCircuitDetails", { params });
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const DELETE_CIRCUIT_BY_ID = async (circuit_id, payload) => {
	try {
		const response = await HTTPNokiEDService.delete(`circuits/${circuit_id}`, {
			data: payload,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_STATIONS_LIST = async () => {
	try {
		const response = await HTTPNokiEDService("stations");
		return response;
	} catch (e) {
		console.error(e);
	}
};
export const GET_STATIONS_LIST_ONLY_ATTACHED = async (id) => {
	try {
		const response = await HTTPNokiEDService(`getunattachedstations/${id}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_STATIONS_LIST_BY_CIRCUIT = async (ID) => {
	try {
		const response = await HTTPNokiEDService(`stationsByCircuit/${ID}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_STATION_DETAILS_BY_ID = async (query) => {
	try {
		const response = await HTTPNokiEDService(`stationDetails${query}`);
		return response?.data;
	} catch (e) {
		console.error(e);
	}
};

export const GET_STATION_BY_ID = async (query) => {
	try {
		const response = await HTTPNokiEDService(`stations${query}`);
		return response?.data;
	} catch (e) {
		console.error(e);
	}
};

export const UPDATE_STATION_BY_ID = async (stationId, payload) => {
	try {
		const response = await HTTPNokiEDService.put(`stations${stationId}`, {
			...payload,
		});
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const GET_CIRCUIT_BY_ID = async (query) => {
	try {
		const response = await HTTPNokiEDService(`circuitDetails${query}`);
		return response?.data;
	} catch (e) {
		console.error(e);
	}
};

export const GET_CASE_AND_SCORE_BY_ID = async (query) => {
	try {
		const response = await HTTPNokiEDService(`/case_scores/case${query}`);
		return response?.data;
	} catch (e) {
		console.error(e);
	}
};

export const UPDATE_CASE_SCORE_BY_ID = async (questionnaire_id, payload) => {
	try {
		const response = await HTTPNokiEDService.put(
			`/caseScore/${questionnaire_id}`,
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_CASE_LIST = async (params) => {
	try {
		const response = await HTTPNokiEDService("cases", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_CASE_BY_STATION_TYPE = async (params) => {
	try {
		const response = await HTTPNokiEDService("casesbystationtype", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CREATE_CIRCUIT_WITH_BULK_CASES = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("circuit_station_case/bulk", {
			...payload,
		});
		return response;
	} catch (_e) {
		throw new Error("Something went wrong!");
	}
};

export const GET_CASE_LIST_BY_CIRCUIT_STATION = async ({
	circuit_id,
	station_id,
}) => {
	try {
		const response = await HTTPNokiEDService(
			`casesByStationAndCircuit/${circuit_id}/${station_id}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_CASE_LIST_BY_CIRCUIT_AND_STATION_IDS = async (
	circuit_id,
	station_id,
) => {
	try {
		const response = await HTTPNokiEDService(
			`casesByStationAndCircuit/${circuit_id}/${station_id}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const UNLINKED_CASES = async (circuit_id, station_id, stationType) => {
	try {
		const response = await HTTPNokiEDService(
			`unlinkedcases/${circuit_id}/${station_id}/${stationType}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const LINK_CASES = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("circuit_station_case", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CREATE_CIRCUITS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("circuits", { ...payload });
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const UPDATE_CIRCUIT = async (circuitId, payload) => {
	try {
		const response = await HTTPNokiEDService.put(`circuits/${circuitId}`, {
			...payload,
		});
		return response;
	} catch (error) {
		throw new Error(error?.response?.data?.error || error.message);
	}
};

export const CREATE_STATIONS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("stations", { ...payload });
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CREATE_CASE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("fhir/integratedCase", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
		return Promise.reject(e);
	}
};

export const ATTACH_STATION = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("circuit_station", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const ATTACH_CASE = async ({ station_id, case_id }) => {
	try {
		const response = await HTTPNokiEDService.post(`cases/${case_id}`, {
			station_id,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const DETTACH_STATION = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete(
			`circuit_station/${payload.circuit_id}/${payload.station_id}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const DETTACH_CASE = async ({ circuit_id, station_id, case_id }) => {
	try {
		const response = await HTTPNokiEDService.delete(
			`circuit_station_case/${circuit_id}/${station_id}/${case_id}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GENERATE_SCORE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("case_scores", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CREATE_TRANSCRIPTS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("transcripts", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const UPDATE_TRANSCRIPTS = async (transcript_id) => {
	try {
		const response = await HTTPNokiEDService(`transcripts/${transcript_id}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_TRANSCRIPTS = async (transcript_id) => {
	try {
		const response = await HTTPNokiEDService(`transcripts/${transcript_id}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CASE_DETAILS = async (case_id) => {
	try {
		const response = await HTTPNokiEDService(`cases/${case_id}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_STATIONS_BY_CASE_ID = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("stationByTypes", {
			types: payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const DELETE_CASES_BULK = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete(
			"circuit_station_case/bulk",
			{ data: payload },
		);
		return response;
	} catch (e) {
		throw new Error(e.message || "Failed to Remove");
	}
};

export const ADD_CASES_BULK = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("circuit_station_case/bulk", {
			...payload,
		});
		return response;
	} catch (e) {
		throw new Error(e.message || "Failed to Remove");
	}
};
export const GET_RANDOM_FLASH_CARDS = async (limit = 5) => {
	try {
		const response = await HTTPNokiEDService.get(
			`randomFlashCards?limit=${limit}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_USERS_WITH_ATTEMPTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("get_users_with_attempts", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_USER_BY_UID = async (id) => {
	try {
		const response = await HTTPNokiEDService.get(`userByFirebaseId/${id}`);
		return response;
	} catch (e) {
		throw new Error(e.message || "Failed to retriever user information");
	}
};

export const GET_USERS_LIST = async () => {
	try {
		const response = await HTTPNokiEDService.get("userslist");
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_USER_BY_ID = async (id) => {
	try {
		const response = await HTTPNokiEDService.get(`users/${id}`);
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const GET_USERS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("searchUser", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};
export const CREATE_USER = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("users", payload);
		return response;
	} catch (e) {
		const error = new Error(
			e?.response?.data?.error ||
				e?.response?.data?.errors?.[0]?.message ||
				e.message,
		);
		error.details = payload;
		throw error;
	}
};
export const GET_RANDOM_QUIZ = async (payload) => {
	try {
		const response = await HTTPNokiEDService.get("randomQuiz", payload);
		return response;
	} catch (e) {
		throw new Error(e.message);
	}
};

export const GET_INTEGRATED_CASE = async (case_id, params) => {
	try {
		const response = await HTTPNokiEDService.get(
			`fhir/integratedCase/${case_id}`,
			{
				params,
			},
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_INTEGRATED_CASE_BY_PATIENT_ID = async (patient_id) => {
	try {
		const response = await HTTPNokiEDService.get(
			`fhir/integratedCase/patient/${patient_id}`,
		);
		return response;
	} catch (e) {
		throw new Error(e.message);
	}
};

export const GET_ALL_ATTEMPTS = async (
	practitionerId,
	query = "&status=in-progress&type=User Progress",
) => {
	try {
		const response = await HTTPNokiEDService.get(
			`fhirSearch?resourceType=Encounter&participant=Practitioner/${practitionerId}${query}`,
		);
		return response?.data;
	} catch (e) {
		console.error(e);
	}
};

export const GET_RECOMMENDED_CASES = async (query) => {
	try {
		const response = await HTTPNokiEDService(`randomCases?${query}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CREATE_BULK_QUIZ = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("quiz/bulk/create", payload);
		return response;
	} catch (e) {
		console.error(e);
		return Promise.reject(e);
	}
};

export const CREATE_CASE_SCORE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("caseScore", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_CASE_SCORE_BY_ID = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("caseScore", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const UPDATE_BULK_QUIZ = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("quiz/bulk/update", payload);
		return response;
	} catch (e) {
		console.error(e);
		return Promise.reject(e);
	}
};

export const DELETE_BULK_QUIZ = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete("quiz/bulk/delete", {
			data: payload,
		});
		return response;
	} catch (e) {
		console.error("Error during DELETE_BULK_QUIZ:", e);
		return Promise.reject(e);
	}
};

export const UPDATE_CASE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"fhir/integratedCase/update",
			{
				...payload,
			},
		);
		return response;
	} catch (e) {
		console.error(e);
		return Promise.reject(e);
	}
};

export const GET_NEXT_CASE = async (query) => {
	try {
		const response = await HTTPNokiEDService("nextCase", { params: query });
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_ATTEMPT_BY_CIRCUIT_ID_AND_PRACTITIONER_ID = async (query) => {
	try {
		const response = await HTTPNokiEDService.get(`getAttempt?${query}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const CREATE_ATTEMPT = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("attempts", {
			...payload,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_ATTEMPT_BY_ID = async (attempt_id) => {
	try {
		const response = await HTTPNokiEDService.get(`attempts/${attempt_id}`);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const UPDATE_ATTEMPT_BY_ID = async (attempt_id, payload) => {
	try {
		const response = await HTTPNokiEDService.put(
			`attempts/${attempt_id}`,
			payload,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};
//not in use
export const GET_ATTEMPT_BY_CIRCUIT_ID = async (circuit_id) => {
	try {
		const response = await HTTPNokiEDService.get(
			`getAttemptsByCircuit/${circuit_id}`,
		);
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const RECENT_PRACTICES = async (params) => {
	try {
		const response = await HTTPNokiEDService("recentPractices", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const ALL_PRACTICES = async (params) => {
	try {
		const response = await HTTPNokiEDService("allPractices", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const REQUEST_PASSWORD_RESET = async (tenantId, payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			`/password-reset/${tenantId}/request`,
			{
				...payload,
			},
		);
		return response;
	} catch (_e) {
		throw new Error("Something went wrong!");
	}
};

export const GET_CASE_BY_QUESTIONNAIRE = async (params) => {
	try {
		const response = await HTTPNokiEDService("getCaseByQuestionnaire", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_CASE_BY_PATIENT = async (params) => {
	try {
		const response = await HTTPNokiEDService("getCaseByPatient", {
			params,
		});
		return response;
	} catch (e) {
		console.error(e);
	}
};

export const GET_ALL_USER_GROUPS = async () => {
	try {
		const response = await HTTPNokiEDService.get("userGroups");
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const CREATE_USER_GROUPS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("userGroups", {
			...payload,
		});
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const DELETE_USER_GROUP = async (group_id, payload) => {
	try {
		const response = await HTTPNokiEDService.delete(`userGroups/${group_id}`, {
			data: payload,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const UPDATE_USER_GROUP = async (payload) => {
	try {
		const response = await HTTPNokiEDService.put("userGroups", {
			...payload,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const GET_USER_BY_GROUP_ID = async (group_id) => {
	try {
		const response = await HTTPNokiEDService.get(`userByGroupId/${group_id}`);
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const GET_ALL_USER_GROUP_ASSIGNMENTS = async () => {
	try {
		const response = await HTTPNokiEDService.get("userGroupAssignments");
		return response;
	} catch (error) {
		console.error(error);
	}
};
export const CREATE_USER_GROUP_ASSIGNMENTS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("userGroupAssignments", {
			...payload,
		});
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const CREATE_USER_GROUP_ASSIGNMENTS_BULK = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"userGroupAssignmentsBulk",
			payload,
		);
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const DELETE_USER_GROUP_ASSIGNMENTS_BULK = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete(
			"deleteUserGroupAssignmentsBulk",
			{ data: payload },
		);
		return response;
	} catch (error) {
		console.error(error);
		return error;
	}
};

export const GET_ASSIGNED_TEST_ASSIGNMENTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("tests", { params });
		return response;
	} catch (error) {
		console.error(error);
		return error;
	}
};

export const GET_TEST_ASSIGNMENT_BY_CIRCUIT_ID = async (circuitId) => {
	try {
		const response = await HTTPNokiEDService.get(`tests/${circuitId}`);
		return response;
	} catch (error) {
		console.error(error);
		return error;
	}
};

export const CREATE_TEST_ASSIGNMENTS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"createTestAssignments",
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const CREATE_OR_UPDATE_TEST_ASSIGNMENTS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"bulk/testAssignments",
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const DELETE_TEST_ASSIGNMENT_BY_ID = async (circuit_id) => {
	try {
		const response = await HTTPNokiEDService.delete(
			`testAssignments/${circuit_id}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const UPDATE_USER = async (payload) => {
	try {
		const response = await HTTPNokiEDService.put("updateUser", { payload });
		return response;
	} catch (e) {
		console.error(e);
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const DEACTIVATE_USER = async (user_id) => {
	try {
		const response = await HTTPNokiEDService.put("deactivateUser", {
			user_id,
		});
		return response;
	} catch (e) {
		console.error(e);
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const ACTIVATE_USER = async (user_id) => {
	try {
		const response = await HTTPNokiEDService.put("activateUser", {
			user_id,
		});
		return response;
	} catch (e) {
		console.error(e);
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_ALL_FLASH_CARDS = async (query) => {
	try {
		const response = await HTTPNokiEDService.get(`allFlashCards?${query}`);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const ADD_FLASH_CARDS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("bulk/flashCards", payload);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const DELETE_BULK_FLASH_CARDS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete("flashCards", {
			data: payload,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const UPDATE_FLASH_CARDS = async ({ id, payload }) => {
	try {
		const response = await HTTPNokiEDService.post(`flashCards/${id}`, payload);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_QUIZ_BY_ID = async (id) => {
	try {
		const response = await HTTPNokiEDService.get(`quiz/${id}`);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_QUIZ_LIST = async (query) => {
	try {
		const response = await HTTPNokiEDService.get(`allQuiz?${query}`);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const DELETE_QUIZ_QUESTION_BY_ID = async (quizId) => {
	try {
		const response = await HTTPNokiEDService.delete(`quiz/${quizId}`);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const DELETE_BULK_QUIZ_QUESTIONS = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete("quiz/bulk/delete", {
			data: {
				recordIds: payload,
			},
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const UPDATE_QUIZ_SCORE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("userQuizScore", payload);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_ATTEMPTED_CASES = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("getAttemptedCases", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_TODO_ASSIGNMENTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("assignments/toDo", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_INPROGRESS_ASSIGNMENTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("assignments/inProgress", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_OVERDUE_ASSIGNMENTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("assignments/overdue", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};
export const GET_COMPLETED_CASE_ASSIGNMENTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("assignments/case/completed", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};
export const GET_COMPLETED_MULTI_STATION_CASE_ASSIGNMENTS = async (params) => {
	try {
		const response = await HTTPNokiEDService.get(
			"assignments/multiStationCase/completed",
			{
				params,
			},
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};
export const SEND_FORGET_PASSWORD_LINK = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"password-reset/request",
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const CHECK_TOKEN_VERIFY = async ({ token }) => {
	try {
		const response = await HTTPNokiEDService.post(
			`password-reset/verify/${token}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};
export const CREATE_NEW_PASSWORD = async ({ token, payload }) => {
	try {
		const response = await HTTPNokiEDService.post(
			`password-reset/confirm/${token}`,
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};
export const FIND_MULTI_STATION_ATTEMPT = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("multiStationCaseAttempt", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const CREATE_MULTI_STATION_ATTEMPT = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"multiStationCaseAttempt",
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const UPDATE_MULTI_STATION_ATTEMPT = async (attemptId, payload) => {
	try {
		const response = await HTTPNokiEDService.put(
			`multiStationCaseAttempt/${attemptId}`,
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_NEXT_STATION = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("nextStation", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const UPLOAD_FILE_FOR_INTEGRATED_CASE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post(
			"fhir/integratedCase/file",
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const DELETE_FILE_FOR_INTEGRATED_CASE = async (payload) => {
	try {
		const response = await HTTPNokiEDService.delete(
			"fhir/integratedCase/file",
			{
				data: { ...payload },
			},
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

export const GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID = async (id) => {
	try {
		const response = await HTTPNokiEDService.get(
			`fhir/integratedCase/file/${id}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

/**
 * Mark notifications as read
 * @param {Array<{id: string, target: string, target_id?: string}>} notifications
 * @returns {Promise}
 */
export const MARK_NOTIFICATIONS_AS_READ = async (notifications) => {
	try {
		const response = await HTTPNokiEDService.post(
			"/notifications/mark-as-read",
			notifications,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};

/**
 * Fetch old notifications with filter, pagination, etc.
 * @param {Object} filter - { target, type, page, pageSize }
 * @param {Object} [headers] - Optional headers to include in the request
 * @returns {Promise}
 */
export const GET_OLD_NOTIFICATIONS = async (filter) => {
	try {
		const response = await HTTPNokiEDService.get("/notifications/filter", {
			params: filter,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e.message);
	}
};
export const UPLOAD_FILE_WITH_UUID = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("file", payload);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const GET_ALL_FILE_USING_FILEID = async (fileid, type) => {
	try {
		const response = await HTTPNokiEDService.get(
			`file/bulk?fileId=${fileid}&type=${type}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const DELETE_ALL_FILE_USING_FILEID = async (fileid, type) => {
	try {
		const response = await HTTPNokiEDService.delete(
			`file/bulk?fileId=${fileid}&type=${type}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const DELETE_SINGLE_FILE_USING_FILEID = async (fileid, type, name) => {
	try {
		const response = await HTTPNokiEDService.delete(
			`file/single?fileId=${fileid}&type=${type}&name=${name}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const GET_SINGLE_FILE_USING_FILEID = async (fileid, type, name) => {
	try {
		const response = await HTTPNokiEDService.get(
			`file/single?fileId=${fileid}&type=${type}&name=${name}`,
		);
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const GET_PE_DATA = async () => {
	try {
		const response = await HTTPNokiEDService.get("external/peTests");
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};
export const GET_LOINC_DATA_BY_FILTER = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("external/searchLoinc", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};
export const GET_SNOMED_DATA_BY_FILTER = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("external/searchSnomed", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};

export const GET_OBSERVATION = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("observation", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};
export const GET_ENCOUNTER = async (params) => {
	try {
		const response = await HTTPNokiEDService.get("encounter", {
			params,
		});
		return response;
	} catch (e) {
		throw new Error(e?.response?.data?.error || e?.message);
	}
};
export const CREATE_REQUEST_EXTENSION = async (payload) => {
	try {
		const response = await HTTPNokiEDService.post("assignments/extension", {
			...payload,
		});
		return response;
	} catch (error) {
		console.error("Extension Request Failed:", error);
		throw new Error("Something went wrong while requesting extension!");
	}
};

export const UPDATE_REQUEST_EXTENSION = async (payload) => {
	try {
		const response = await HTTPNokiEDService.put("assignments/extension", {
			...payload,
		});
		return response;
	} catch (error) {
		console.error("Extension Request Update Failed:", error);
		throw new Error("Something went wrong while updating extension request!");
	}
};
