import axios from "axios";
import { jwtDecode } from "jwt-decode";
import _ from "lodash";
import { auth } from "../firebase-setup";
import { FHIR_METHODS } from "./adapter_constants";

const generateInterceptors = (AxiosInstance) => {
	AxiosInstance.interceptors.request.use(
		async (config) => {
			const token = localStorage.getItem("jwtToken");
			if (token) {
				const jwtPayload = jwtDecode(token);
				config.headers.Authorization = `Bearer ${token}`;
				config.headers["x-enliv-tenant-id"] = jwtPayload?.firebase?.tenant;
				// config.headers["ngrok-skip-browser-warning"] = "test";
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		},
	);

	AxiosInstance.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error?.config;
			if (error?.response?.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;
				try {
					const user = auth?.currentUser;
					if (user) {
						const token = await user.getIdToken(true);
						localStorage.setItem("jwtToken", token);
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return AxiosInstance(originalRequest);
					}
				} catch (_err) {}
			}
			return Promise.reject(error);
		},
	);
};

const generateMetaInterceptors = (AxiosInstance) => {
	AxiosInstance.interceptors.request.use(
		async (config) => {
			const token = localStorage.getItem("jwtToken");
			if (token) {
				const jwtPayload = jwtDecode(token);
				config.headers.Authorization = `Bearer ${token}`;
				config.headers["x-enliv-tenant-id"] = jwtPayload?.firebase?.tenant;
				config.headers["x-hasura-role"] = "admin";
				config.headers["x-hasura-admin-secret"] =
					"c042293c-7ae1-43c5-bda1-fc3519f5fac2";
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		},
	);
};

const HTTPRequest = axios.create({
	baseURL: process.env.REACT_APP_API_URL,
});

generateInterceptors(HTTPRequest);

export const HTTPAidaBaseService = axios.create({
	baseURL: process.env.REACT_APP_AIDA_SERVICE_URL,
});

export const HTTPNokiEDService = axios.create({
	baseURL: `${process.env.REACT_APP_NOKI_ED_BASE_SERVICE_URL}/api/`,
});

export const AITutorService = axios.create({
	baseURL: `${process.env.REACT_APP_AI_TUTOR_SERVICE_URL}/api/`,
});

generateInterceptors(HTTPNokiEDService);
generateInterceptors(HTTPAidaBaseService);
generateInterceptors(AITutorService);

const HTTPRequestUnauthenticated = axios.create({
	baseURL: process.env.REACT_APP_API_URL,
});

const FHIRSearch = (module, params) => {
	return HTTPRequest.get(`fhir/search/${module}${params ? `?${params}` : ""}`);
};

const FHIRSave = (action, data) => {
	if (action === "executeBundle") {
		return HTTPRequest?.post("fhir/" + "executeBundle", data);
	}
	const methodIdx = FHIR_METHODS.findIndex((f) => f.TYPE === action);
	if (methodIdx < 0) {
		console.error(
			`API Call Failed --> Please check if ${action} is a valid action.`,
		);
		return false;
	}
	return HTTPRequest?.[_.lowerCase(action)](
		`fhir/${FHIR_METHODS[methodIdx].RESOURCE}`,
		data,
	);
};

const FHIRDelete = (resourceType, resourceId) => {
	return HTTPRequest?.delete(
		`fhir/deleteResource?resourceType=${resourceType}&resourceId=${resourceId}`,
	);
};

const NokiService = (action, url, data) => {
	return HTTPAidaBaseService?.[_.lowerCase(action)](url, data);
};

const HTTPMetadata = (action, module, params, payload = {}) => {
	const token = localStorage.getItem("jwtToken");
	let jwtPayload = {};
	if (token) jwtPayload = jwtDecode(token);
	const MetaHTTPRequest = axios.create({
		baseURL: process.env.REACT_APP_API_URL,
	});
	generateMetaInterceptors(MetaHTTPRequest);
	return MetaHTTPRequest?.[_.lowerCase(action)](
		`metadata/v1/${jwtPayload?.firebase?.tenant}/${module}${
			params ? `?${params}` : ""
		}`,
		payload,
	);
};

export default HTTPRequest;
export {
	FHIRSearch,
	FHIRSave,
	FHIRDelete,
	NokiService,
	HTTPMetadata,
	HTTPRequestUnauthenticated,
};
