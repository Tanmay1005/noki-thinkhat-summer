import { useSelector } from "react-redux";
import GoBackIcon from "../../assets/Case_tabs_image/GoBack.svg";
const FeedBackScoreWrapper = ({ setFeedbackOpen, children }) => {
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const handleNavigation = (event) => {
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			setFeedbackOpen(false);
		}
	};
	return (
		<div className="m-4">
			<div className="d-flex justify-content-between align-items-center">
				<div>
					<img
						src={GoBackIcon}
						alt="loading.."
						onClick={handleNavigation}
						onKeyUp={handleNavigation}
						style={{ cursor: "pointer" }}
					/>
					<span
						style={{ color: textColor, marginLeft: "5px", fontSize: "1.8vh" }}
					>
						Feedback
					</span>
				</div>
			</div>
			{children}
		</div>
	);
};

export default FeedBackScoreWrapper;
