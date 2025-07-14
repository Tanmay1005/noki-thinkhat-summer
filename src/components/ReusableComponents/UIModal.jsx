import { Close } from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

export default function UIModal({
	open,
	handleClose,
	children,
	style = {},
	ariaLabelledby = "modal-title",
	ariaDescribedby = "modal-description",
	closeOnBackdropClick = false,
	width = 400,
	height = "80vh",
	loading,
	displayCloseIcon = true,
	...props
}) {
	const isMobile = useMediaQuery("(max-width:600px)");
	const defaultStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: isMobile ? "100%" : width,
		maxHeight: height,
		overflowY: "auto",
		bgcolor: "background.paper",
		// boxShadow: 24,
		p: 4,
		...style,
	};
	const handleModalClose = (_event, _reason) => {
		// if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
		handleClose();
		// }
	};
	return (
		<Modal
			// keepMounted
			open={open}
			onClose={closeOnBackdropClick ? handleModalClose : null}
			aria-labelledby={ariaLabelledby}
			aria-describedby={ariaDescribedby}
			{...props}
		>
			<Box sx={defaultStyle} className="border rounded-4">
				{!loading && displayCloseIcon && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							right: 12,
							cursor: "pointer",
							fontSize: "1.5rem",
							fontWeight: "bold",
						}}
						onClick={handleClose}
					>
						<Close />
					</Box>
				)}

				{children}
			</Box>
		</Modal>
	);
}
