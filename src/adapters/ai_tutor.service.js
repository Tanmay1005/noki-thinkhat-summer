import { AITutorService } from "./http";

export const GET_CHAT_SESSIONS_BY_USER_ID = async (userId) => {
	try {
		const response = await AITutorService(`/chat_sessions/user/${userId}`);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};
export const GET_CHAT_MESSAGES_BY_SESSION_ID = async (sessionId) => {
	try {
		const response = await AITutorService(
			`/chat_messages/session/${sessionId}`,
		);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const GET_ALL_TUTORS = async () => {
	try {
		const response = await AITutorService("/tutor/");
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const GET_SESSION_DETAILS_BY_ID = async (sessionId) => {
	try {
		const response = await AITutorService(`chat_sessions/${sessionId}`);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};
export const GET_TUTOR_DETAILS_BY_ID = async (tutorId) => {
	try {
		const response = await AITutorService(`tutor/${tutorId}`);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const CHAT_WITH_AI = async (payload) => {
	try {
		const response = await AITutorService.post("model/chat", payload);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const CREATE_TUTOR = async (payload) => {
	try {
		const response = await AITutorService.post("tutor/", payload);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const GET_DOCUMENT_BY_TUTOR_ID = async (tutorId) => {
	try {
		const response = await AITutorService(`documents/tutor/${tutorId}`);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const DELETE_DOCUMENT_BY_ID = async (id, payload) => {
	try {
		const response = await AITutorService.delete(`documents/${id}`, {
			data: payload,
		});
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const DOCUMENT_UPLOAD_REQUEST = async (payload) => {
	try {
		const response = await AITutorService.post(
			"documents/request-upload",
			payload,
		);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const DOCUMENT_CONFIRM_UPLOAD = async (payload) => {
	try {
		const response = await AITutorService.post(
			"documents/confirm-upload",
			payload,
		);
		return response;
	} catch (e) {
		if (e?.response?.data?.detail?.error?.includes("Uniqueness violation")) {
			throw new Error(
				"Looks like you are adding a document that already exists.",
			);
		}
		throw new Error(e);
	}
};

export const GENERATE_DOWNLOAD_URL = async (gcs_path) => {
	try {
		const response = await AITutorService(
			`documents/generate-download-url?gcs_path=${gcs_path}`,
		);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const DELETE_TUTOR_BY_ID = async (id, payload) => {
	try {
		const response = await AITutorService.delete(`tutor/${id}`, {
			data: payload,
		});
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const DELETE_CHAT_SESSION_BY_ID = async (id) => {
	try {
		const response = await AITutorService.delete(`chat_sessions/${id}`);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

// loinc-related APIs
export const GET_LOINC_CODES_WITH_AI = async (payload) => {
	try {
		const response = await AITutorService.post("model/chat-loinc", payload);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const GET_SNOMED_CODES_WITH_AI = async (payload) => {
	try {
		const response = await AITutorService.post("model/chat-loinc", payload);
		return response;
	} catch (e) {
		throw new Error(e);
	}
};

export const CASE_RAG_QUERY_BY_TYPE = async (type, payload) => {
	try {
		const response = await AITutorService.post(`query?type=${type}`, payload);
		return response;
	} catch (error) {
		throw new Error(error);
	}
};
