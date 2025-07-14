import DragDropFileImg from "assets/drag-drop-file.svg";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const FileDragDropUI = ({ disabled = false, text = "" }) => (
	<div style={{ position: "relative" }} className="flex-grow-1 h-100">
		<div
			style={{
				border: "2px dashed #90119B",
				backgroundImage: disabled ? "none" : "",
				opacity: disabled ? 0.6 : 1,
				pointerEvents: disabled ? "none" : "auto",
				height: "250px",
			}}
			className="text-center d-flex justify-content-center align-items-center rounded rounded-3"
		>
			<div>
				<div>
					<img
						src={DragDropFileImg}
						height={"40%"}
						width={"40%"}
						alt="Drag Drop Icon"
					/>
				</div>
				<div className="fs-5">
					Drop file or{" "}
					<div
						className="d-inline-block text-decoration-underline"
						style={{ color: "#5840BA" }}
					>
						Browse
					</div>
				</div>
				<div className="fs-6 text-body-secondary">{text}</div>
			</div>
		</div>

		{disabled && (
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0, 0, 0, 0.3)",
					borderRadius: "0.5rem",
					zIndex: 1,
				}}
			/>
		)}
	</div>
);

const CustomizedFileUploader = ({
	handleChange = () => {},
	fileTypes = ["PDF", "TXT", "DOCX"],
	disabled = false,
	title = "Upload Document",
	errorText = "Unsupported file type. Only PDF, DOCX, or TXT allowed.",
	fileUploadText = "Format: pdf, docx and txt.",
	...props
}) => {
	const [error, setError] = useState("");

	return (
		<>
			<div className="fs-5" style={{ color: "#5840BA" }}>
				{title}
			</div>
			<div className="file-uploader-size-helper">
				<p style={{ color: "red" }}>{error}</p>
				<FileUploader
					handleChange={(file) => {
						setError("");
						handleChange(file);
					}}
					name="file"
					types={fileTypes}
					disabled={disabled}
					{...props}
					onTypeError={(err) => {
						console.error("Unsupported file type:", err);
						setError(errorText);
					}}
					onSizeError={(err) => {
						console.error("Unsupported file size:", err);
						setError(`Document size can be ${props?.maxSize}MB.`);
					}}
				>
					<FileDragDropUI text={fileUploadText} disabled={disabled} />
				</FileUploader>
			</div>
		</>
	);
};

export default CustomizedFileUploader;

// export default FileDragDropUI
