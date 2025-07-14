import { GET_SINGLE_FILE_USING_FILEID } from "adapters/noki_ed.service";
import { useEffect, useState } from "react";
import UIButton from "./UIButton";

const GCSFile = ({ name, text, fileId, type }) => {
	const [signedUrl, setSignedUrl] = useState("");
	const getSignedUrl = async () => {
		try {
			const response = await GET_SINGLE_FILE_USING_FILEID(fileId, type, name);
			setSignedUrl(response.data.url);
		} catch (error) {
			console.error("ERROR: Getting Image", error);
		}
	};
	const downloadFile = () => {
		window.open(signedUrl, "_blank");
	};
	useEffect(() => {
		if (!signedUrl) {
			getSignedUrl();
		}
	}, []);
	return (
		<>
			{signedUrl && (
				<UIButton
					variant="outlined"
					text={text}
					onClick={downloadFile}
					sx={{
						borderRadius: "8px",
						textTransform: "none",
						width: "fit-content",
					}}
				/>
			)}
		</>
	);
};

export default GCSFile;
