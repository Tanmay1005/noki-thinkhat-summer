import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { FormHelperText, IconButton, InputLabel } from "@mui/material";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import useVoiceRecognizer from "hooks/useVoiceRecognizer";
import { useEffect, useRef, useState } from "react";

const Delta = Quill.import("delta");
const modules = {
	toolbar: [
		[{ header: "1" }, { header: "2" }, { font: [] }],
		[{ size: [] }],
		[{ list: "ordered" }, { list: "bullet" }],
		["bold", "italic", "underline", "strike", "blockquote"],
		[{ color: [] }, { background: [] }],
		[{ align: [] }],
		["clean"],
	],
	clipboard: {
		matchers: [
			[
				"img",
				() => {
					return new Delta().insert("");
				},
			],
		],
	},
};

const CustomRichTextEditor = ({
	required = false,
	errorMessage = "",
	heightClass = "",
	label = "",
	showMic = true,
	readOnly,
	disabled = false,
	...props
}) => {
	// NOT showing mic icon for now. Will think about it later.
	showMic = false;
	const { isRecording, startRecording, stopRecording, transcription } =
		useVoiceRecognizer();
	const editorRef = useRef(null);
	const [processedTranscriptions, setProcessedTranscriptions] = useState(
		new Set(),
	);

	const handleTranscriptionUpdate = (transcriptionArray) => {
		const newText = transcriptionArray
			.filter(
				(item) => item?.isFinal && !processedTranscriptions.has(item.text),
			)
			.map((item) => {
				setProcessedTranscriptions((prevSet) =>
					new Set(prevSet).add(item.text),
				);
				return item.text;
			})
			.join(" ");

		if (newText) {
			const editor = editorRef.current?.getEditor();

			if (editor) {
				const range = editor.getSelection();
				if (range) {
					editor.insertText(range.index, ` ${newText.trim()} `);
					editor.setSelection(range.index + newText.length + 1);
				} else {
					const currentContent = editor.getText().trim();
					editor.insertText(currentContent.length, ` ${newText.trim()} `);
				}
				props.onChange(editor.root.innerHTML);
			}
		}
	};

	useEffect(() => {
		if (Array.isArray(transcription) && transcription.length > 0) {
			handleTranscriptionUpdate(transcription);
		}
	}, [transcription]);

	return (
		<>
			<div
				className={`${required && errorMessage ? "quill-editor-error" : ""} ${heightClass} ${readOnly || disabled ? "read-only" : ""}`}
			>
				<InputLabel>
					{label} {required && <font color="#d32f2f">*</font>}
				</InputLabel>
				<div style={{ position: "relative" }}>
					<ReactQuill
						{...props}
						theme="snow"
						readOnly={readOnly || disabled}
						value={props.value}
						modules={modules}
						onChange={(content, _delta, _source, editor) => {
							const text = editor.getText();
							props.onChange(text.trim() === "" ? "" : content);
						}}
						ref={editorRef}
					/>

					{showMic && (
						<IconButton
							onClick={isRecording ? stopRecording : startRecording}
							className={`mic-button ${isRecording ? "recording" : ""}`}
							style={{
								position: "absolute",
								top: "10px",
								right: "10px",
								backgroundColor: "#5856d6",
							}}
						>
							{isRecording ? (
								<MicIcon />
							) : (
								<MicOffIcon sx={{ color: "white" }} />
							)}
						</IconButton>
					)}
				</div>

				{errorMessage && (
					<FormHelperText error sx={{ marginLeft: "1rem" }}>
						{errorMessage}
					</FormHelperText>
				)}
			</div>
		</>
	);
};

export default CustomRichTextEditor;
