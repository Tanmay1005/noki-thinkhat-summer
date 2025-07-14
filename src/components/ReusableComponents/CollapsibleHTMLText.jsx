import { Button, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

const CollapsibleHTMLText = ({ value, previewLength = 100, type = "" }) => {
	const [expanded, setExpanded] = useState(false);

	const toggleExpanded = () => {
		setExpanded(!expanded);
	};

	const getPreviewText = (text) => {
		// Remove HTML tags to get plain text length
		const plainText = text.replace(/<[^>]+>/g, "");
		if (plainText.length <= previewLength) return text;
		return `${plainText.substring(0, previewLength)}...`;
	};

	const isExpandable = value.replace(/<[^>]+>/g, "").length > previewLength;

	return (
		<div>
			{type === "tooltip" ? (
				<Tooltip
					title={
						isExpandable ? (
							<div
								style={{
									maxHeight: "300px",
									overflowY: "auto",
									whiteSpace: "normal",
								}}
								dangerouslySetInnerHTML={{
									__html: value,
								}}
							/>
						) : (
							""
						)
					}
					PopperProps={{
						modifiers: [
							{
								name: "flip",
								enabled: true,
							},
							{
								name: "preventOverflow",
								enabled: true,
								options: {
									padding: 8,
								},
							},
						],
					}}
				>
					<Typography
						dangerouslySetInnerHTML={{
							__html: expanded ? value : getPreviewText(value),
						}}
						sx={{ wordBreak: "break-word" }}
					/>
				</Tooltip>
			) : (
				<>
					<Typography
						dangerouslySetInnerHTML={{
							__html: expanded ? value : getPreviewText(value),
						}}
						sx={{ wordBreak: "break-word" }}
					/>
					{isExpandable && (
						<Button
							onClick={toggleExpanded}
							size="small"
							sx={{ textTransform: "none" }}
						>
							{expanded ? "Less^" : "More..."}
						</Button>
					)}
				</>
			)}
		</div>
	);
};

export default CollapsibleHTMLText;
