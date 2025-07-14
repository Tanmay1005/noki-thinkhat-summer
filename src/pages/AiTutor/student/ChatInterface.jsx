import { Box, Typography } from "@mui/material";
import {
	CHAT_WITH_AI,
	GET_CHAT_MESSAGES_BY_SESSION_ID,
	GET_SESSION_DETAILS_BY_ID,
	GET_TUTOR_DETAILS_BY_ID,
} from "adapters/ai_tutor.service";
import CommonProgress from "components/ReusableComponents/Loaders";
import LoadingDots from "components/ReusableComponents/LoadingDots";
import ChatInput from "components/chat/ChatInput";
import Message from "components/chat/Message";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useOutletContext, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ChatInterface = () => {
	const [messages, setMessages] = useState([]);
	const [sessionDetails, setSessionDetails] = useState({});
	const [tutorDetails, setTutorDetails] = useState({});
	const [error, setError] = useState(null);
	const [aiMessageLoading, setAIMessageLoading] = useState(null);
	const [loading, setLoading] = useState(false);
	const { tutorId, chatId } = useParams();
	const { handleNewChat } = useOutletContext();
	const userId = useSelector((state) => state.auth.personData.id);
	const chatRef = useRef(null);
	const location = useLocation();
	const messagePayload = {
		user_id: userId,
		tutor_id: tutorId,
	};
	const tutorName = chatId ? sessionDetails?.tutor_name : tutorDetails?.name;
	const [suggestedQuestions, setSuggestedQuestions] = useState([]);
	const fetchChatDetails = async () => {
		try {
			if (!location.search) {
				setLoading(true);
			}
			const messageResponse = GET_CHAT_MESSAGES_BY_SESSION_ID(chatId);
			const sessionResponse = GET_SESSION_DETAILS_BY_ID(chatId);
			const [messageDetails, sessionDetails] = await Promise.all([
				messageResponse,
				sessionResponse,
			]);
			setMessages(messageDetails?.data);
			setSessionDetails(sessionDetails?.data);
		} catch (err) {
			console.error("Error fetching Chat sessions", err);
		} finally {
			setLoading(false);
		}
	};
	const fetchTutorDetails = async () => {
		try {
			if (tutorDetails?.id === tutorId) return;
			const response = await GET_TUTOR_DETAILS_BY_ID(tutorId);
			setTutorDetails(response?.data);
		} catch (error) {
			console.error("Error Fetching Tutor Details", error);
		}
	};
	const sendMessage = async (message, callback = () => {}) => {
		try {
			setAIMessageLoading(true);
			setError(null);
			messagePayload.message = message;
			if (chatId) {
				messagePayload.session_id = chatId;
				messagePayload.collection_name = sessionDetails?.tutor_label;
			} else {
				messagePayload.collection_name = tutorDetails?.label;
			}
			setSuggestedQuestions([]);
			setMessages((prev) => [
				...prev,
				{
					id: uuidv4(),
					sender_type: "user",
					content: message,
					timestamp: new Date(),
				},
			]);
			const response = await CHAT_WITH_AI(messagePayload);
			setMessages((prev) => [
				...prev,
				{
					id: uuidv4(),
					sender_type: "agent",
					content: response.data.response,
					timestamp: new Date(),
				},
			]);
			if (response?.data?.followup_questions?.length) {
				setSuggestedQuestions(response?.data?.followup_questions);
			}
			if (!chatId && response.data.session_id) {
				handleNewChat(response.data.session_id);
			}
		} catch (err) {
			setError(err);
			console.error("Error sending message", err);
		} finally {
			setAIMessageLoading(false);
			callback();
		}
	};
	useEffect(() => {
		const lastChild = chatRef?.current?.lastElementChild;
		if (lastChild) {
			lastChild.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [messages]);
	useEffect(() => {
		setError(null);
		if (chatId && tutorId) {
			fetchChatDetails();
			return;
		}
		if (tutorId) {
			setMessages([]);
			setSessionDetails([]);
			fetchTutorDetails();
			setSuggestedQuestions([]);
			return;
		}
	}, [chatId, tutorId]);
	return (
		<>
			{loading ? (
				<Box
					sx={{
						justifyContent: "center",
						alignItems: "center",
						display: "flex",
						height: "100%",
						flexDirection: "column",
					}}
				>
					<CommonProgress />
					<p>Loading your messages, stay tuned!!</p>
				</Box>
			) : (
				<>
					<Box className="d-flex align-items-center justify-content-between w-100">
						<Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
							{chatId ? sessionDetails?.title : "New Chat"}
						</Typography>
						<Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
							{tutorName}
						</Typography>
					</Box>
					<hr />
					<Box
						className="d-flex flex-column"
						sx={{ flex: 1, overflow: "auto", padding: "1rem" }}
						// ref={chatRef}
					>
						<div ref={chatRef} className="d-flex flex-column gap-3 p-1">
							{messages?.map((message) => {
								return <Message key={message.id} data={message} />;
							})}

							{error && (
								<Typography
									sx={{
										backgroundColor: "#ff00002e",
										padding: "12px",
										borderRadius: "8px",
										width: "fit-content",
									}}
								>
									{`🤖 ${tutorName} is currently busy. Please try again shortly.`}
								</Typography>
							)}
							{aiMessageLoading && (
								<Box
									sx={{
										padding: "12px",
										lineHeight: "1.5rem",
										fontWeight: "400",
										textAlign: "justify",
										width: "fit-content",
										maxWidth: "60%",
										display: "flex",
										gap: "0.5rem",
									}}
								>
									FORMD AI is processing your request
									<LoadingDots />
								</Box>
							)}
						</div>
						{suggestedQuestions?.length && chatId ? (
							<Box p={2}>
								<Typography variant="h6" gutterBottom>
									Suggested Questions
								</Typography>
								<div style={{ width: "60%" }}>
									{suggestedQuestions.map((question) => (
										<div key={question}>
											<p
												onClick={() => {
													sendMessage(question);
												}}
												onKeyDown={() => {}}
												label={question}
												key={question}
												style={{
													backgroundColor: "rgba(0, 0, 0, 0.08)",
													border: "2px solid #5840BA",
													cursor: "pointer",
												}}
												className="rounded-pill d-inline-block px-3 py-1 m-0 mb-2"
											>
												{question}
											</p>
										</div>
									))}
								</div>
							</Box>
						) : (
							<></>
						)}
					</Box>
					<hr />
					<Box>
						<ChatInput sendMessage={sendMessage} />
					</Box>
				</>
			)}
		</>
	);
};

export default ChatInterface;
