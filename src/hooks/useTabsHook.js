import { useEffect, useState } from "react";
import { removeQuery, setQuery, useQuery } from "./useQuery";

const useTabsHook = (identifier, tabChangeCallBack) => {
	const queryParams = useQuery();
	const defaultTabValue = () => {
		const tab = queryParams.get(identifier);
		if (tab !== null && !Number.isNaN(tab)) {
			return Number.parseInt(tab, 10);
		}
		return 0;
	};
	const [value, setValue] = useState(defaultTabValue());

	const handleTabChange = (_event, value) => {
		setQuery(identifier, value);
		if (tabChangeCallBack) {
			tabChangeCallBack(identifier, value);
		}
	};
	const handleTabRemove = () => {
		removeQuery(identifier);
		setValue(0);
	};
	useEffect(() => {
		if (identifier !== "caseType" && queryParams.get(identifier) === null) {
			setQuery(identifier, 0);
		}
		setValue(defaultTabValue());
	}, [queryParams]);

	return {
		value,
		handleTabChange,
		handleTabRemove,
	};
};

export default useTabsHook;
