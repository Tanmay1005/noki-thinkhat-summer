import {
	AddCircleOutline,
	CheckCircle,
	ExpandLess,
	ExpandMore,
} from "@mui/icons-material";
import {
	Collapse,
	IconButton,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { Box } from "victory";

const PeExamList = ({
	item,
	onSelect,
	selectedTests,
	level = 0,
	displayAddButton = true,
	isStudent,
	handleActivePE,
}) => {
	const { getValues } = useFormContext();
	const [open, setOpen] = useState(false);
	const isCaseEditable = getValues("isCaseEditable");
	const isExpandable =
		(item.children && item.children.length > 0) ||
		(item.tests && item.tests.length > 0);

	const isTestSelected = (test) => {
		return selectedTests?.some((selected) => selected.id === test.id);
	};
	const handleToggle = () => {
		if (isExpandable) {
			setOpen(!open);
		}
	};

	const handleSelectTest = (test, isSelected) => {
		if (isStudent) {
			handleActivePE(test);
			if (isSelected) {
				return; // Prevent selection in student view if already selected}
			}
		}
		onSelect({ ...test, fileId: uuid(), isExisting: false });
	};

	return (
		<>
			<ListItem
				onClick={handleToggle}
				style={{
					paddingLeft: level * 16,
					cursor: isExpandable ? "pointer" : "default",
					backgroundColor: open ? "#f0f0f0" : "transparent",
				}}
			>
				{isExpandable ? (
					<IconButton edge="start" size="small">
						{open ? <ExpandLess /> : <ExpandMore />}
					</IconButton>
				) : (
					<Box sx={{ width: 40 }} />
				)}
				<ListItemText primary={item.category} />
			</ListItem>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{/* Render Children (Recursive) */}
					{item.children?.map((child) => (
						<PeExamList
							key={child.id}
							item={child}
							onSelect={onSelect}
							selectedTests={selectedTests}
							level={level + 1}
							displayAddButton={displayAddButton}
							isStudent={isStudent} // Assuming this is not a student view, adjust as needed
							handleActivePE={handleActivePE}
						/>
					))}

					{/* Render Tests */}
					{item.tests?.map((test) => {
						const isSelected = isTestSelected(test);
						return (
							<ListItem
								key={test.id}
								disabled={!isCaseEditable}
								style={{ paddingLeft: (level + 2) * 16 }}
								onClick={() => {
									if (isCaseEditable) {
										handleSelectTest(test, isSelected);
									}
								}}
							>
								{displayAddButton && (
									<IconButton
										edge="start"
										color={isSelected ? "primary" : "default"}
									>
										{isSelected ? <CheckCircle /> : <AddCircleOutline />}
									</IconButton>
								)}
								<ListItemText
									sx={{
										...(isSelected &&
											isStudent && {
												background: "#5840BA",
												color: "#fff",
											}),
										borderRadius: "0.5em",
										padding: "0.5em",
									}}
									primary={test.name}
								/>
							</ListItem>
						);
					})}
				</List>
			</Collapse>
		</>
	);
};

export default PeExamList;
