import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Disclaimer = () => {
	return (
		<div
			className="d-flex align-items-center p-2 rounded"
			style={{
				backgroundColor: "rgb(250, 250, 230, 0.8)",
				color: "rgb(168, 124, 0)",
			}}
		>
			<InfoOutlinedIcon className="me-2" />
			<p className="mb-0 fw-medium">
				FORMD AI can make mistakes. Always verify for clinical relevance.
			</p>
		</div>
	);
};

export default Disclaimer;
