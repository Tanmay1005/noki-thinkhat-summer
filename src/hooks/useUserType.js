import { useSelector } from "react-redux";

export const useUserType = () => {
	const userType = useSelector((state) => state?.auth?.userType);
	return userType;
};
