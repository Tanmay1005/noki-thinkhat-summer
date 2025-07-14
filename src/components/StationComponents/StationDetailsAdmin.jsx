import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
	Box,
	Card,
	CardContent,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography,
} from "@mui/material";
import { GET_STATION_BY_ID } from "adapters/noki_ed.service";
import CommonProgress from "components/ReusableComponents/Loaders";
import { convertHtmlToText } from "helpers/common_helper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const StationDetailsAdmin = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const [loading, setLoading] = useState(false);
	const [station, setStation] = useState(null);
	const [error, setError] = useState(null); // For error handling

	const handleNavigation = (event) => {
		if (
			event.type === "click" ||
			(event.type === "keyup" && event.key === "Enter")
		) {
			navigate(-1);
		}
	};

	const getStationDetails = async () => {
		try {
			setLoading(true);
			const data = await GET_STATION_BY_ID(`/${id}`);
			setStation(data);
			setError(null); // Reset error on successful fetch
		} catch (err) {
			console.error(err);
			setError("Failed to load station details. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getStationDetails();
	}, []);

	// Helper function to format table rows
	const createData = (field, value) => ({ field, value });

	// Define the data to be displayed in the table
	const rows = station
		? [
				createData("Description", convertHtmlToText(station.description)),
				createData("Time Limit", `${station.time_limit} minutes`),
				createData("Type", station.type),
				// Add more fields here if necessary
			]
		: [];

	return (
		<Box
			className="main-bg-color"
			sx={{
				minHeight: "100vh",
				padding: 4,
				backgroundColor: themeMode === "dark" ? "#121212" : "#f5f5f5",
			}}
		>
			{/* Back Navigation */}
			<Box className="d-flex align-items-center mb-4">
				<IconButton
					onClick={handleNavigation}
					onKeyUp={handleNavigation}
					aria-label="go back"
					size="large"
				>
					<ArrowBackIcon style={{ color: textColor }} />
				</IconButton>
				<Typography
					variant="h6"
					component="span"
					style={{ color: textColor, cursor: "pointer" }}
					onClick={handleNavigation}
					onKeyUp={handleNavigation}
					tabIndex={0}
				>
					Go Back
				</Typography>
			</Box>

			{/* Station Details Card */}
			<Card
				sx={{
					backgroundColor: themeMode === "dark" ? "#1e1e1e" : "#ffffff",
					padding: 3,
					borderRadius: 4,
					boxShadow: 3,
				}}
			>
				<CardContent>
					<Typography variant="h5" gutterBottom>
						Station Details
					</Typography>
					{loading ? (
						<Box
							className="d-flex justify-content-center align-items-center"
							sx={{ minHeight: "200px" }}
						>
							<CommonProgress />
						</Box>
					) : error ? (
						<Typography variant="body1" color="error">
							{error}
						</Typography>
					) : station ? (
						<>
							{/* Details Table */}
							<TableContainer component={Paper} sx={{ mb: 3 }}>
								<Table>
									<TableBody>
										{rows.map((row, index) => (
											<TableRow
												key={`station-details-admin-table-row-${index + 1}`} // Should be unique as we are using index
												sx={{
													transition: "background-color 0.3s ease-in-out",
													"&:hover": {
														backgroundColor:
															themeMode === "dark" ? "#333333" : "#f1f1f1",
													},
													borderBottom: "1px solid",
													borderColor:
														themeMode === "dark" ? "#444444" : "#dddddd",
												}}
											>
												<TableCell
													component="th"
													scope="row"
													sx={{
														fontWeight: "bold",
														width: "30%",
														borderRight: "1px solid",
														borderColor:
															themeMode === "dark" ? "#444444" : "#dddddd",
													}}
												>
													{row.field}
												</TableCell>
												<TableCell
													sx={{
														color: themeMode === "dark" ? "#e0e0e0" : "#333333",
													}}
												>
													{row.value}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>

							{/* Objectives Section */}
							<Box>
								<Typography
									variant="subtitle1"
									color="textSecondary"
									gutterBottom
								>
									<strong>Objectives:</strong>
								</Typography>
								{station.objectives && station.objectives.length > 0 ? (
									<List>
										{station.objectives.map((objective, index) => (
											<ListItem
												key={`station-details-admin-objectives-${index + 1}`} // Should be unique as we are using index
												disablePadding
											>
												<ListItemIcon>
													<CheckCircleIcon color="primary" sx={{ mr: 1 }} />
												</ListItemIcon>
												<ListItemText
													primary={convertHtmlToText(objective)}
													primaryTypographyProps={{ variant: "body1" }}
												/>
											</ListItem>
										))}
									</List>
								) : (
									<Typography variant="body2" color="textSecondary">
										No objectives available.
									</Typography>
								)}
							</Box>
						</>
					) : (
						<Typography variant="body1" color="textSecondary">
							No station details available.
						</Typography>
					)}
				</CardContent>
			</Card>
		</Box>
	);
};

export default StationDetailsAdmin;
