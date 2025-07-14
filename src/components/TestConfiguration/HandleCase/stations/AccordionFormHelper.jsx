import { ExpandMore } from "@mui/icons-material";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	FormHelperText,
	Typography,
} from "@mui/material";
import { useState } from "react";

const AccordionFormHelper = ({
	label = "",
	summary = "",
	backgroundColor = "#fff",
	hasErrors = false,
	errorMessage = "",
	JSX = null,
	labelProps = {},
	isExpanded = true,
}) => {
	const [expanded, setExpanded] = useState(isExpanded);
	const handleExpand = (_, expanded) => {
		setExpanded(expanded);
	};
	return (
		<div>
			<Accordion
				defaultExpanded
				className="rounded rounded-4"
				sx={{ backgroundColor }}
				expanded={expanded}
				onChange={handleExpand}
			>
				<AccordionSummary
					expandIcon={<ExpandMore />}
					aria-controls="panel1bh-content"
					id="panel1bh-header"
				>
					<Typography
						component="div"
						sx={{
							width: "33%",
							flexShrink: 0,
							fontWeight: "bold",
							fontSize: "1.1rem",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							...labelProps.sx,
						}}
						{...labelProps}
						title={label}
					>
						{label}
						{summary && !expanded && (
							<Typography
								noWrap
								component="div"
								sx={{
									maxWidth: 250, // or any fixed width
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
								title={summary}
							>
								{summary}
							</Typography>
						)}
					</Typography>
					<FormHelperText error>
						{hasErrors
							? errorMessage
								? errorMessage
								: "Please fill all the required field to proceed"
							: ""}
					</FormHelperText>
				</AccordionSummary>
				<AccordionDetails>{JSX}</AccordionDetails>
			</Accordion>
		</div>
	);
};

export default AccordionFormHelper;
