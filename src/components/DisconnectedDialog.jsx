import {
	CircularProgress,
	DialogContent,
	DialogContentText,
	Grid,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import UIModal from "./ReusableComponents/UIModal";

export default function DisconnectedDialog() {
	const [isOnline, setIsOnline] = useState(true);

	const updateNetworkStatus = () => {
		const networkStatus = navigator.onLine;
		setIsOnline(networkStatus);
		if (networkStatus) {
			toast.info("Your connection is now stable");
			// location.reload()
		}
	};

	useEffect(() => {
		window.addEventListener("online", updateNetworkStatus);
		window.addEventListener("offline", updateNetworkStatus);

		return () => {
			window.removeEventListener("online", updateNetworkStatus);
			window.removeEventListener("offline", updateNetworkStatus);
		};
	}, [navigator.onLine]);

	return (
		<UIModal
			open={!isOnline}
			displayCloseIcon={false}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					<p>
						<b>You are not connected to the internet</b>
					</p>
					<p>
						<Grid container spacing={1} style={{ margin: "0 auto" }}>
							<Grid item>
								<CircularProgress size={25} thickness={4} />
							</Grid>
							<Grid item>
								<Typography variant="body1">Trying to reconnect...</Typography>
							</Grid>
						</Grid>
					</p>
				</DialogContentText>
			</DialogContent>
		</UIModal>
	);
}
