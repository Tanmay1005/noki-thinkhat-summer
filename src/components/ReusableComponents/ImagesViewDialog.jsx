import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import UIModal from "components/ReusableComponents/UIModal";
import { useEffect, useState } from "react";

const ScrollImages = (props) => {
	const { direction, disabled, index, files, setSelectedFile } = props;

	const handleClick = () => {
		if (direction === "left") {
			if (index > 0) {
				const newIndex = index - 1;
				setSelectedFile(files[newIndex]);
			}
		} else {
			if (index < files.length - 1) {
				const newIndex = index + 1;
				setSelectedFile(files[newIndex]);
			}
		}
	};

	return (
		<IconButton
			onClick={handleClick}
			disabled={disabled}
			size="small"
			sx={{
				backgroundColor: "transparent",
				color: "inherit",
				"&:hover": {
					backgroundColor: "transparent",
					color: "inherit",
				},
			}}
		>
			{direction === "left" ? <ArrowBackIos /> : <ArrowForwardIos />}
		</IconButton>
	);
};

const ImagesViewDialog = ({ open, handleClose, files, displayFile }) => {
	const [selectedFile, setSelectedFile] = useState(
		() => displayFile || files?.[0],
	);
	useEffect(() => {
		setSelectedFile(() => displayFile || files?.[0]);
	}, [displayFile, files]);

	const findIdx = (files) => {
		const idx = files.findIndex((file) => file?.url === selectedFile?.url);
		return idx;
	};
	const idx = findIdx(files);

	return (
		<>
			<UIModal
				open={open}
				handleClose={handleClose}
				width={800}
				closeOnBackdropClick={true}
			>
				<div className="d-flex justify-content-between align-items-center">
					<ScrollImages
						direction={"left"}
						index={idx}
						disabled={idx <= 0}
						files={files}
						setSelectedFile={setSelectedFile}
					/>
					<div className="modal-content">
						<img
							src={selectedFile?.url}
							alt={selectedFile?.fileName || "Selected Image"}
							style={{ maxHeight: "500px", width: "100%" }}
						/>
					</div>
					<ScrollImages
						direction={"right"}
						index={idx}
						disabled={idx >= files.length - 1}
						files={files}
						setSelectedFile={setSelectedFile}
					/>
				</div>
			</UIModal>
		</>
	);
};

export default ImagesViewDialog;
