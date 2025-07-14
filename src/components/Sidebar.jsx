import {
	ChevronLeft,
	ChevronRight,
	Logout,
	SupportAgent,
} from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PhoneIcon from "@mui/icons-material/Phone";
// import QuizIcon from "@mui/icons-material/PsychologyAlt";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Tooltip,
} from "@mui/material";
import AiTutorIcon from "assets/sidebar/ai-tutor-icon.svg";
import StationsIcon from "assets/sidebar/circuits.svg";
import FeedBackIcon from "assets/sidebar/feedback.svg";
import DashboardIcon from "assets/sidebar/home.svg";
import AssessmentIcon from "assets/sidebar/stations.svg";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AppLogo from "../assets/logo-white.svg";
import { useUserType } from "../hooks/useUserType";
import { user_logout } from "../redux/slices/authSlice";
import { resetStateAndSignOut } from "../redux/thunks/authAsyncActions";
import UIButton from "./ReusableComponents/UIButton";
import UIModal from "./ReusableComponents/UIModal";

// import ThemeToggle from "./ThemeToggle";

export const useNavBar = () => {
	const userType = useUserType();
	// const { email } = useSelector((state) => state.auth.personData);
	// const allowedEmails = [
	// 	"david@gmail.com",
	// 	"alice@gmail.com",
	// 	"leo@yopmail.com",
	// ];
	let navBar = [];
	// const flaggedFeatures = [
	// 	{
	// 		path: "/ai-tutor",
	// 		icon: (
	// 			<img
	// 				src={AiTutorIcon}
	// 				alt="Ai Tutor Icon"
	// 				style={{ height: "1rem", width: "1rem" }}
	// 			/>
	// 		),
	// 		label: "AI Tutor",
	// 	},
	// ];
	// const isFeatureAllowed = allowedEmails.includes(email);
	// const allowedFeatures = isFeatureAllowed ? flaggedFeatures : [];
	switch (userType) {
		case "Admin":
			navBar = [
				{
					path: "/",
					icon: <HomeIcon />,
					label: "Dashboard",
				},
				{
					path: "/configuration-hub",
					icon: <NewspaperIcon />,
					label: "Configuration Hub",
				},
				{
					path: "/users-and-groups",
					icon: <VerifiedUserIcon />,
					label: "Users & Groups",
				},
				// {
				// 	path: "/quiz-config",
				// 	icon: <QuizIcon />,
				// 	label: "Quiz Config",
				// },
				{
					path: "/admin-feedback",
					icon: (
						<img
							src={FeedBackIcon}
							alt="Assignments Icon"
							style={{ height: "2rem", width: "2rem" }}
						/>
					),
					label: "Assignments",
				},
				{
					path: "/ai-tutor",
					icon: (
						<img
							src={AiTutorIcon}
							alt="Ai Tutor Icon"
							style={{ height: "1rem", width: "1rem" }}
						/>
					),
					label: "AI Tutor",
				},
				// ...allowedFeatures,
			];
			return navBar;
		case "Student":
			navBar = [
				{
					path: "/",
					icon: (
						<img
							src={DashboardIcon}
							alt="Dashboard Icon"
							style={{ height: "2rem", width: "2rem" }}
						/>
					),
					label: "Dashboard",
				},
				{
					path: "/OSCETraining",
					icon: (
						<img
							src={AssessmentIcon}
							alt="Assessment Icon"
							style={{ height: "2rem", width: "2rem" }}
						/>
					),
					label: "Train Up",
				},
				{
					path: "/OSCE/tests",
					icon: (
						<img
							src={StationsIcon}
							alt="Stations Icon"
							style={{ height: "2rem", width: "2rem" }}
						/>
					),
					label: "Tests",
				},
				{
					path: "/ai-tutor",
					icon: (
						<img
							src={AiTutorIcon}
							alt="Ai Tutor Icon"
							style={{ height: "1rem", width: "1rem" }}
						/>
					),
					label: "AI Tutor",
				},
				// ...allowedFeatures,
			];
			return navBar;
		case "Examiner":
			navBar = [
				{
					path: "/",
					icon: (
						<img
							src={DashboardIcon}
							alt="Home Icon"
							style={{ height: "2rem", width: "2rem" }}
						/>
					),
					label: "Dashboard",
				},
				{
					path: "/configuration-hub",
					icon: <NewspaperIcon />,
					label: "Configuration Hub",
				},
				{
					path: "/group-management",
					icon: <VerifiedUserIcon />,
					label: "Group Management",
				},
				{
					path: "/admin-feedback",
					icon: (
						<img
							src={FeedBackIcon}
							alt="Assignments Icon"
							style={{ height: "2rem", width: "2rem" }}
						/>
					),
					label: "Assignments",
				},
				{
					path: "/ai-tutor",
					icon: (
						<img
							src={AiTutorIcon}
							alt="Ai Tutor Icon"
							style={{ height: "1rem", width: "1rem" }}
						/>
					),
					label: "AI Tutor",
				},
				// ...allowedFeatures,
			];
			return navBar;
		default:
			return navBar;
	}
};

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
	const reduxDispatch = useDispatch();
	const location = useLocation();
	const [isLogout, setIsLogout] = useState(false);
	const navigate = useNavigate();
	const handleLogout = () => {
		reduxDispatch(user_logout());
		reduxDispatch(resetStateAndSignOut());
		navigate("/login", { replace: true });
	};

	const { isRecording } = useSelector((state) => state.speech);

	return (
		<div
			className={`sidebar sidebar-bg ${isOpen ? "open" : "closed"}`}
			style={{
				pointerEvents: isRecording && "none",
			}}
		>
			<div
				className={"d-flex align-items-center flex-nowrap overflow-hidden px-2"}
				style={{
					whiteSpace: "nowrap",
					height: "64px",
					justifyContent: isOpen ? "flex-start" : "center",
				}}
			>
				<img
					alt="logo"
					src={AppLogo}
					style={{
						width: "4rem",
						height: "4rem",
						cursor: "pointer",
					}}
					onClick={() => {
						navigate("/");
						isMobile && toggleSidebar();
					}}
					onKeyUp={() => navigate("/")}
				/>
				{isOpen && (
					<span
						className={"fw-semibold d-inline-block"}
						style={{ fontSize: "1.2rem", cursor: "pointer" }}
						onClick={() => {
							navigate("/");
							isMobile && toggleSidebar();
						}}
						onKeyUp={() => navigate("/")}
					>
						FORMD
					</span>
				)}
			</div>
			<div
				className="d-flex flex-column justify-content-between"
				style={{
					height: "calc(100% - 64px)",
				}}
			>
				<div>
					<List
						component="nav"
						className="m-0 mx-2 gap-2 p-0 d-flex flex-column"
					>
						{useNavBar()?.map((route, _index) => (
							<Tooltip
								title={isOpen ? "" : route.label}
								placement="right"
								key={`path-${route?.path}`}
							>
								<ListItemButton
									component={Link}
									to={route?.path}
									key={`path-${route?.path}`} // This key will have the "path-{path}" as values so it will be unique like ["path-/dashboard", "path-/profile", "path-/settings"]
									selected={location?.pathname === route?.path}
									className="py-1 my-1 px-auto"
									sx={{
										borderRadius: "10px",
										"&:hover": {
											backgroundColor: "rgba(255, 255, 255, 0.3)",
										},
										"&.Mui-selected": {
											backgroundColor: "rgba(255, 255, 255, 0.10)",
											"&:hover": {
												backgroundColor: "rgba(255, 255, 255, 0.3)",
											},
										},
										justifyContent: isOpen ? "flex-start" : "center",
									}}
									onClick={() => isMobile && toggleSidebar()}
								>
									<ListItemIcon
										sx={{
											paddingY: "5px",
											color: "#fff",
											minWidth: isOpen ? "2rem" : "auto",
											justifyContent: "center",
										}}
									>
										{route.icon}
									</ListItemIcon>
									{isOpen && (
										<ListItemText
											primary={route.label}
											sx={{ whiteSpace: "nowrap" }}
										/>
									)}
								</ListItemButton>
							</Tooltip>
						))}
					</List>
				</div>
				<div style={{ flexGrow: 1 }} />
				<div
					className={`d-flex flex-column ${isOpen ? "mx-4 gap-2" : "align-items-center"}`}
					style={{ paddingBottom: "1rem" }}
				>
					{isOpen && (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								marginBottom: "8px",
							}}
						>
							<SupportAgent />
							<span
								style={{
									fontSize: "0.7rem",
									fontWeight: "600",
									color: "#ffffff",
									letterSpacing: "1px",
									textTransform: "uppercase",
									whiteSpace: "nowrap",
								}}
							>
								Contact Support
							</span>
						</div>
					)}

					<Tooltip title={isOpen ? "" : "Call Us"} placement="right">
						<a
							href="tel:+15165507579"
							className="d-flex align-items-center gap-3"
							style={{
								position: "relative",
								whiteSpace: "nowrap",
								color: "#fff",
								textDecoration: "none",
							}}
						>
							<PhoneIcon />
							{isOpen && (
								<span style={{ fontSize: "0.8rem", color: "#ddd" }}>
									+1 (516) 550-7579
								</span>
							)}
						</a>
					</Tooltip>

					<Tooltip title={isOpen ? "" : "Email Us"} placement="right">
						<a
							href="mailto:support@formd.ai"
							className="d-flex align-items-center gap-3"
							style={{
								marginTop: "0.5rem",
								color: "#fff",
								textDecoration: "none",
							}}
						>
							<EmailIcon />
							{isOpen && (
								<span style={{ fontSize: "0.8rem", color: "#ddd" }}>
									support@formd.ai
								</span>
							)}
						</a>
					</Tooltip>
				</div>

				<div
					style={{
						borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
						margin: "8px auto",
						width: isOpen ? "80%" : "50%",
						transition: "width 0.3s ease",
					}}
				/>

				<div
					className={`sidebar-footer d-flex justify-content-between align-items-center mb-2 ${isOpen ? "mx-2" : "flex-column gap-2"}`}
				>
					<Tooltip title="Logout" placement="right">
						<IconButton
							onClick={() => setIsLogout(true)}
							sx={{ color: "#fff" }}
						>
							<Logout />
						</IconButton>
					</Tooltip>
					{/* <ThemeToggle sx={{ color: "#fff" }} /> */}

					<Tooltip title={isOpen ? "Collapse" : "Expand"} placement="right">
						<IconButton onClick={toggleSidebar} sx={{ color: "#fff" }}>
							{isOpen ? <ChevronLeft /> : <ChevronRight />}
						</IconButton>
					</Tooltip>
				</div>
			</div>
			{isLogout && (
				<UIModal
					open={isLogout}
					handleClose={() => setIsLogout(false)}
					width={400}
				>
					<div className="modal-content">
						<div className="modal-body">
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5 style={{ fontWeight: "bold" }}>Sign Out?</h5>
								<span style={{ textAlign: "center" }}>
									Are you sure you want to Sign Out?
								</span>
							</div>
						</div>
						<div className="d-flex justify-content-center align-items-center mt-2 gap-2">
							<UIButton
								text="CANCEL"
								variant="outlined"
								onClick={() => {
									setIsLogout(false);
								}}
								sx={{
									width: "100%",
									textTransform: "capitalize !important",
								}}
							/>
							<UIButton
								text="OK"
								variant="contained"
								onClick={handleLogout}
								sx={{
									width: "100%",
									textTransform: "capitalize !important",
								}}
							/>
						</div>
					</div>
				</UIModal>
			)}
		</div>
	);
};

export default Sidebar;
