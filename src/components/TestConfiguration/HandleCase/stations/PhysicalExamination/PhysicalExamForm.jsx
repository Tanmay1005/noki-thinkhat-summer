import { Close, Search } from "@mui/icons-material";
import {
	Box,
	Chip,
	IconButton,
	InputAdornment,
	List,
	TextField,
	Typography,
} from "@mui/material";
import { GET_PE_DATA } from "adapters/noki_ed.service";
import UIButton from "components/ReusableComponents/UIButton";
import { buildPEHierarchy } from "helpers/common_helper";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import PeExamList from "./PeExamList";

const findTopLevelCategoryIdByTestId = (testId, data) => {
	for (const topCategory of data) {
		const queue = [topCategory];
		while (queue.length > 0) {
			const current = queue.shift();

			// ✅ Check if this category has the test
			if (current.tests?.some((test) => test.id === testId)) {
				return topCategory.id; // Return top-level category's ID
			}

			// 👇 Traverse children if any
			if (current.children?.length) {
				queue.push(...current.children);
			}
		}
	}
	return null; // not found
};

const PhysicalExamForm = ({
	onClose = () => {},
	name = "",
	Data = [],
	title = "Select Exams",
	display = {},
	isStudent = false,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTests, setSelectedTests] = useState([]);
	const { getValues, setValue } = useFormContext();
	const [examsData, setExamData] = useState([]);
	const [loading, setLoading] = useState(false);
	const selectedPETestsField = `${name}.PETests`;
	const activePEField = "activePE";
	const formValues = getValues(selectedPETestsField);
	const isCaseEditable = getValues("isCaseEditable");
	const {
		close = true,
		selected = true,
		actions = true,
		addButton = true,
	} = display;
	const getFormData = async () => {
		try {
			setLoading(true);
			const response = await GET_PE_DATA();
			const tree = buildPEHierarchy(response?.data);
			setExamData(tree);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (Data?.length) {
			setExamData(Data);
		} else {
			getFormData();
		}
	}, [Data?.length]);

	useEffect(() => {
		setSelectedTests(formValues);
	}, [formValues]);

	const handleToggleTest = (test) => {
		setSelectedTests((prev) => {
			const isSelected = prev?.some((t) => t.id === test.id);
			if (isSelected) {
				return prev?.filter((t) => t.id !== test.id);
			}
			const data = [...(prev || []), test];
			if (isStudent) {
				handleProceed(data);
			}
			return data;
		});
	};
	const handleActivePE = (test) => {
		const categoryId = findTopLevelCategoryIdByTestId(test.id, examsData);
		setValue(activePEField, { ...test, categoryId });
	};
	const handleProceed = (data) => {
		const tests = data?.length > 0 ? data : selectedTests;
		setValue(selectedPETestsField, tests);
		if (!isStudent) {
			onClose();
		}
	};

	// const handleProceed = () => {
	//     onProceed(selectedTests);
	//     onClose();
	// };

	const filteredData = useMemo(() => {
		if (!searchQuery) return examsData;
		const lowerCaseQuery = searchQuery.toLowerCase();
		const filter = (items) =>
			items
				.map((item) => {
					if (item.category.toLowerCase().includes(lowerCaseQuery)) return item;
					const filteredChildren = item.children ? filter(item.children) : [];
					const filteredTests = item.tests?.filter((test) =>
						test.name.toLowerCase().includes(lowerCaseQuery),
					);
					if (filteredChildren.length > 0 || filteredTests?.length > 0) {
						return {
							...item,
							children: filteredChildren,
							tests: filteredTests,
						};
					}
					return null;
				})
				.filter(Boolean);
		return filter(examsData);
	}, [searchQuery, examsData?.length]);

	return (
		<>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h5">{title}</Typography>
				{close && (
					<IconButton onClick={onClose}>
						<Close />
					</IconButton>
				)}
			</Box>
			<TextField
				fullWidth
				placeholder="Search here..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				disabled={!isCaseEditable}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<Search />
						</InputAdornment>
					),
				}}
				sx={{
					"& .MuiInputBase-input": { padding: "0.5rem" },
					borderRadius: "8px",
				}}
			/>
			<Box
				flexGrow={1}
				overflow="auto"
				border={1}
				borderColor="grey.300"
				borderRadius={1}
				p={1}
			>
				{loading ? (
					<div>Loading...</div>
				) : (
					<List>
						{filteredData.map((item) => (
							<PeExamList
								key={item.id}
								item={item}
								onSelect={handleToggleTest}
								handleActivePE={handleActivePE}
								selectedTests={selectedTests}
								displayAddButton={addButton}
								isStudent={isStudent}
							/>
						))}
					</List>
				)}
			</Box>
			{selected && (
				<Box>
					<Typography fontWeight="bold">Your Selected Exams</Typography>
					<Box
						display="flex"
						flexWrap="wrap"
						gap={1}
						p={2}
						mt={1}
						height={100}
						overflow={"auto"}
						bgcolor="grey.100"
						borderRadius={1}
					>
						{selectedTests?.length > 0 ? (
							selectedTests.map((t) => (
								<Chip
									key={t.test_id}
									label={t.name}
									disabled={loading}
									onDelete={() => handleToggleTest(t)}
								/>
							))
						) : (
							<Typography color="text.secondary">No exams selected.</Typography>
						)}
					</Box>
				</Box>
			)}
			{actions && (
				<Box display="flex" justifyContent="flex-end" gap={2}>
					<UIButton text="Cancel" variant="outlined" onClick={onClose} />
					<UIButton
						text="Proceed"
						variant="contained"
						onClick={handleProceed}
					/>
				</Box>
			)}
		</>
	);
};

export default PhysicalExamForm;
