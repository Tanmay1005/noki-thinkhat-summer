import { useWatch } from "react-hook-form";

const TranscriptView = () => {
	const transcriptData = useWatch({ name: "transcript" });
	return (
		<div
			dangerouslySetInnerHTML={{
				__html: transcriptData,
			}}
		/>
	);
};

export default TranscriptView;
