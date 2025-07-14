import { GET_SINGLE_FILE_USING_FILEID } from "adapters/noki_ed.service";
import { useEffect, useState } from "react";

const GCSAudio = ({ name, fileId, _style, type }) => {
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
		// if (!signedUrl) {
		getSignedUrl();
		// }
	}, [name]);
	return (
		<>
			{signedUrl && (
				// biome-ignore lint/a11y/useMediaCaption: <explanation>
				<audio
					key={signedUrl} // This will force the audio to stop and reload on change
					controls
					src={signedUrl}
					style={{ width: "100%" }}
				/>
			)}
		</>
	);
};

export default GCSAudio;
