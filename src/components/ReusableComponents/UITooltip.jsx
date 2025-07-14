import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const UITooltip = ({ children, tooltipContent, sx = {} }) => {
	const [anchorEl, setAnchorEl] = useState(null);

	const handleOpen = (event) => {
		setAnchorEl(event.currentTarget);
		event.stopPropagation();
	};

	const handleClose = (e) => {
		setAnchorEl(null);
		e.stopPropagation();
	};

	const open = Boolean(anchorEl);

	return (
		<>
			<div>
				<div
					onClick={handleOpen}
					onKeyUp={() => {}}
					style={{
						display: "inline-block",
						cursor: "pointer",
					}}
				>
					{children}
				</div>
				<Popover
					open={open}
					anchorEl={anchorEl}
					onClose={handleClose}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "left",
					}}
					sx={{
						"& .MuiPaper-root": {
							borderRadius: "8px",
						},
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<Typography
						sx={{
							p: 2,
							maxWidth: "900px",
							...sx,
						}}
					>
						{tooltipContent}
					</Typography>
				</Popover>
			</div>
		</>
	);
};

export default UITooltip;
