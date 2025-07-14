import { FHIRSearch, HTTPRequestUnauthenticated } from "./http";

export const GET_PERSON_FROM_UID = async (uid) => {
	try {
		const res = await FHIRSearch("Person", `identifier=${uid}`);
		if (res?.data?.total > 0) {
			return res.data.entry[0];
		}
	} catch (err) {
		console.error(err);
	}
};

export const GET_TENANTS = async (email) => {
	try {
		const response = await HTTPRequestUnauthenticated.get(
			`auth/user/tenants?email=${encodeURIComponent(email)}`,
		);
		return response?.data;
	} catch (err) {
		console.error(err);
	}
};
