import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box, IconButton, Typography } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useController, useFormContext } from "react-hook-form";

const themeColors = {
	primary: "#6938EF",
	lightGray: "#F9F9F6",
	gray: "#E0E0E0",
	selectedChipBg: "#F4F4F6",
	white: "#FFFFFF",
};

const DragableList = ({ name, onRemove, isDisabled = false }) => {
	const fieldName = `${name}.differentials`;
	const { control, getValues } = useFormContext();

	const {
		field: { value: selected, onChange },
	} = useController({
		name: fieldName,
		control,
		defaultValue: [],
	});
	const isCaseEditable = getValues("isCaseEditable");
	const toggleOption = (option) => {
		const updated = selected.find((obj) => obj?.snomed_id === option?.snomed_id)
			? selected.filter((o) => o.snomed_id !== option.snomed_id)
			: [...selected, option];

		if (
			onRemove &&
			selected.find((obj) => obj?.snomed_id === option?.snomed_id)
		) {
			const index = selected.findIndex(
				(obj) => obj?.snomed_id === option?.snomed_id,
			);
			onRemove(index);
		} else {
			onChange(updated);
		}
	};
	const handleDragEnd = (result) => {
		if (!result.destination) {
			return;
		}
		const items = Array.from(selected);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		onChange(items);
	};
	return (
		<Box>
			{selected.length > 0 ? (
				<Box
					sx={{
						maxHeight: 300,
						overflowY: "auto",
						border: `1px solid ${themeColors.gray}`,
						borderRadius: 2,
						backgroundColor: themeColors.lightGray,
					}}
				>
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="selected-differentials">
							{(provided) => (
								<Box
									{...provided.droppableProps}
									ref={provided.innerRef}
									sx={{
										padding: 1,
									}}
								>
									{selected.map((option, index) => (
										<Draggable
											key={`selected-${index + 1}`}
											draggableId={`selected-${index + 1}`}
											index={index}
											isDragDisabled={isDisabled || !isCaseEditable}
										>
											{(provided, snapshot) => (
												<Box
													ref={provided.innerRef}
													{...provided.draggableProps}
													sx={{
														display: "flex",
														alignItems: "center",
														backgroundColor: snapshot.isDragging
															? "rgba(105, 56, 239, 0.1)"
															: "white",
														borderRadius: 1,
														mb: 0.5,
														p: 1,
														border: snapshot.isDragging
															? `2px solid ${themeColors.primary}`
															: "1px solid transparent",
														transition: "all 0.2s ease",
														minHeight: 48,
													}}
												>
													<Typography
														sx={{
															flex: 1,
															fontSize: 14,
														}}
													>
														{option?.diagnosis}
													</Typography>
													<IconButton
														onClick={() => toggleOption(option)}
														size="small"
														sx={{
															color: "#d32f2f",
														}}
														disabled={isDisabled || !isCaseEditable}
													>
														<CloseIcon fontSize="small" />
													</IconButton>
													<Box
														{...provided.dragHandleProps}
														sx={{
															display: "flex",
															alignItems: "center",
															minWidth: 32,
															cursor: "grab",
															"&:active": { cursor: "grabbing" },
															ml: 2,
														}}
													>
														<DragIndicatorIcon
															sx={{
																color:
																	isDisabled || !isCaseEditable
																		? themeColors.gray
																		: themeColors.primary,
															}}
														/>
													</Box>
												</Box>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</Box>
							)}
						</Droppable>
					</DragDropContext>
				</Box>
			) : (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}
				>
					No differentials selected
				</Typography>
			)}
		</Box>
	);
};
export default DragableList;
