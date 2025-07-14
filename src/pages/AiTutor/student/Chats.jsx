import { Box, Typography } from "@mui/material";
import {
	GET_CHAT_SESSIONS_BY_USER_ID,
	GET_SESSION_DETAILS_BY_ID,
} from "adapters/ai_tutor.service";
import SidePanel from "components/ReusableComponents/SidePanel";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ChatHistory from "./ChatHistory";

const Chats = () => {
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const userId = useSelector((state) => state.auth.personData?.id);
	const navigate = useNavigate();
	const { tutorId, chatId } = useParams();
	const fetchChats = async () => {
		try {
			setLoading(true);
			const response = await GET_CHAT_SESSIONS_BY_USER_ID(userId);
			setChats(response?.data);
			if (!tutorId && response?.data?.[0]) {
				const { id, tutor_id } = response.data[0];
				navigate(`/ai-tutor/${tutor_id}/${id}`);
			}
		} catch (err) {
			console.error("Error fetching Chat sessions", err);
		} finally {
			setLoading(false);
		}
	};
	const handleNewChat = async (sessionId) => {
		try {
			const response = await GET_SESSION_DETAILS_BY_ID(sessionId);
			setChats((prev) => [response.data, ...prev]);
			navigate(`/ai-tutor/${tutorId}/${sessionId}?new=${true}`);
		} catch (error) {
			console.error("Error fetching session details", error);
		}
	};
	const handleDrawerToggle = () => {
		setIsDrawerOpen((prev) => !prev);
	};
	const handleChatsDelete = (sessionId) => {
		setChats((prev) => prev.filter((chat) => chat.id !== sessionId));
	};
	useEffect(() => {
		fetchChats();
	}, []);
	return (
		<SidePanel styleClasses="card-bg-secondary">
			<SidePanel.DeskTop>
				<ChatHistory
					chats={chats}
					chatsLoading={loading}
					deleteChat={handleChatsDelete}
				/>
			</SidePanel.DeskTop>
			<div
				className="d-flex flex-column h-100 w-100"
				style={{
					background: "#ffff	",
					borderRadius: "24px",
					padding: "16px",
				}}
			>
				{/* <Box className="d-flex align-items-center gap-2"> */}
				<SidePanel.Mobile
					open={isDrawerOpen}
					handleDrawerToggle={handleDrawerToggle}
				>
					<ChatHistory
						handleDrawerToggle={handleDrawerToggle}
						chats={chats}
						chatsLoading={loading}
						deleteChat={handleChatsDelete}
					/>
				</SidePanel.Mobile>
				{/* </Box> */}
				{tutorId ? (
					<Outlet
						key={`${tutorId}-${chatId}`}
						context={{ handleNewChat, chats, chatsLoading: loading }}
					/>
				) : (
					<Box className="d-flex align-items-center justify-content-center h-100">
						<Typography sx={{ textAlign: "center" }}>
							{chats?.length
								? "No Chat is Selected, Select one to continue your learning"
								: "No Chats Available, Create one to start your AI learning experience!"}
						</Typography>
					</Box>
				)}
			</div>
		</SidePanel>
	);
};

export default Chats;
