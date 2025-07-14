import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/slices/appSlice";

const ThemeToggle = (props) => {
	const dispatch = useDispatch();
	const currentTheme = useSelector((state) => state.app.theme);
	// const theme = useTheme();

	const handleThemeChange = () => {
		dispatch(toggleTheme());
	};

	return (
		<>
			<IconButton onClick={handleThemeChange} {...props}>
				{currentTheme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
			</IconButton>
		</>
	);
};

export default ThemeToggle;
