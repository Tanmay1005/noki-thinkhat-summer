import { Drawer, useMediaQuery } from "@mui/material";

const RightDrawer = ({
	open,
	onClose,
	children,
	width = "",
	anchor = "right",
}) => {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const drawerWidth = isMobile
		? width
			? width
			: "75%"
		: width
			? width
			: "25%";

	return (
		<Drawer
			anchor={anchor}
			open={open}
			onClose={onClose}
			sx={{
				"& .MuiDrawer-paper": {
					width: drawerWidth,
				},
			}}
		>
			<div style={{ position: "relative", width: "100%", height: "100%" }}>
				<div>{children}</div>
			</div>
		</Drawer>
	);
};

export default RightDrawer;
