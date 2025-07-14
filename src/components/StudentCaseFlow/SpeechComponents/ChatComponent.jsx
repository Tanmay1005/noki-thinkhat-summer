import { Box } from "@mui/material";
import LiveTranscript from "components/SpeechComponents/LiveTranscript";
import { memo } from "react";
import { useSelector } from "react-redux";
import Chat from "./Chat";

const ChatComponent = memo(({ speechType }) => {
	const { transcription } = useSelector((state) => state.speech);
	return (
		<>
			{speechType === "Role Play" ? (
				<Box
					className="h-100 overflow-auto p-2"
					sx={{ height: "calc(100% - 48px)" }}
				>
					<LiveTranscript transcription={transcription} />
				</Box>
			) : (
				<Box
					className=" overflow-auto p-2 d-flex flex-column gap-2"
					sx={{ height: "calc(100% - 48px)" }}
				>
					<Chat messages={transcription} />
				</Box>
			)}
		</>
	);
});

export default ChatComponent;
