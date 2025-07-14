import { Menu } from "@mui/icons-material";
import {
	Box,
	Drawer,
	IconButton,
	Typography,
	alpha,
	styled,
} from "@mui/material";

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	border: "1px solid #808C9E66",
	borderRadius: "10px",
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.5),
	},
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(1),
		width: "auto",
	},
	display: "flex",
}));

const SidePanel = ({ styleClasses, children }) => {
	return (
		<Box
			sx={{
				display: "flex",
				gap: { md: "1rem" },
				width: "100%",
				height: "100%",
				overflow: "hidden",
				position: "relative",
				flexDirection: { xs: "column", md: "row" },
				padding: "12px",
			}}
			className={styleClasses}
		>
			{children}
		</Box>
	);
};
const Header = ({ title, children }) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: "16px",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
				}}
			>
				<Typography
					variant="h4"
					sx={{
						fontWeight: 500,
						fontSize: "24px",
					}}
				>
					{title}
				</Typography>
			</Box>
			{children}
		</Box>
	);
};
const DeskTop = ({ children }) => {
	return (
		<Box
			component="nav"
			sx={{
				width: { md: "300px" },
				flexShrink: { md: 0 },
				display: { xs: "none", md: "block" },
			}}
		>
			{children}
		</Box>
	);
};
const Body = ({ children }) => {
	return (
		<Box
			sx={{
				flexGrow: 1,
				overflowY: "auto",
				overflowX: "hidden",
				height: "calc(100% - 120px)", // Space for header + search
				"&::-webkit-scrollbar": { display: "none" },
				msOverflowStyle: "none",
				scrollbarWidth: "none",
			}}
		>
			{children}
		</Box>
	);
};
const SearchBar = ({ children }) => {
	return (
		<Box
			sx={{
				marginBottom: "16px",
			}}
		>
			<Search>{children}</Search>
		</Box>
	);
};
const Container = ({ children, style = {} }) => {
	return (
		<Box
			sx={{
				width: "100%",
				backgroundColor: "rgba(249, 249, 249, 1)",
				padding: {
					xs: "12px",
					sm: "16px",
				},
				borderRadius: {
					xs: "0",
					md: "24px",
				},
				display: "flex",
				flexDirection: "column",
				height: "100%",
				overflow: "hidden",
				...style,
			}}
		>
			{children}
		</Box>
	);
};
const Mobile = ({ open, handleDrawerToggle, children }) => {
	return (
		<>
			{/* <Box > */}
			<IconButton
				sx={{
					display: { md: "none" },
					position: "sticky",
					top: 0,
					left: 8,
					justifyContent: "start",
					alignSelf: "flex-start",
				}}
				onClick={handleDrawerToggle}
			>
				<Menu />
			</IconButton>
			{/* </Box> */}
			<Drawer
				variant="temporary"
				open={open}
				onClose={handleDrawerToggle}
				ModalProps={{
					keepMounted: true, // Better mobile performance
				}}
				sx={{
					display: { xs: "block", md: "none" },
					"& .MuiDrawer-paper": {
						width: "85%",
						maxWidth: "300px",
						marginTop: "80px",
						height: "calc(100% - 80px)",
						borderRadius: "20px 24px",
					},
					height: "50%",
				}}
			>
				{children}
			</Drawer>
		</>
	);
};
const Content = ({ children }) => {
	return (
		<Box
			sx={{
				flexGrow: 1,
				padding: {
					xs: "12px",
					sm: "16px",
				},
				height: "100%",
				display: "flex",
				flexDirection: "column",
				overflowY: "auto",
				width: { xs: "100%", md: "calc(100% - 300px)" },
			}}
		>
			{children}
		</Box>
	);
};
SidePanel.Header = Header;
SidePanel.Body = Body;
SidePanel.Container = Container;
SidePanel.SearchBar = SearchBar;
SidePanel.DeskTop = DeskTop;
SidePanel.Mobile = Mobile;
SidePanel.Content = Content;
export default SidePanel;
