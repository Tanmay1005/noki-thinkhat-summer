import { Logout, MenuOutlined } from "@mui/icons-material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
	Avatar,
	Badge,
	Box,
	IconButton,
	// InputBase,
	Menu,
	// MenuItem,
	Typography,
} from "@mui/material";
// import { styled } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import usLangIcon from "../assets/icons/us-lan.svg";
import { user_logout } from "../redux/slices/authSlice";
import { resetStateAndSignOut } from "../redux/thunks/authAsyncActions";
// import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import NotificationModal from "./ReusableComponents/Notification";
import UIButton from "./ReusableComponents/UIButton";
import UIModal from "./ReusableComponents/UIModal";

function roleToDisplay(userRole) {
	const role = userRole.toLowerCase();
	if (role === "admin") {
		return "Admin";
	}
	if (role === "examiner") {
		return "Teaching Staff";
	}
	if (role === "student") {
		return "Student";
	}
	return role;
}

const NotificationIcon = ({ isMobile, unreadCount }) => {
	return (
		<Badge
			badgeContent={unreadCount > 9 ? "9+" : unreadCount}
			color="error"
			sx={{
				"& .MuiBadge-badge": {
					fontSize: "0.75rem",
					minWidth: "1.25rem",
					height: "1.25rem",
				},
			}}
		>
			<NotificationsNoneIcon
				sx={{
					color: isMobile ? "white" : "inherit",
					fontSize: "1.75rem", // Increased icon size
				}}
			/>
		</Badge>
	);
};

const Topbar = ({ isMobile, onNavOpenClick = () => {} }) => {
	const { profileComponent, className } = useSelector((state) => state.topbar);
	const notifications = useSelector((state) => state.topbar.notifications);
	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.read).length,
		[notifications],
	);
	const [anchorEl, setAnchorEl] = useState(null);
	const isMenuOpen = Boolean(anchorEl);
	const reduxDispatch = useDispatch();
	const [modalOpen, setModalOpen] = useState(false);
	const [isLogout, setIsLogout] = useState(false);
	const navigate = useNavigate();
	const handleLogout = () => {
		reduxDispatch(user_logout());
		reduxDispatch(resetStateAndSignOut());
		handleMenuClose();
		navigate("/login");
	};
	const { isRecording } = useSelector((state) => state.speech);

	const handleProfileMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const openModal = () => {
		setModalOpen(true);
	};

	const loggedInUserName = useSelector(
		(state) => state?.auth?.personData?.name,
	);
	const userRole = useSelector((state) => state?.auth?.personData?.role);

	// const location = useLocation();

	const closeModal = () => {
		setModalOpen(false);
	};

	const menuId = "primary-search-account-menu";
	const renderMenu = (
		<Menu
			anchorEl={anchorEl}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			id={menuId}
			keepMounted
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			open={isMenuOpen}
			onClose={handleMenuClose}
		>
			<Box
				sx={{
					width: 350,
					padding: 2,
					borderRadius: 2,
					backgroundColor: "#ffffff",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					position: "relative",
				}}
			>
				<IconButton
					onClick={() => setIsLogout(true)}
					sx={{
						position: "absolute",
						top: 4,
						right: 8,
						display: "flex",
						alignItems: "center",
						color: "red",
					}}
					aria-label="sign out"
				>
					<Typography variant="body2" sx={{ marginRight: 1 }}>
						Sign Out
					</Typography>
					<Logout />
				</IconButton>
				{/* User Avatar */}
				<Avatar
					sx={{
						width: 64,
						height: 64,
						fontSize: "2rem",
						mb: 1, // Margin bottom for spacing
					}}
				>
					{loggedInUserName?.charAt(0).toUpperCase()}
				</Avatar>

				<Typography variant="h6" sx={{ mb: 1 }}>
					{loggedInUserName}
				</Typography>
				<Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
					{roleToDisplay(userRole)}
				</Typography>
				{/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
			</Box>
		</Menu>
	);

	return (
		<div className={`${className} ${isMobile && "text-white"}`}>
			<div className="d-flex align-items-center py-2 px-3">
				{isMobile && (
					<div>
						<MenuOutlined
							sx={{
								margin: "0",
								padding: "0",
								marginRight: "15px",
								width: "1.5em",
								height: "1.5em",
							}}
							onClick={onNavOpenClick}
						/>
					</div>
				)}
				<Breadcrumbs />

				<div
					style={{ flexGrow: 1 }}
					className="d-flex justify-content-center align-items-center"
				/>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "1.5rem", // Increased gap between items
					}}
				>
					<Typography
						variant="body1"
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
						}}
					>
						<img src={usLangIcon} alt="us-lan" />
						Eng (US)
					</Typography>

					<IconButton
						className="rounded"
						disableRipple
						onClick={() => {
							openModal();
						}}
						sx={{
							p: 1,
							"&:hover": {
								backgroundColor: "action.hover",
							},
						}}
					>
						<NotificationIcon isMobile={isMobile} unreadCount={unreadCount} />
					</IconButton>

					<Box>
						{profileComponent || (
							<Avatar
								onClick={handleProfileMenuOpen}
								sx={{
									cursor: "pointer",
									width: "1.8rem",
									height: "1.8rem",
									fontSize: "0.8rem",
									pointerEvents: isRecording && "none",
								}}
							>
								{loggedInUserName?.slice(0, 1)?.toUpperCase()}
							</Avatar>
						)}
					</Box>
				</Box>

				<NotificationModal
					open={modalOpen}
					onClose={closeModal}
					notifications={notifications}
				/>
			</div>
			{renderMenu}
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

export default Topbar;
