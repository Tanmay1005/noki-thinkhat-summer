import { Box } from "@mui/material";

const styles = {
	Doctor: {
		container: { justifyContent: "flex-end" },
		message: { background: "#F9F8FE", order: 1 },
	},
	Patient: {
		container: { justifyContent: "flex-start" },
		message: { background: "#fff", order: 2 },
	},
};
const Message = ({ data }) => {
	const style = styles[data.speakerId];
	return (
		<Box className="d-flex gap-1 " sx={{ ...style.container }}>
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
			>
				{data.speakerText}
			</Box>
		</Box>
	);
};
const Chat = ({ messages }) => {
	return (
		<>
			{messages?.map((message, index) => {
				return (
					<Message key={`${message.speakerId}-${index + 1}`} data={message} />
				);
			})}
		</>
	);
};
export default Chat;
