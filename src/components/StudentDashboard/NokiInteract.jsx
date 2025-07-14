import { Box, Typography } from "@mui/material";
import chat from "../../assets/chat.svg";
import nokiInteract from "../../assets/noki-interact1.svg";
import SectionHeader from "../ReusableComponents/SectionHeader";

const headerProps = {
	image: {
		content: chat,
		class: "noki-interact-img",
	},
	header: {
		content: "Noki Interact",
	},
	isBottom: true,
};

const NokiInteract = () => {
	return (
		<Box
			sx={{
				padding: "0.5rem",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				position: "relative",
				overflow: "hidden",
			}}
			className="hey-noki-banner"
		>
			<SectionHeader {...headerProps} />
			<Box
				sx={{
					textAlign: "center",
					padding: "0.5rem",
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-start",
					alignItems: "center",
					flexGrow: 1,
					zIndex: 2,
				}}
			>
				<Box
					className="noki-chat-background"
					sx={{
						marginBottom: "1rem",
						maxWidth: "100%",
						width: { xs: "100%", sm: "80%", md: "70%" },
					}}
				>
					<Typography
						sx={{
							fontSize: "0.85rem",
							marginTop: { md: "2rem" },
						}}
					>
						Noki Interact is rolling out soon. Stay tuned for more details!
					</Typography>
				</Box>
			</Box>
			<Box
				className="desktop-visible"
				sx={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: "50%",
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-end",
					zIndex: 1,
				}}
			>
				<img
					src={nokiInteract}
					alt="chat"
					style={{
						maxWidth: "100%",
						maxHeight: "100%",
						objectFit: "contain",
						objectPosition: "bottom",
					}}
				/>
			</Box>
		</Box>
	);
};

export default NokiInteract;
