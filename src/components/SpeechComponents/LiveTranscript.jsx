import { isEmpty } from "lodash";
import { useEffect, useRef } from "react";

const LiveTranscript = ({ transcription }) => {
	const scrollableContainerRef = useRef();

	useEffect(() => {
		if (scrollableContainerRef.current && !isEmpty(transcription)) {
			// Check if the user is already at the bottom
			const isAtBottom =
				scrollableContainerRef.current.scrollHeight -
					scrollableContainerRef.current.scrollTop ===
				scrollableContainerRef.current.clientHeight;

			// Scroll to the bottom only if not already at the bottom
			if (!isAtBottom) {
				scrollableContainerRef.current.scrollTo({
					top: scrollableContainerRef.current.scrollHeight,
					behavior: "smooth", // Enable smooth scrolling
				});
			}
		}
	}, [transcription]);

	return (
		<div className="h-100 overflow-auto" ref={scrollableContainerRef}>
			{transcription?.filter(
				(item) =>
					!(
						item.speakerId.toLowerCase() === "unknown" &&
						item.speakerText.trim() === ""
					),
			).length === 0 ? (
				<div
					className="d-flex justify-content-center align-items-center h-100"
					style={{
						minHeight: "100%",
					}}
				>
					Transcript Not Found
				</div>
			) : (
				<>
					{transcription
						?.filter(
							(item) =>
								!(
									item.speakerId.toLowerCase() === "unknown" &&
									item.speakerText.trim() === ""
								),
						)
						.map((item, index) => (
							<div
								className="p-2"
								key={`transcription-map-${index + 1}`} // Should be unique as we are using index
							>
								<span style={{ color: "#5840BA" }}>{item?.speakerId}:</span>{" "}
								{item.speakerText}
							</div>
						))}
				</>
			)}
		</div>
	);
};

export default LiveTranscript;
