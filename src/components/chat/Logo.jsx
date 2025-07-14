import { Avatar } from "@mui/material";
import logo from "assets/logo.svg";
import { useSelector } from "react-redux";

const Logo = ({ senderType }) => {
	if (senderType === "agent") {
		return (
			<Avatar
				src={logo}
				sx={{
					width: "2rem",
					height: "2rem",
					background: "#5840BA",
					order: 1,
				}}
			/>
		);
	}
	const name = useSelector((state) => state?.auth?.personData?.name);
	return (
		<Avatar
			sx={{
				width: "2rem",
				height: "2rem",
				background: "#5840BA",
				order: 2,
			}}
		>
			{name?.split("")[0].toUpperCase()}
		</Avatar>
	);
};

export default Logo;
