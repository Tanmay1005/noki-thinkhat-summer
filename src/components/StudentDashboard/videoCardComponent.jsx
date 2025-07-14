import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Box, Typography } from "@mui/material";
import VideoDialog from "components/ReusableComponents/videoDialog";
import { useState } from "react";
import video from "../../assets/video.png";

const VideoCard = ({ slides }) => {
	const [open, setOpen] = useState(false);
	const [videoDetails, setVideoDetails] = useState(null);

	const handleClose = (e) => {
		setOpen(false);
		setVideoDetails(null);
		e.stopPropagation();
	};

	const handleOpen = (slide) => {
		setVideoDetails(slide);
		setOpen(true);
	};

	return (
		<Box
			className="d-flex justify-content-between align-items-center secondary-bg-color"
			sx={{
				borderRadius: 3,
				height: "100%",
				cursor: "pointer",
			}}
			onClick={() => handleOpen(slides[0])}
		>
			<VideoDialog
				open={open}
				handleClose={handleClose}
				videoDetails={videoDetails}
			/>
			<Box className="video-container w-100">
				<Box
					className="position-relative"
					sx={{
						borderRadius: 2,
						height: "190px",
						"&:hover .overlay": {
							opacity: 1,
						},
					}}
				>
					<Box
						component="img"
						src={video}
						alt="knowledge base"
						sx={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							borderRadius: "inherit",
						}}
					/>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							zIndex: 2,
						}}
					>
						<PlayCircleIcon
							sx={{
								fontSize: { xs: 20, sm: 24, md: 28 },
								color: "#fff",
							}}
						/>
					</Box>
					<Box
						className="overlay"
						sx={{
							background: "rgba(0,0,0,0.2)",
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							display: "flex",
							alignItems: "flex-end",
							justifyContent: "center",
							padding: { xs: "0.25rem", sm: "0.5rem" },
						}}
					>
						<Typography
							sx={{
								fontSize: { xs: "0.5rem", sm: "0.625rem", md: "0.75rem" },
								color: "#fff",
							}}
						>
							Get to know more about FORMD!
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default VideoCard;
