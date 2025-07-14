import styled from "@emotion/styled";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { InputBase, alpha } from "@mui/material";
import {
	DELETE_BULK_FLASH_CARDS,
	DELETE_BULK_QUIZ_QUESTIONS,
} from "adapters/noki_ed.service";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CommonProgress from "components/ReusableComponents/Loaders";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddQuestionJSX from "./AddQuestion";
import FlashPage from "./FlashPage";
import ManageQuiz from "./ManageQuiz";
import QuestionPage from "./QuestionPage";

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	border: "1px solid #808C9E66",
	borderRadius: "10px",
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(1),
		width: "auto",
	},
	display: "flex",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	right: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 2),
		paddingRight: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		[theme.breakpoints.up("sm")]: {
			width: "20ch",
			"&:focus": {
				width: "30ch",
			},
		},
	},
}));

const QuizConfig = () => {
	const [value, setValue] = useState(0);
	const navigate = useNavigate();
	const location = useLocation();
	const [renderer, setRenderer] = useState(0);
	const [editMode, setEditMode] = useState(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [editableData, setEditableData] = useState(null);
	const [editFlashCard, setEditFlashCard] = useState(false);

	const handleTabChange = (_event, newValue) => {
		setSearchText("");
		setSelectedRows([]);
		setValue(newValue);
		navigate(`?tab=${newValue}`, { replace: true });
	};

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const tab = queryParams.get("tab");
		if (tab !== null && !Number.isNaN(tab)) {
			setValue(Number.parseInt(tab, 10));
		}

		return () => {};
	}, [location.search]);

	const RendererFunction = () => {
		setRenderer((p) => p + 1);
	};

	const handleAddQuestion = () => {
		setSearchText("");
		setEditMode(true);
	};

	const handleEditQuestion = (data) => {
		setSearchText("");
		setEditMode(true);
		setEditFlashCard(true);
		setEditableData(data);
	};

	const handleClose = () => {
		setEditMode(false);
		setEditFlashCard(false);
		setEditableData([]);
	};

	const handleSearchChange = (e) => {
		setSearchText(e?.target?.value);
	};
	const hanldeConfirmOpen = () => {
		setConfirmDelete(true);
	};
	const handleConfirmDeleteClose = () => {
		setConfirmDelete(false);
	};

	const handleBulkDelete = async () => {
		try {
			setDeleteLoading(true);
			if (value === 0) {
				await DELETE_BULK_FLASH_CARDS(selectedRows);
			} else {
				await DELETE_BULK_QUIZ_QUESTIONS(selectedRows);
			}
			RendererFunction();
			setSelectedRows([]);
			toast.success(
				selectedRows?.length > 1
					? value === 0
						? "Flash Cards Successfully Deleted"
						: "Quiz Questions Successfully Deleted"
					: value === 0
						? "Flash Card Successfully Deleted"
						: "Quiz Questions Successfully Deleted",
			);
		} catch (err) {
			toast.error(err.message || "Error While Deleting");
		} finally {
			setDeleteLoading(false);
			handleConfirmDeleteClose();
		}
	};
	return (
		<div className="h-100">
			{/* header */}
			<div className="d-flex flex-wrap gap-2 justify-content-between align-items-center px-3">
				<div>
					<UITabs
						tabList={["Flash", "Quiz questions"]}
						handleTabChange={handleTabChange}
						value={value}
						className="border-0 col-8"
						sx={{
							// marginLeft: "30px",
							// width: "500px",
							fontSize: "14px",
						}}
					/>
				</div>

				<div className="d-flex justify-content-between align-items-center gap-3">
					<Search>
						<StyledInputBase
							placeholder={
								value === 0 ? "Search for Fact" : "Search for Question"
							}
							inputProps={{ "aria-label": "search" }}
							value={searchText}
							onChange={handleSearchChange}
						/>
						<SearchIconWrapper>
							<SearchIcon />
						</SearchIconWrapper>
					</Search>
					<UIButton
						text={value === 0 ? "Add Flash Card" : "Add Quiz Question"}
						variant="contained"
						className="rounded rounded-3"
						size="medium"
						onClick={handleAddQuestion}
						sx={{
							whiteSpace: "nowrap",
							backgroundColor: "#8d65b4",
							fontSize: "12px",
						}}
					/>
					{selectedRows?.length > 0 && (
						<UIButton
							text="Delete"
							variant="contained"
							className="rounded rounded-3"
							size="medium"
							onClick={hanldeConfirmOpen}
							startIcon={<DeleteIcon />}
							color="error"
							sx={{
								whiteSpace: "nowrap",
								fontSize: "12px",
							}}
						/>
					)}
					<CreateWrapper open={editMode}>
						{value === 0 && (
							<AddQuestionJSX
								handleClose={handleClose}
								handleRender={RendererFunction}
								editMode={editFlashCard}
								data={editableData}
							/>
						)}
						{value === 1 && (
							<ManageQuiz
								handleClose={handleClose}
								handleRender={RendererFunction}
								id={editableData?.id}
							/>
						)}
					</CreateWrapper>
				</div>
			</div>

			<UIModal
				open={confirmDelete}
				handleClose={handleConfirmDeleteClose}
				closeOnBackdropClick={false}
			>
				<div>
					<div className="fs-4 mb-3 text-center">
						<h6 style={{ fontWeight: "bold" }}>
							Are you sure you want to delete ?
						</h6>
						<span style={{ textAlign: "center", fontSize: "14px" }}>
							{`This action cannot be undone. Do you really want to delete ${selectedRows?.length > 1 ? "these" : "this"}
							${value === 0 ? "Flash Card" : "Quiz Question"}${selectedRows?.length > 1 ? "s" : ""}?`}
						</span>
					</div>
					<div className="d-flex justify-content-between align-items-center gap-2">
						<UIButton
							text="no"
							variant={"contained"}
							onClick={handleConfirmDeleteClose}
							size="small"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={deleteLoading ? <CommonProgress /> : "yes"}
							onClick={handleBulkDelete}
							variant={"contained"}
							color="error"
							size="small"
							disable={deleteLoading}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>

			{/* Content */}

			<div
				style={{ height: "92%", overflow: "auto" }}
				className="flex-grow-1 overflow-auto"
				key={renderer}
			>
				<TabPanel
					className="rounded-bottom-4 h-100"
					value={value}
					index={0}
					key="test-config-tabpanel-0"
				>
					<FlashPage
						selectedRows={selectedRows}
						setSelectedRows={setSelectedRows}
						searchText={searchText}
						handleEdit={handleEditQuestion}
					/>
				</TabPanel>
				<TabPanel
					className="rounded-bottom-4 h-100"
					value={value}
					index={1}
					key="test-config-tabpanel-1"
				>
					<QuestionPage
						selectedRows={selectedRows}
						setSelectedRows={setSelectedRows}
						searchText={searchText}
						handleEdit={handleEditQuestion}
					/>
				</TabPanel>
			</div>
		</div>
	);
};

export default QuizConfig;
