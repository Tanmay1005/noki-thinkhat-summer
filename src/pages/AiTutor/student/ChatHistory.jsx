import { AddComment } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Popover,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	DELETE_CHAT_SESSION_BY_ID,
	GET_ALL_TUTORS,
} from "adapters/ai_tutor.service";
import CommonProgress from "components/ReusableComponents/Loaders";
import SidePanel from "components/ReusableComponents/SidePanel";
import UIButton from "components/ReusableComponents/UIButton";
import UISelectField from "components/ReusableComponents/UISelectField";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ChatHistory = ({
	chats = [],
	chatsLoading,
	handleDrawerToggle,
	deleteChat,
}) => {
	const [tutors, setTutors] = useState([]);
	const [selectTutorAnchorEl, setSelectTutorAnchorEl] = useState(null);
	const [selectedTutor, setSelectedTutor] = useState(null);
	const [chatTobeDeleted, setChatToBeDeleted] = useState(null);
	const [chatDeleteModalOpen, setChatDeleteModalOpen] = useState(false);
	const { chatId } = useParams();
	const navigate = useNavigate();
	const isSelectTutorDialogOpen = Boolean(selectTutorAnchorEl);
	const fetchTutors = async () => {
		try {
			const response = await GET_ALL_TUTORS();
			setTutors(response.data);
		} catch (err) {
			console.error("Error Fetching Tutors", err);
		}
	};
	const handleSelectedChat = (chat) => {
		const { id, tutor_id } = chat;
		navigate(`/ai-tutor/${tutor_id}/${id}`);
		handleDrawerClose();
	};
	const selectTutorHandler = (event) => {
		setSelectTutorAnchorEl(event.currentTarget);
		if (!tutors.length) {
			fetchTutors();
		}
	};
	const handleDrawerClose = () => {
		if (handleDrawerToggle) {
			handleDrawerToggle();
		}
	};
	const createNewChat = () => {
		handleSelectTutorDialogClose();
		navigate(`/ai-tutor/${selectedTutor}`);
		handleDrawerClose();
	};
	const handleSelectTutorDialogClose = () => {
		setSelectTutorAnchorEl(null);
		setSelectedTutor(null);
	};
	const handleTutorChange = (event) => {
		setSelectedTutor(event.target.value);
	};
	const handleChatDeleteModalOpen = (event, chat) => {
		event.stopPropagation();
		setChatToBeDeleted(chat);
		setChatDeleteModalOpen(true);
	};
	const handleChatDeleteModalClose = () => {
		setChatToBeDeleted(null);
		setChatDeleteModalOpen(false);
	};
	const handleDeleteChatSession = async () => {
		try {
			const response = await DELETE_CHAT_SESSION_BY_ID(chatTobeDeleted.id);
			if (response.status === 200) {
				deleteChat(chatTobeDeleted.id);
				toast.success("Chat session deleted successfully");
			} else {
				toast.error("Failed to delete chat session");
			}
		} catch (error) {
			console.error("Error deleting chat session", error);
			toast.error("Failed to delete chat session");
		} finally {
			handleChatDeleteModalClose();
		}
	};
	return (
		<>
			<Popover
				open={isSelectTutorDialogOpen}
				anchorEl={selectTutorAnchorEl}
				onClose={handleSelectTutorDialogClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				slotProps={{
					paper: {
						sx: { width: 400, padding: 3, borderRadius: "12px" },
					},
				}}
			>
				<Box className="modal-content">
					<Box className="modal-body">
						<Box
							className="d-flex flex-column justify-content-center align-items-center"
							sx={{ gap: "1.5rem" }}
						>
							<Typography variant="h6" fontWeight="bold">
								Select a Tutor to start!
							</Typography>
							<UISelectField
								label="Select Tutor"
								multiple={false}
								options={tutors?.map((tutor) => ({
									label: tutor.name,
									value: tutor.id,
								}))}
								onChange={handleTutorChange}
								value={[selectedTutor]}
								sx={{ padding: "0.75rem" }}
							/>
						</Box>
					</Box>

					<Box className="d-flex justify-content-center align-items-center gap-2 mt-4">
						<UIButton
							text="Cancel"
							variant="outlined"
							onClick={handleSelectTutorDialogClose}
							sx={{ width: "100%", textTransform: "capitalize !important" }}
						/>
						<UIButton
							text="Proceed"
							variant="contained"
							onClick={createNewChat}
							disabled={!selectedTutor}
							sx={{ width: "100%", textTransform: "capitalize !important" }}
						/>
					</Box>
				</Box>
			</Popover>
			<Dialog open={chatDeleteModalOpen} onClose={handleChatDeleteModalOpen}>
				<DialogTitle>Delete Chat Session</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete{" "}
						<strong>{chatTobeDeleted?.title}</strong>? This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<UIButton
						onClick={handleChatDeleteModalClose}
						// disabled={loading}
						text="Cancel"
					/>
					<UIButton
						onClick={handleDeleteChatSession}
						color="error"
						variant="contained"
						// disabled={loading}
						text="Delete"
					/>
				</DialogActions>
			</Dialog>
			<SidePanel.Container style={{ background: "#fff" }}>
				<SidePanel.Header title="History">
					<Tooltip title="New Chat">
						<IconButton
							onClick={selectTutorHandler}
							disabled={chatsLoading}
							sx={{ "&:disabled": { opacity: "0.5" } }}
						>
							<AddComment sx={{ fontSize: 28, color: "#5840BA" }} />
						</IconButton>
					</Tooltip>
				</SidePanel.Header>
				{chatsLoading ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
						}}
					>
						<CommonProgress />
					</Box>
				) : (
					<SidePanel.Body>
						{chats?.length > 0 ? (
							<Box className="d-flex flex-column gap-2">
								{chats.map((chat) => (
									<Box
										sx={{
											borderRadius: "8px",
											border: "1px solid #5D5FEF4D",
											background: "#FAFAFA",
											padding: "8px 12px",
											display: "flex",
											justifyContent: "space-between",
											gap: "1rem",
											...(chatId === chat.id
												? {
														background: "#5840BA",
														color: "#ffff",
													}
												: {
														"&:hover .delete-icon": {
															display: "block", // Show the icon on hover
														},
													}),
											"&:hover": {
												background: "#5840BA",
												color: "#ffff",
											},
										}}
										key={chat.id}
										onClick={() => handleSelectedChat(chat)}
										onKeyUp={() => handleSelectedChat(chat)}
									>
										<Box>
											<Typography
												component="p"
												sx={{ fontWeight: 700, fontSize: "16px" }}
											>
												{chat.title}
											</Typography>
											<Typography
												component="p"
												sx={{ fontWeight: 400, fontSize: "12px" }}
											>
												{dayjs(chat.created_at).format("MM/DD/YYYY")}
											</Typography>
										</Box>
										<DeleteIcon
											className="delete-icon"
											onClick={(event) =>
												handleChatDeleteModalOpen(event, chat)
											}
											sx={{
												display: "none", // Hide the icon by default
												color: "#fff", // Set the color of the icon
												cursor: "pointer", // Change the cursor on hover
											}}
										/>
									</Box>
								))}
							</Box>
						) : (
							<Box className="d-flex align-items-center justify-content-center h-100">
								<Typography sx={{ textAlign: "center" }}>
									No Chats Sessions Available
								</Typography>
							</Box>
						)}
					</SidePanel.Body>
				)}
			</SidePanel.Container>
		</>
	);
};
export default ChatHistory;
