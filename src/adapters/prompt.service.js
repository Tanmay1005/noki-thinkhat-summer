import { getTenantFromToken } from "../helpers/common_helper";
import { HTTPAidaBaseService } from "./http";

export const EXECUTE_PROMPT = async ({
	payload = {},
	prompt_code = "",
	signal = "",
}) => {
	const finalPayload = {};
	finalPayload.params = payload;
	try {
		const response = await HTTPAidaBaseService.post(
			`/${getTenantFromToken()}/submit/${prompt_code}`,
			finalPayload,
			{ signal: signal },
		);
		return response;
	} catch (error) {
		console.error(error.message);
		return false;
	}
};
