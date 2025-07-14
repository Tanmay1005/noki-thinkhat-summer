import {
	Add as AddIcon,
	PlaylistAdd as AddToListIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	ExpandLess as ExpandLessIcon,
	ExpandMore as ExpandMoreIcon,
	PostAdd as NewSectionIcon,
	Remove as RemoveIcon,
} from "@mui/icons-material";
import CommentIcon from "@mui/icons-material/Comment";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import {
	Box,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	GET_CASE_SCORE_BY_ID,
	UPDATE_CASE_SCORE_BY_ID,
} from "adapters/noki_ed.service";
import FallBackLoader from "components/FallbackLoader";
import { useQuery } from "hooks/useQuery";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const EditableSummary = ({ patientId, attemptId, type }) => {
	const [fetchedCaseScore, setFetchedCaseScore] = useState(null);
	const [jsonData, setJsonData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [expandedSections, setExpandedSections] = useState({});
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogType, setDialogType] = useState("edit");
	const [editPath, setEditPath] = useState("");
	const [editValue, setEditValue] = useState("");
	const [newSectionName, setNewSectionName] = useState("");
	const [fieldType, setFieldType] = useState("string");
	const [arrayValues, setArrayValues] = useState([""]);
	const [tempArrayValue, setTempArrayValue] = useState("");
	const [_editKey, setEditKey] = useState("");
	const [status, setStatus] = useState();
	const [questionnaireResponseId, setQuestionnaireResponseId] = useState("");
	const query = useQuery();
	const queryPatientId = query.get("patientId");
	const queryAttemptId = query.get("attemptId");
	const queryType = query.get("type");
	const newSectionRef = useRef(null);
	const getCaseScoreById = async () => {
		const id = queryPatientId || patientId;
		try {
			setLoading(true);
			const response = await GET_CASE_SCORE_BY_ID({
				patientId: id,
			});

			const data =
				response?.data?.entries[0]?.resource?.item[0]?.answer[0]?.valueString;
			setQuestionnaireResponseId(response?.data?.entries[0]?.resource?.id);
			if (data) {
				const parsedData = JSON.parse(data);
				setFetchedCaseScore(parsedData?.value);
				setJsonData(parsedData?.value); // Initialize jsonData with fetched data
			}
		} catch (error) {
			console.error("Error fetching JSON:", error);
		} finally {
			setLoading(false);
		}
	};

	const { handleSubmit, reset } = useForm({
		defaultValues: {
			jsonData: fetchedCaseScore,
		},
	});

	useEffect(() => {
		getCaseScoreById();
	}, []);

	useEffect(() => {
		if (status === "save" || status === "submit") {
			handleSubmit(onSubmit)();
		}
	}, [status]);

	const onSubmit = async () => {
		try {
			setLoading(true);
			const payload = {
				caseScore: { value: { ...jsonData } },
				...(status === "submit" && { feedbackState: "completed" }),
				attemptId: queryAttemptId || attemptId,
				type: queryType || type,
			}; // Create payload with dynamic feedbackState
			await UPDATE_CASE_SCORE_BY_ID(questionnaireResponseId, payload);
		} catch (error) {
			console.error("Error updating case score:", error);
			toast.error("Failed to update case score. Please try again.");
		} finally {
			setLoading(false);
			toast.success(
				status === "save"
					? "Your changes have been saved as Draft."
					: "Score has been Reviewed Successfully.",
			);
		}
	};

	const toggleSection = (path) => {
		setExpandedSections((prev) => ({
			...prev,
			[path]: !prev[path],
		}));
	};

	const getValueAtPath = (obj, path) => {
		if (!path) return obj;
		const keys = path.split(".");
		return keys.reduce(
			(acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
			obj,
		);
	};

	const setValueAtPath = (obj, path, value) => {
		const newObj = JSON.parse(JSON.stringify(obj));
		if (!path) return value;

		const keys = path.split(".");
		let current = newObj;

		for (let i = 0; i < keys.length - 1; i++) {
			if (!(keys[i] in current)) {
				current[keys[i]] = {};
			}
			current = current[keys[i]];
		}

		current[keys[keys.length - 1]] = value;
		return newObj;
	};

	const handleEdit = (path, currentValue) => {
		setDialogType("edit");
		setEditPath(path);
		setEditValue(
			typeof currentValue === "object"
				? JSON.stringify(currentValue)
				: String(currentValue),
		);
		setOpenDialog(true);
	};

	const handleEditKey = (oldKey, path) => {
		setDialogType("editKey");
		setEditKey(oldKey);
		setEditPath(path);
		setNewSectionName(oldKey);
		setOpenDialog(true);
	};

	const handleAddToArray = (path) => {
		setDialogType("addToArray");
		setEditPath(path);
		setEditValue("");
		setOpenDialog(true);
	};

	const handleNewSection = (path) => {
		setDialogType("newSection");
		setEditPath(path);
		setNewSectionName("");
		setOpenDialog(true);
	};

	const handleNewKeyValue = (path) => {
		setDialogType("newKeyValue");
		setEditPath(path);
		setNewSectionName("");
		setEditValue("");
		setFieldType("string");
		setArrayValues([""]);
		setTempArrayValue("");
		setOpenDialog(true);
	};

	const handleAddArrayValue = () => {
		if (tempArrayValue.trim()) {
			setArrayValues([...arrayValues, tempArrayValue.trim()]);
			setTempArrayValue("");
		}
	};

	const handleRemoveArrayValue = (index) => {
		setArrayValues(arrayValues.filter((_, i) => i !== index));
	};

	const handleDelete = (path) => {
		const keys = path.split(".");
		const newData = JSON.parse(JSON.stringify(jsonData));

		let current = newData;
		for (let i = 0; i < keys.length - 1; i++) {
			current = current[keys[i]];
		}

		const lastKey = keys[keys.length - 1];
		if (Array.isArray(current[lastKey])) {
			delete current[lastKey]; // Remove empty array completely
		} else {
			delete current[lastKey];
		}

		setJsonData(newData);
	};

	const handleAddComments = () => {
		const newData = { ...jsonData };
		if (!newData.comments) {
			// Add comments section with a placeholder
			newData.comments = "Add your comment here...";
			setJsonData(newData);

			// Expand the comments section
			setExpandedSections((prev) => ({
				...prev,
				comments: true,
			}));

			// Schedule scroll and focus to comments section
			setTimeout(() => {
				const element = document.getElementById("section-comments");
				if (element) {
					element.scrollIntoView({ behavior: "smooth", block: "center" });
					element.focus();

					// Automatically open edit dialog for the feedback field
					handleEdit("Comments", "Add your comment here...");
				}
			}, 100);
		}
	};

	const handleSave = () => {
		let newData = { ...jsonData };
		let newPath = "";

		switch (dialogType) {
			case "addToArray": {
				const array = getValueAtPath(newData, editPath);
				if (Array.isArray(array)) {
					newData = setValueAtPath(newData, editPath, [...array, editValue]);
					newPath = editPath;
				}
				break;
			}
			case "newSection": {
				if (newSectionName.trim()) {
					const targetValue = getValueAtPath(newData, editPath);
					if (Array.isArray(targetValue)) {
						newData = setValueAtPath(newData, editPath, {});
					}
					newPath = editPath ? `${editPath}.${newSectionName}` : newSectionName;
					newData = setValueAtPath(newData, newPath, {});
				}
				break;
			}
			case "newKeyValue": {
				if (newSectionName.trim()) {
					const valueToSet =
						fieldType === "array"
							? arrayValues.filter((v) => v.trim() !== "")
							: editValue;

					const targetValue = getValueAtPath(newData, editPath);
					if (Array.isArray(targetValue)) {
						newData = setValueAtPath(newData, editPath, {});
					}
					newPath = editPath ? `${editPath}.${newSectionName}` : newSectionName;
					newData = setValueAtPath(newData, newPath, valueToSet);
				}
				break;
			}
			case "edit": {
				try {
					const parsedValue = JSON.parse(editValue);
					newData = setValueAtPath(newData, editPath, parsedValue);
					newPath = editPath;
				} catch {
					newData = setValueAtPath(newData, editPath, editValue);
					newPath = editPath;
				}
				break;
			}
			case "editKey": {
				if (newSectionName.trim()) {
					const keys = editPath.split(".");
					const parentPath = keys.slice(0, -1).join(".");
					const parent = getValueAtPath(newData, parentPath);
					const oldKey = keys[keys.length - 1];

					if (parent && typeof parent === "object") {
						parent[newSectionName] = parent[oldKey];
						delete parent[oldKey];
						newData = { ...newData };
						newPath = parentPath
							? `${parentPath}.${newSectionName}`
							: newSectionName;
					}
				}
				break;
			}
		}

		setJsonData(newData);
		reset({ jsonData: newData });
		setOpenDialog(false);

		// Expand all parent sections
		if (newPath) {
			const pathParts = newPath.split(".");
			const expandPaths = {};
			let currentPath = "";

			for (const part of pathParts) {
				currentPath = currentPath ? `${currentPath}.${part}` : part;
				expandPaths[currentPath] = true;
			}

			setExpandedSections((prev) => ({
				...prev,
				...expandPaths,
			}));

			// Schedule scroll to new section
			setTimeout(() => {
				const element = document.getElementById(`section-${newPath}`);
				if (element) {
					element.scrollIntoView({ behavior: "smooth", block: "center" });
					element.focus();
				}
			}, 100);
		}
	};

	const isMainParentKey = (path) => {
		return !path.includes(".");
	};

	const renderJson = (obj, path = "") => {
		if (!obj) return null;

		return Object.entries(obj).map(([key, value]) => {
			const currentPath = path ? `${path}.${key}` : key;
			const isObject =
				typeof value === "object" && value !== null && !Array.isArray(value);
			const isArray = Array.isArray(value);
			const isExpanded = expandedSections[currentPath] ?? true;
			const isEmpty = isArray
				? value.length === 0
				: Object.keys(value).length === 0;
			const isParentKey = isMainParentKey(currentPath);
			if (isArray && isEmpty) return null;
			return (
				<Card
					key={currentPath}
					className="mb-3"
					variant="outlined"
					id={`section-${currentPath}`}
					tabIndex={0}
					ref={newSectionRef}
					style={{ outline: "none" }}
				>
					<CardContent className="p-0">
						<div
							className="d-flex align-items-center justify-content-between cursor-pointer p-0 border-0"
							onClick={() => toggleSection(currentPath)}
							role="button"
							tabIndex={-1}
							onKeyUp={(e) => {
								if (e.key === "Enter") {
									toggleSection(currentPath);
								}
							}}
						>
							<div className="d-flex align-items-center">
								<IconButton size="small" className="mr-2">
									{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
								</IconButton>
								<Typography
									variant="h6"
									component="div"
									className="d-flex align-items-center"
									style={{ fontWeight: "bold" }}
								>
									{key}
									{!isParentKey && (
										<Tooltip title="Edit Key">
											<IconButton
												size="small"
												color="primary"
												onClick={(e) => {
													e.stopPropagation();
													handleEditKey(key, currentPath);
												}}
											>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									)}
								</Typography>
							</div>
							<div className="d-flex gap-2">
								<Tooltip title="Add new section">
									<IconButton
										color="primary"
										onClick={(e) => {
											e.stopPropagation();
											handleNewSection(currentPath);
										}}
									>
										<NewSectionIcon />
									</IconButton>
								</Tooltip>
								<Tooltip title="Add new field">
									<IconButton
										color="primary"
										onClick={(e) => {
											e.stopPropagation();
											handleNewKeyValue(currentPath);
										}}
									>
										<AddIcon />
									</IconButton>
								</Tooltip>
								{isArray && (
									<Tooltip title="Add to list">
										<IconButton
											color="primary"
											onClick={(e) => {
												e.stopPropagation();
												handleAddToArray(currentPath);
											}}
										>
											<AddToListIcon />
										</IconButton>
									</Tooltip>
								)}
								{!isObject && (
									<Tooltip title="Edit">
										<IconButton
											color="primary"
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(currentPath, value);
											}}
										>
											<EditIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								)}
								{!isParentKey && (
									<Tooltip title="Delete">
										<IconButton
											color="error"
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(currentPath);
											}}
										>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
								)}
							</div>
						</div>

						{isExpanded && (
							<Box sx={{ pl: 3 }}>
								{isObject ? (
									renderJson(value, currentPath)
								) : (
									<div className="bg-light p-3 rounded">
										{isArray ? (
											<ul className="list-group">
												{value.map((item, idx) => (
													<li
														key={`${idx + 1}`}
														className="list-group-item d-flex justify-content-between align-items-center"
													>
														{typeof item === "object" ? (
															<div className="w-100">
																{renderJson(item, `${currentPath}.${idx}`)}
															</div>
														) : (
															<>
																{String(item)}
																<div className="d-flex gap-2">
																	<IconButton
																		size="small"
																		color="primary"
																		onClick={() =>
																			handleEdit(`${currentPath}.${idx}`, item)
																		}
																	>
																		<EditIcon fontSize="small" />
																	</IconButton>
																	<IconButton
																		size="small"
																		color="error"
																		onClick={() =>
																			handleDelete(`${currentPath}.${idx}`)
																		}
																	>
																		<DeleteIcon fontSize="small" />
																	</IconButton>
																</div>
															</>
														)}
													</li>
												))}
											</ul>
										) : (
											<Typography variant="body1">{String(value)}</Typography>
										)}
									</div>
								)}
							</Box>
						)}
					</CardContent>
				</Card>
			);
		});
	};

	return (
		<div className="container py-4">
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<Typography variant="h4" component="h2">
						Edit Feedback
					</Typography>

					<div className="d-flex gap-2">
						<Tooltip title="Add Comments">
							<IconButton
								color="primary"
								onClick={(e) => {
									e.preventDefault();
									handleAddComments();
								}}
							>
								<CommentIcon />
							</IconButton>
						</Tooltip>

						<Tooltip title="Add new section">
							<IconButton
								color="primary"
								onClick={(e) => {
									e.stopPropagation();
									handleNewSection("");
								}}
							>
								<NewSectionIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Add new field">
							<IconButton
								color="primary"
								onClick={(e) => {
									e.stopPropagation();
									handleNewKeyValue("");
								}}
							>
								<AddIcon />
							</IconButton>
						</Tooltip>

						<Tooltip title="Save as Draft">
							<IconButton
								color="primary"
								onClick={(e) => {
									e.stopPropagation();
									setStatus("save");
								}}
							>
								<SaveAsIcon />
							</IconButton>
						</Tooltip>

						<Tooltip title="Finalize">
							<IconButton
								color="primary"
								onClick={(e) => {
									e.stopPropagation();
									setStatus("submit");
								}}
							>
								<SaveIcon />
							</IconButton>
						</Tooltip>
					</div>
				</div>

				<div>
					{loading ? (
						<>
							<FallBackLoader />
						</>
					) : !jsonData || Object.entries(jsonData).length === 0 ? (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100vh",
							}}
						>
							No Data Found
						</div>
					) : !jsonData || Object.entries(jsonData).length === 0 ? (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100vh",
							}}
						>
							No Data Found
						</div>
					) : (
						renderJson(jsonData)
					)}
				</div>
			</form>
			<Dialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					{dialogType === "addToArray"
						? "Add to List"
						: dialogType === "newSection"
							? "Add New Section"
							: dialogType === "newKeyValue"
								? "Add New Field"
								: dialogType === "editKey"
									? "Edit Key"
									: "Edit Value"}
				</DialogTitle>
				<DialogContent>
					{(dialogType === "newSection" ||
						dialogType === "newKeyValue" ||
						dialogType === "editKey") && (
						<TextField
							fullWidth
							label={dialogType === "editKey" ? "New Key Name" : "Field Name"}
							value={newSectionName}
							onChange={(e) => setNewSectionName(e.target.value)}
							className="mb-3 mt-2"
						/>
					)}

					{dialogType === "newKeyValue" && (
						<FormControl fullWidth className="mb-3">
							<InputLabel>Field Type</InputLabel>
							<Select
								value={fieldType}
								label="Field Type"
								onChange={(e) => {
									setFieldType(e.target.value);
									setEditValue("");
									setArrayValues([""]);
								}}
							>
								<MenuItem value="string">Single Value</MenuItem>
								<MenuItem value="array">Array</MenuItem>
							</Select>
						</FormControl>
					)}

					{dialogType === "newKeyValue" && fieldType === "array" ? (
						<div>
							<div className="d-flex gap-2 mb-3">
								<TextField
									fullWidth
									label="Add Array Value"
									value={tempArrayValue}
									onChange={(e) => setTempArrayValue(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddArrayValue();
										}
									}}
								/>
								<Button
									variant="contained"
									onClick={handleAddArrayValue}
									disabled={!tempArrayValue.trim()}
								>
									Add
								</Button>
							</div>

							<List dense>
								{arrayValues
									.filter((v) => v.trim() !== "")
									.map((value, index) => (
										<ListItem key={`${index + 1}`}>
											<ListItemText primary={value} />
											<ListItemSecondaryAction>
												<IconButton
													edge="end"
													size="small"
													onClick={() => handleRemoveArrayValue(index)}
												>
													<RemoveIcon />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
									))}
							</List>
						</div>
					) : (
						dialogType !== "newSection" &&
						dialogType !== "editKey" && (
							<TextField
								fullWidth
								multiline
								rows={4}
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								label="Value"
								className="mt-2"
							/>
						)
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)}>Cancel</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						disabled={
							(dialogType === "newKeyValue" && !newSectionName.trim()) ||
							(dialogType === "newKeyValue" &&
								fieldType === "array" &&
								arrayValues.filter((v) => v.trim() !== "").length === 0) ||
							(dialogType === "editKey" && !newSectionName.trim())
						}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default EditableSummary;
