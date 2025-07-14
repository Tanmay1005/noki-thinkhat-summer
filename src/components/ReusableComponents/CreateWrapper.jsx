import { Dialog, Slide, useMediaQuery } from "@mui/material";
import { forwardRef } from "react";
import { useLayout } from "../Layout";

const Transition = forwardRef(function Transition(props, ref) {
	const { isMobile } = useLayout();

	return <Slide direction={isMobile ? "up" : "left"} ref={ref} {...props} />;
});

const CreateWrapper = ({
	open,
	handleClose = () => {},
	children,
	allowBackdorpClose = true,
}) => {
	const { sidebarOpen } = useLayout();
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

	return (
		<>
			<Dialog
				className={`create-wrapper ${isMobile ? "is-mobile" : sidebarOpen ? "" : "sidebar-closed"}`}
				fullScreen
				open={open}
				onClose={() => {
					if (allowBackdorpClose) {
						handleClose();
					} else {
						return;
					}
				}}
				TransitionComponent={Transition}
			>
				{children}
			</Dialog>
		</>
	);
};

export default CreateWrapper;
