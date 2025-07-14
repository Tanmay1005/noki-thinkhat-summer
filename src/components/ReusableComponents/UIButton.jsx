import { Button } from "@mui/material";

const UIButton = ({
	text = "Button",
	onClick = () => {},
	startIcon = null,
	endIcon = null,
	...props
}) => {
	return (
		<Button
			onClick={onClick}
			fullWidth
			{...buttonProps}
			startIcon={startIcon}
			endIcon={endIcon}
			{...props}
		>
			{text}
		</Button>
	);
};

export default UIButton;

const buttonProps = {
	className: "rounded rounded-pill px-3",
	size: "small",
	sx: {
		textTransform: "none",
		height: "max-content",
		width: "max-content",
	},
	variant: "outlined",
};
