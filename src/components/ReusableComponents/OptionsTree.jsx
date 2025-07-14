import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Chip,
	Typography,
} from "@mui/material";
import { useController, useFormContext } from "react-hook-form";

const themeColors = {
	primary: "#6938EF",
	lightGray: "#F9F9F9",
	gray: "#E0E0E0",
	selectedChipBg: "#F4F4F6",
};

const OptionsTree = ({ name, handleAddClick, handleRemoveClick }) => {
	const { control } = useFormContext();
	const {
		field: { value: selected = [], onChange },
	} = useController({ name, control, defaultValue: [] });

	const toggleOption = (option, index, fileId) => {
		const item = selected.find(
			(item) => item?.testName === option || item === option,
		);
		let updated = [...selected];
		if (item) {
			const itemIndex = index || selected.indexOf(item);
			const optionFileId = item?.fileId || fileId;

			updated = selected.filter((o) => o !== option);
			handleRemoveClick?.(optionFileId, itemIndex);
		} else {
			updated = [...selected, option];
			handleAddClick?.(option);
		}

		if (!handleAddClick && !handleRemoveClick) {
			onChange(updated);
		}
	};

	const renderOptions = (options) => (
		<Box>
			{options.map((option) => (
				<Box
					key={`${option}`}
					display="flex"
					alignItems="center"
					gap={1.5}
					py={0.75}
					sx={{ cursor: "pointer" }}
					onClick={() => toggleOption(option)}
				>
					{selected.find(
						(item) => item?.testName === option || item === option,
					) ? (
						<CheckCircleIcon sx={{ color: "#17B26A" }} />
					) : (
						<AddCircleOutlineIcon sx={{ color: themeColors.primary }} />
					)}
					<Typography>{option}</Typography>
				</Box>
			))}
		</Box>
	);

	const renderTree = (data) => (
		<Box sx={{ mt: 2, backgroundColor: themeColors.lightGray }}>
			{data?.map((node, index) => (
				<Accordion
					key={`${node.label}-${index}`}
					disableGutters
					elevation={0}
					sx={{
						backgroundColor: "transparent",
						borderRadius: "8px !important",
						pt: 0.5,
					}}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						sx={{
							borderRadius: "8px !important",
							px: 1,
							flexDirection: "row-reverse",
							gap: 1,
							"&:hover": {
								backgroundColor: themeColors.primary,
							},
							"&.Mui-expanded": {
								backgroundColor: themeColors.primary,
								color: "white",
							},
						}}
					>
						<Typography>{node.label}</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ pl: 4 }}>
						{node.section
							? renderTree(node.section)
							: renderOptions(node.options)}
					</AccordionDetails>
				</Accordion>
			))}
		</Box>
	);
	// TODO: Here instead of hardcoding, need to fetch the data from some API

	const data = [
		// {
		// 	label: "A",
		// 	type: "section",
		// 	section: [
		// 		{
		// 			label: "B1",
		// 			type: "section",
		// 			section: [
		// 				{
		// 					label: "C1",
		// 					type: "options",
		// 					options: ["c1", "d1", "e1"],
		// 				},
		// 			],
		// 		},
		// 		{
		// 			label: "B2",
		// 			type: "section",
		// 			section: [
		// 				{
		// 					label: "C2",
		// 					type: "options",
		// 					options: ["c2", "d2", "e2"],
		// 				},
		// 			],
		// 		},
		// 	],
		// },
		{
			options: ["c1", "d1", "e1", "a1", "b1"],
		},
	];
	return (
		<Box>
			<Box
				sx={{ maxHeight: "400px", overflowY: "auto", scrollbarWidth: "thin" }}
			>
				{renderTree(data)}
			</Box>

			<Box mt={3}>
				<Typography fontWeight="bold" mb={1}>
					Your Selected Differentials
				</Typography>
				<Box display="flex" flexWrap="wrap" gap={1}>
					{selected.map((opt, index) => (
						<Chip
							key={`${opt}-selected-${index + 1}`}
							label={opt?.testName || opt}
							onDelete={() => {
								toggleOption(opt, index, opt?.fileId);
							}}
							deleteIcon={
								<CloseIcon sx={{ color: themeColors.primary, fontSize: 12 }} />
							}
							sx={{
								backgroundColor: themeColors.selectedChipBg,
								borderRadius: 2,
								fontSize: 14,
							}}
						/>
					))}
				</Box>
			</Box>
		</Box>
	);
};
export default OptionsTree;
