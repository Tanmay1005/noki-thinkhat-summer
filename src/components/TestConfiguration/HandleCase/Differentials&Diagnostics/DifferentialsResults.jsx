import styled from "@emotion/styled";
import { Box, InputBase, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import CommonProgress from "../../../ReusableComponents/Loaders.jsx";
import UIButton from "../../../ReusableComponents/UIButton.jsx";
import VirtualizedList from "../../../ReusableComponents/VirtualizedList.jsx";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GET_SNOMED_DATA_BY_FILTER } from "adapters/noki_ed.service";
import NoDataImage from "assets/station_images/DifferentialsNotFound.svg";
import { useController, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { themeColors } from "../stations/DiagnosticTestsForm.jsx";
const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 2),
		paddingRight: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		border: "1px solid #ccc",
		borderRadius: "12px",
		"&:focus": {
			borderColor: theme.palette.primary.main,
			boxShadow: `0 0 0 1px ${theme.palette.primary.light}`,
		},
	},
}));

export const DifferentialsResults = ({
	name,
	onAddTest,
	onRemoveTest,
	onSelectedItemsChange,
	headerProps,
	resultsProps,
	isDisabled = false,
}) => {
	const { control } = useFormContext();
	const {
		field: { value: initialSelectedItems, _onChange },
	} = useController({
		name: name,
		control,
	});
	const searchTermInputRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [differentialsData, setDifferentialsData] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);

	useEffect(() => {
		if (initialSelectedItems && Array.isArray(initialSelectedItems)) {
			setSelectedItems(initialSelectedItems);
		}
	}, [initialSelectedItems, name]);
	const searchSnomedData = useCallback(async (searchTerm) => {
		try {
			setLoading(true);
			const response = await GET_SNOMED_DATA_BY_FILTER({
				searchTerm: searchTerm,
			});
			if (response?.status === 200) {
				const snomed_data = response?.data?.get_snomed_data || [];
				// Transform data to add id field for VirtualizedList
				const transformedSnomedData = snomed_data.map((item) => ({
					id: item?.id,
					snomed_id: item?.id,
					concept_id: item?.conceptid,
					diagnosis: item?.term,
				}));
				setDifferentialsData(transformedSnomedData);
			}
		} catch (error) {
			console.error("Error searching differentials data:", error);
			toast.error("Failed to search differentials data. Please try again.");
			return;
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSearch = useCallback(
		async (searchTerm) => {
			await searchSnomedData(searchTerm);
		},
		[searchSnomedData],
	);

	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === "Enter" && e.target.value.trim().length >= 5) {
				e.preventDefault();
				handleSearch(e.target.value);
			}
		},
		[handleSearch],
	);

	// Custom item renderer
	const renderItem = ({ item, _index, isSelected, onSelect }) => (
		<Box
			display="flex"
			gap={1}
			alignItems="center"
			sx={{
				cursor: "pointer",
				"&:hover": {
					backgroundColor: "#f5f5f5",
				},
				borderRadius: "8px",
			}}
			height={50}
			onClick={onSelect}
		>
			{isSelected ? (
				<CheckCircleIcon sx={{ color: "#17B26A", flexShrink: 0 }} />
			) : (
				<AddCircleOutlineIcon
					sx={{ color: themeColors.primary, flexShrink: 0 }}
				/>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					sx={{
						wordWrap: "break-word",
						overflowWrap: "break-word",
						hyphens: "auto",
					}}
				>
					{item?.diagnosis}
				</Typography>
			</Box>
		</Box>
	);

	const handleSelectionChange = (
		selectedIds,
		lastSelectedId,
		_lastSelectedIndex,
		lastSelectedItem,
	) => {
		setSelectedItems((prevSelected) => {
			const isSelected = selectedIds.includes(lastSelectedId);
			let newSelectedItems;

			if (isSelected) {
				const isAlreadySelected = prevSelected.some(
					(item) => item?.snomed_id === lastSelectedItem?.snomed_id,
				);
				if (!isAlreadySelected) {
					newSelectedItems = [...prevSelected, lastSelectedItem];
					onAddTest?.(lastSelectedItem);
				} else {
					newSelectedItems = prevSelected;
				}
			} else {
				// Remove item from selection
				const index = prevSelected.findIndex(
					(item) => item?.snomed_id === lastSelectedItem?.snomed_id,
				);
				newSelectedItems = prevSelected.filter(
					(item) => item?.snomed_id !== lastSelectedItem?.snomed_id,
				);
				onRemoveTest?.(index);
			}

			// Call the callback with updated selected items
			if (onSelectedItemsChange) {
				onSelectedItemsChange(newSelectedItems);
			}

			return newSelectedItems;
		});
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				gap: 1,
			}}
		>
			{/* Header */}

			<HeaderComponent
				searchInputRef={searchTermInputRef}
				handleKeyDown={handleKeyDown}
				isSearchDisabled={loading}
				handleSearch={handleSearch}
				headerProps={headerProps}
				isDisabled={isDisabled}
			/>

			{/* Results */}
			<ResultsComponent
				loading={loading}
				differentialsData={differentialsData}
				renderItem={renderItem}
				selectedItems={selectedItems}
				handleSelectionChange={handleSelectionChange}
				resultsProps={resultsProps}
				isDisabled={isDisabled}
			/>
			{/* Footer */}
		</div>
	);
};

export default DifferentialsResults;

const HeaderComponent = ({
	searchInputRef,
	handleKeyDown,
	isSearchDisabled,
	handleSearch,
	headerProps = {},
	isDisabled = false,
}) => {
	const [searchInputValue, setSearchInputValue] = useState("");
	return (
		<div style={{ height: "15%", width: "100%" }}>
			<Box>
				<Typography variant="p">Please enter atleast 5 letters</Typography>
				{isDisabled && (
					<Typography variant="p" sx={{ color: "red", ml: 2 }}>
						You can't access data if you pause the case.
					</Typography>
				)}
			</Box>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				width="100%"
				gap={2}
				sx={{ ...headerProps?.sx }}
				{...(headerProps || {})}
			>
				<StyledInputBase
					inputProps={{ "aria-label": "search" }}
					inputRef={searchInputRef}
					placeholder="Search for differentials"
					onKeyDown={handleKeyDown}
					onChange={(e) => setSearchInputValue(e.target.value)}
					disabled={isDisabled}
				/>
				<UIButton
					variant="contained"
					color="primary"
					text="Search"
					size="large"
					onClick={() => {
						const value = searchInputRef.current?.value;
						handleSearch(value);
					}}
					disabled={
						searchInputValue.trim().length < 5 || isSearchDisabled || isDisabled
					}
				/>
			</Box>
		</div>
	);
};

const ResultsComponent = ({
	loading,
	differentialsData,
	renderItem,
	selectedItems,
	handleSelectionChange,
	resultsProps,
	isDisabled = false,
}) => {
	return (
		<div style={{ height: "85%", width: "100%", boxSizing: "border-box" }}>
			{loading ? (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					height="100%"
				>
					<CommonProgress />
				</Box>
			) : (
				<Box
					// mt={2}
					sx={{
						overflowY: "auto",
						...resultsProps?.sx,
					}}
					{...(resultsProps || {})}
					height="100%"
				>
					{differentialsData.length > 0 && !isDisabled ? (
						<VirtualizedList
							items={differentialsData}
							itemHeight={50}
							renderItem={renderItem}
							onSelectionChange={handleSelectionChange}
							selectedItems={selectedItems.map((item) => item.snomed_id)}
							multiSelect={true}
							overscan={5}
							className="my-custom-list"
						/>
					) : (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							height="100%"
						>
							{/* <Typography variant="body1">No Data Found</Typography> */}
							<img
								src={NoDataImage}
								alt="No Data Found"
								style={{ width: "30%", height: "auto" }}
							/>
						</Box>
					)}
				</Box>
			)}
		</div>
	);
};
