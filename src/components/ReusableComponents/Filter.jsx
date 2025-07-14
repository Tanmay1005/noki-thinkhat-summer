import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Button, Checkbox, Menu, MenuItem, Tooltip } from "@mui/material";
import { useState } from "react";
import filter from "../../assets/filter.svg";

const Filter = ({
	handleFilter,
	list,
	icon,
	buttonComponent,
	selectedItem = "",
	isMultiSelect = false,
	clearSelection,
	disabled,
	type,
}) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelect = (item) => {
		const value = item.value;

		if (isMultiSelect) {
			let updatedSelection;
			if (selectedItem.includes(value)) {
				updatedSelection = selectedItem.filter((i) => i !== value);
			} else {
				updatedSelection = [...selectedItem, value];
			}
			handleFilter(updatedSelection);
		} else {
			handleFilter(value);
			handleClose();
		}
	};

	return (
		<Box>
			<span onClick={handleOpen} onKeyUp={() => {}}>
				{buttonComponent || (
					<img
						id="icon-button"
						aria-controls={open ? "basic-menu" : undefined}
						aria-haspopup="true"
						aria-expanded={open ? "true" : undefined}
						src={icon || filter}
						alt="filter"
					/>
				)}
			</span>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
				slotProps={{
					paper: {
						style: {
							border: "1px solid #8170CB",
							borderRadius: "16px",
						},
					},
				}}
			>
				{clearSelection && (
					<MenuItem
						dense
						disableGutters
						sx={{
							justifyContent: "center",
							paddingTop: "4px",
							paddingBottom: "4px",
						}}
					>
						<Button
							onClick={clearSelection}
							variant="text"
							size="small"
							sx={{
								color: "#3f51b5",
								fontWeight: "bold",
								textTransform: "none",
								"&:hover": {
									backgroundColor: "transparent",
									textDecoration: "none",
								},
							}}
							disabled={selectedItem?.length === 0}
						>
							Clear Selection
						</Button>
					</MenuItem>
				)}
				{list?.map((item, idx) => (
					<MenuItem
						key={`filter-item-${item.value || "NA"}-${idx}`}
						onClick={() => handleSelect(item)}
						sx={{
							fontSize: "0.875rem",
							lineHeight: "20px",
							textTransform: "capitalize",
						}}
						selected={selectedItem === item.value}
						disabled={disabled}
					>
						<div className="d-flex  align-items-center">
							<div className="justify-content-start">
								{isMultiSelect ? (
									<Checkbox
										checked={selectedItem.includes(item.value)}
										sx={{ padding: 0, marginRight: "8px" }}
									/>
								) : null}
								{item.label}{" "}
							</div>

							{type && (
								<div className="d-flex justify-content-end">
									{(item.label === "Test" || item.label === "Practice") && (
										<Tooltip
											title={
												item.label === "Test" ? (
													<>
														{`These are ${type} that can be assigned to students as
														tests for assessment.`}
													</>
												) : (
													<>
														{`These are the ${type} that are available for all the
														students for practice.`}
													</>
												)
											}
											color="primary"
										>
											<InfoOutlinedIcon style={{ marginLeft: "10px" }} />
										</Tooltip>
									)}
								</div>
							)}
						</div>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
};

export default Filter;
