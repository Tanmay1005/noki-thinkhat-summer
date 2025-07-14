import {
	Suspense,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import NotFound from "../pages/NotFound";
import LoginPage from "../pages/userManagement/Login/LoginPage";
import Sidebar from "./Sidebar";
import "../App.scss";
import { useMediaQuery } from "@mui/material";
import CreateNewPass from "pages/userManagement/Login/CreateNewPass";
import { useSelector } from "react-redux";
import { titleMap } from "../constants";
// import NotificationListener from "../helpers/NotificationListener";
import getRoutes from "../helpers/ProtectedRoutes";
import FallBackLoader from "./FallbackLoader";
import RightDrawer from "./RightDrawer";
import Topbar from "./Topbar";

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

const LayoutProvider = ({ children }) => {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<LayoutContext.Provider value={{ isMobile, sidebarOpen, toggleSidebar }}>
			{children}
		</LayoutContext.Provider>
	);
};

const ProtectedRoute = ({ children }) => {
	const isAuthenticated = useSelector((state) => state.auth.isUserLoggedIn);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const MainLayout = () => {
	const { isMobile, sidebarOpen, toggleSidebar } = useLayout();
	const [open, setOpen] = useState(false);
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			{!isMobile ? (
				<Sidebar
					isOpen={sidebarOpen}
					toggleSidebar={toggleSidebar}
					isMobile={isMobile}
				/>
			) : (
				<RightDrawer
					width="200px"
					open={open}
					onClose={handleClose}
					anchor="left"
				>
					<Sidebar
						isMobile={isMobile}
						isOpen={true}
						toggleSidebar={handleClose}
					/>
				</RightDrawer>
			)}
			<div
				className={`app-container ${
					sidebarOpen
						? !isMobile && "sidebar-open"
						: !isMobile && "sidebar-closed"
				} ${isMobile ? "sidebar-bg" : "sidebar-corner-bg"}`}
			>
				<div
					className={`d-flex flex-column overflow-hidden h-100 ${
						!isMobile && "rounded-start-4 secondary-bg-color"
					}`}
				>
					<div className={isMobile ? "py-2" : ""}>
						<Topbar isMobile={isMobile} onNavOpenClick={handleClickOpen} />
					</div>
					<div
						className={`flex-grow-1 overflow-hidden ${
							isMobile && "rounded-top-4 secondary-bg-color"
						}`}
					>
						<main className="h-100 overflow-auto">
							<Suspense fallback={<FallBackLoader />}>
								<Outlet />
							</Suspense>
						</main>
					</div>
				</div>
			</div>
			{/* <NotificationListener /> */}
		</>
	);
};
const createRoutes = (routes) => {
	return routes?.map((route) => (
		<Route
			key={`path-${route?.path}`}
			path={route?.path}
			element={<route.component />}
		>
			{route.children && createRoutes(route.children)}
		</Route>
	));
};
const Layout = () => {
	const location = useLocation();
	useEffect(() => {
		const path = `/${location?.pathname?.split("/")?.[1]}`;
		const title = titleMap?.[path];
		document.title = `FORMD ${title ? `| ${title}` : ""}`;
	}, [location]);
	return (
		// <Suspense fallback={<FallBackLoader />}>
		<LayoutProvider>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/reset-password/:token" element={<CreateNewPass />} />
				<Route
					element={
						<ProtectedRoute>
							<MainLayout />
						</ProtectedRoute>
					}
				>
					{createRoutes(getRoutes())}
				</Route>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</LayoutProvider>
		// </Suspense>
	);
};

export default Layout;
