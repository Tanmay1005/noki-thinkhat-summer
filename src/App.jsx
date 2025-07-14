import { CssBaseline, ThemeProvider } from "@mui/material";
import DisconnectedDialog from "components/DisconnectedDialog";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { jwtDecode } from "jwt-decode";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { GET_USER_BY_UID } from "./adapters/noki_ed.service";
import FallBackLoader from "./components/FallbackLoader";
import Layout from "./components/Layout";
import ToastContainerComponent from "./components/ToastContainerComponent";
import { auth } from "./firebase-setup";
import useAppTheme from "./hooks/useAppTheme";
import {
	set_is_admin,
	set_person_details,
	set_user_details,
	set_user_type,
	user_check_in,
	user_logout,
} from "./redux/slices/authSlice";
import { resetStateAndSignOut } from "./redux/thunks/authAsyncActions";

function App() {
	const navigate = useNavigate();
	const theme = useAppTheme();
	const reduxDispatch = useDispatch();
	const location = useLocation();

	const [firebaseUser, setFirebaseUser] = useState(null);
	const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

	useEffect(() => {
		setCurrentLocation(window.location?.pathname);
	}, [window?.location?.pathname]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				const roles = user?.reloadUserInfo?.customAttributes
					? JSON.parse(user?.reloadUserInfo?.customAttributes)
					: { enlivRoles: [] };
				if (navigator.onLine && roles?.enlivRoles?.includes("portal_user")) {
					signOut(auth)
						?.then(() => {
							localStorage?.clear();
							setFirebaseUser(null);
							setIsFirebaseLoaded(true);
						})
						.catch((e) => {
							console.error("some issue in firebase signout", e);
						});
					// reduxDispatch(full_page_loader(false))
					// setLoading(false);
					return false;
				}
				setFirebaseUser(user);
				user
					?.getIdToken()
					?.then((token) => {
						localStorage?.setItem("jwtToken", token);
						const jwtPayLoad = jwtDecode(token);
						reduxDispatch(
							set_user_details({
								resource: jwtPayLoad,
								userId: jwtPayLoad?.user_id,
							}),
						);
						reduxDispatch(user_check_in());
						setIsFirebaseLoaded(true);
					})
					.catch((_error) => {
						setFirebaseUser(null);
						setIsFirebaseLoaded(true);
					});
			} else {
				setFirebaseUser(null);
				setIsFirebaseLoaded(true);
			}
		});

		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		refreshUserData(firebaseUser, isFirebaseLoaded);
	}, [firebaseUser, isFirebaseLoaded]);

	const getLoggedInPersonData = async (uid) => {
		setIsUserDataLoaded(false);
		try {
			// const fhirPersonData = await GET_PERSON_FROM_UID(uid);
			const hasuraUserResponse = await GET_USER_BY_UID(uid);
			const { user_group_assignments, ...rest } = hasuraUserResponse.data;
			const userData = {
				...rest,
				groups: user_group_assignments.map((assignment) => assignment.group_id),
			};
			if (userData?.id) {
				if (userData?.status === "Inactive") {
					throw new Error(
						"Your account is inactive. Please contact the administrator.",
					);
				}
				reduxDispatch(set_person_details(userData));
				const role = userData?.role;
				const isAdmin = role === "admin";
				reduxDispatch(set_is_admin(Boolean(isAdmin)));
				const userType = _.capitalize(role);
				reduxDispatch(set_user_type(userType));

				setIsUserDataLoaded(true);
				if (!userType) {
					throw new Error("Invalid Credentials");
				}
			}
		} catch (e) {
			console.error(e);
			alert(e?.message || "Invalid Credentials");
			reduxDispatch(user_logout());
			reduxDispatch(resetStateAndSignOut());
		}
	};

	const refreshUserData = async (firebaseUser, isFirebaseLoaded) => {
		const resetPasswordMatch = location.pathname.startsWith("/reset-password/");

		if (resetPasswordMatch) {
			setIsUserDataLoaded(true);
			return;
		}
		if (isFirebaseLoaded) {
			// reduxDispatch(full_page_loader(true));
			// setLoading(true);
			if (firebaseUser) {
				await getLoggedInPersonData(firebaseUser?.uid);
				if (currentLocation === "/login") {
					navigate("/", { replace: true });
				}
			} else {
				reduxDispatch(user_logout());
				reduxDispatch(resetStateAndSignOut());
				navigate("/login", { replace: true });
				setIsUserDataLoaded(true);
			}
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<DisconnectedDialog />
			{isFirebaseLoaded && isUserDataLoaded ? <Layout /> : <FallBackLoader />}
			<ToastContainerComponent newestOnTop />
		</ThemeProvider>
	);
}

export default App;
