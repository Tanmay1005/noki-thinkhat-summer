import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<Container maxWidth="md">
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					textAlign: "center",
				}}
			>
				<Typography
					variant="h1"
					component="h1"
					gutterBottom
					sx={{ fontSize: "10rem", fontWeight: "bold", color: "#5840BA" }}
				>
					404
				</Typography>
				<Typography variant="h4" component="h2" gutterBottom>
					Oops! Page Not Found
				</Typography>
				<Typography variant="body1" paragraph sx={{ maxWidth: "600px", mb: 4 }}>
					We're sorry, but the page you're looking for doesn't exist. It might
					have been moved, deleted, or maybe the URL was mistyped.
				</Typography>
				<Button
					component={Link}
					to="/"
					variant="contained"
					color="primary"
					size="large"
					startIcon={<HomeIcon />}
					sx={{
						borderRadius: "50px",
						padding: "10px 30px",
						fontSize: "1.1rem",
						textTransform: "none",
						boxShadow: "0 4px 6px rgba(88, 64, 186, 0.25)",
						"&:hover": {
							boxShadow: "0 6px 8px rgba(88, 64, 186, 0.4)",
						},
					}}
				>
					Back to Home
				</Button>
			</Box>
		</Container>
	);
};

export default NotFound;
