import { Typography } from "@mui/material";
import { breadCrumbsMap } from "constants.js";
import { useUserType } from "hooks/useUserType";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
const Breadcrumbs = () => {
	const userType = useUserType();
	const location = useLocation();
	const username = useSelector((state) => state?.auth?.personData?.name);
	const path = `/${location?.pathname?.split("/")?.[1]}`;
	return (
		<Typography variant="h6" noWrap>
			<span style={{ fontWeight: 600 }}>
				{breadCrumbsMap?.[userType || "Admin"]?.[path]}
			</span>
			{userType === "Student" && (
				<span>
					{path.includes("allscores") ? " | Scores " : ` | ${username}`}
				</span>
			)}
		</Typography>
	);
};

export default Breadcrumbs;
