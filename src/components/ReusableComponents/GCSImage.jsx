import { GET_SINGLE_FILE_USING_FILEID } from "adapters/noki_ed.service";
import { useEffect, useState } from "react";

const GCSImage = ({ name, fileId, style, type }) => {
	const [signedUrl, setSignedUrl] = useState("");
	const getSignedUrl = async () => {
		try {
			const response = await GET_SINGLE_FILE_USING_FILEID(fileId, type, name);
			setSignedUrl(response.data.url);
		} catch (error) {
			console.error("ERROR: Getting Image", error);
		}
	};
	useEffect(() => {
		if (!signedUrl) {
			getSignedUrl();
		}
	}, []);
	return (
		<>
			{signedUrl && <img id={name} src={signedUrl} alt={name} style={style} />}
		</>
	);
};

export default GCSImage;
