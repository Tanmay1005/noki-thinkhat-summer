const { useEffect } = require("react");

export const Reload = ({ is_true }) => {
	const handleBeforeUnload = (event) => {
		event.preventDefault();
		event.returnValue = "";
	};

	useEffect(() => {
		if (is_true) {
			window.addEventListener("beforeunload", handleBeforeUnload);

			return () => {
				window.removeEventListener("beforeunload", handleBeforeUnload);
			};
		}
	}, [is_true]);
};
