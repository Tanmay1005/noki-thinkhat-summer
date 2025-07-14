import { Divider, IconButton, InputBase, Paper, Tooltip } from "@mui/material";
import sendIcon from "assets/send.svg";
import { useState } from "react";

const ChatInput = ({ placeholder, sendMessage }) => {
	const [input, setInput] = useState("");
	const [isDisabled, setIsDisabled] = useState(false);
	const [renderInputField, setRenderInputField] = useState(0);
	const handleInputState = () => {
		setIsDisabled((prev) => !prev);
	};
	const handleChange = (event) => {
		setInput(event.target.value);
	};
	const onSendMessage = (event) => {
		event.preventDefault();
		const message = input.trim();
		if (message) {
			handleInputState();
			sendMessage(message, () => {
				handleInputState();
				setRenderInputField((prev) => prev + 1);
			});
			setInput("");
		}
	};
	const handleEnterClicked = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			onSendMessage(event);
		}
	};
	return (
		<Paper
			component="form"
			sx={{
				display: "flex",
				alignItems: "center",
				borderRadius: "12px",
				border: "0.5px solid #5840BA",
			}}
			onSubmit={onSendMessage}
		>
			<InputBase
				sx={{
					flex: 1,
					fontWeight: "500",
					fontSize: "16px",
					padding: "14px 20px",
				}}
				key={renderInputField}
				autoFocus
				placeholder={placeholder || "Ask FORMD-AI"}
				value={input}
				onChange={handleChange}
				onKeyDown={handleEnterClicked}
				disabled={isDisabled}
				multiline
				maxRows={4}
			/>
			<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
			<Tooltip title="Send Message">
				<IconButton
					color="primary"
					sx={{ p: "10px", "&:disabled": { opacity: "0.5" } }}
					aria-label="directions"
					onClick={onSendMessage}
					disabled={!input.trim()}
				>
					<img src={sendIcon} alt="send message" />
				</IconButton>
			</Tooltip>
		</Paper>
	);
};

export default ChatInput;
