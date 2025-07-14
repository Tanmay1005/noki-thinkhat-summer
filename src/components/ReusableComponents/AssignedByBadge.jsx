import { Chip } from "@mui/material";

const config = {
	styles: {
		color: "#fff",
		fontWeight: "700",
		borderRadius: "8px",
		height: "1.5rem",
	},
	admin: {
		styles: {
			backgroundColor: "#9F1A72",
		},
		text: "Admin",
	},
	examiner: {
		styles: {
			backgroundColor: "#8A1B02",
		},
		text: "Teaching Staff",
	},
};
const AssignedByBadge = ({ name, role }) => {
	return (
		<>
			{name && (
				<div>
					<Chip
						label={`${name}(${config[role]?.text})`}
						sx={{
							...config.styles,
							...config[role]?.styles,
						}}
					/>
				</div>
			)}
		</>
	);
};

export default AssignedByBadge;
