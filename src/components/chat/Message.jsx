import { Box } from "@mui/material";
import { marked } from "marked";
import Logo from "./Logo";

const styles = {
	user: {
		container: { justifyContent: "flex-end" },
		message: { background: "#F9F8FE", order: 1 },
	},
	agent: {
		container: { justifyContent: "flex-start" },
		message: { background: "#FAFAFA", order: 2 },
	},
};
const Message = ({ data }) => {
	const style = styles[data.sender_type];
	return (
		<Box className="d-flex gap-2 " sx={{ ...style.container }}>
			<Logo senderType={data.sender_type} />
			<Box
				sx={{
					...style.message,
					borderRadius: "12px",
					padding: "12px",
					lineHeight: "1.5rem",
					fontWeight: "400",
					textAlign: "justify",
					wordBreak: "break-word",
					width: "fit-content",
					maxWidth: "60%",
					"& p": {
						margin: 0,
					},
				}}
				dangerouslySetInnerHTML={{
					__html: marked(data.content || ""),
				}}
			/>
		</Box>
	);
};

export default Message;
