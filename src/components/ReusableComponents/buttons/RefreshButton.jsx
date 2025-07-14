import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton } from "@mui/material";

const RefreshButton = ({ onRefresh, disabled }) => {
	return (
		<IconButton onClick={onRefresh} disabled={disabled} color={"primary"}>
			<RefreshIcon />
		</IconButton>
	);
};

export default RefreshButton;
