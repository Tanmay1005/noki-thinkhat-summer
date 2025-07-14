import { Close } from "@mui/icons-material";
import {
	Box,
	Dialog,
	DialogTitle,
	IconButton,
	Typography,
} from "@mui/material";

const VideoDialog = ({ open, handleClose, videoDetails }) => {
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: "7px",
				},
			}}
		>
			<DialogTitle sx={{ p: 2 }}>
				<Box className="d-flex justify-content-between align-items-center">
					<Typography variant="h6" noWrap>
						{videoDetails?.videoTitle}
					</Typography>
					<IconButton onClick={handleClose}>
						<Close />
					</IconButton>
				</Box>
			</DialogTitle>
			<Box sx={{ position: "relative", p: 0 }}>
				{videoDetails?.videoLink ? (
					<video controls className="d-block w-100">
						<source src={videoDetails.videoLink} type="video/mp4" />
						<track
							kind="captions"
							src={videoDetails.captionsLink}
							label="English"
						/>
						Your browser does not support the video tag.
					</video>
				) : (
					<Typography
						sx={{ textAlign: "center", p: 3 }}
						variant="body2"
						color="textSecondary"
					>
						Video not available
					</Typography>
				)}
			</Box>
		</Dialog>
	);
};

export default VideoDialog;
