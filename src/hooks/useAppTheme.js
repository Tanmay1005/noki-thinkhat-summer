import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const useAppTheme = () => {
	const themeMode = useSelector((state) => state.app.theme);

	const theme = useMemo(() => {
		document.documentElement.setAttribute("data-bs-theme", themeMode);
		return createTheme({
			palette: {
				mode: themeMode,
				...(themeMode === "dark"
					? {
							textFieldColor: "#387CA3",
							background: {
								default: "#201F48",
								paper: "#201F48",
							},
							primary: {
								main: "#5D5FEF",
							},
							dataGridHeaderColor: "#00adb5",
						}
					: {
							textFieldColor: "#387CA3",
							primary: {
								main: "#5D5FEF",
							},
							dataGridHeaderColor: "#f8f8f8",
						}),
			},
			zIndex: {},
			typography: {
				fontFamily: `"Nunito", sans-serif`,
				fontSize: 14, // Base font size in pixels
				h1: {
					fontSize: "2.5rem",
				},
				h2: {
					fontSize: "2rem",
				},
				h3: {
					fontSize: "1.75rem",
				},
				h4: {
					fontSize: "1.5rem",
				},
				h5: {
					fontSize: "1.25rem",
				},
				h6: {
					fontSize: "1rem",
				},
				body1: {
					fontSize: "0.875rem", // Equivalent to 14px if base size is 16px
				},
				body2: {
					fontSize: "0.75rem", // Equivalent to 12px if base size is 16px
				},
			},
			components: {
				MuiSvgIcon: {
					styleOverrides: {
						root: {
							fontSize: "1.2rem",
						},
					},
				},
				MuiDialogTitle: {
					styleOverrides: {
						root: {
							fontSize: "1.2rem",
						},
					},
				},
				MuiTooltip: {
					styleOverrides: {
						tooltip: {
							fontSize: "0.7rem",
						},
					},
				},
			},
		});
	}, [themeMode]);

	return theme;
};

export default useAppTheme;
