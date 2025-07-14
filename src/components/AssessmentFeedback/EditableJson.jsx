import {
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import {
	GET_CASE_SCORE_BY_ID,
	GET_INTEGRATED_CASE_BY_PATIENT_ID,
	UPDATE_CASE_SCORE_BY_ID,
} from "adapters/noki_ed.service";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import { convertHtmlToText, getScore } from "helpers/common_helper";
import { stationRequiresDocumentation } from "helpers/station_helpers";
import { useQuery } from "hooks/useQuery";
import _, { capitalize } from "lodash";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RubricsTable from "./RubricsTable";

function EditableJson({
	onDataChange,
	patientId,
	attemptId,
	station,
	type,
	setDisableTabs,
	setDataChanged,
	setTitle,
	email,
}) {
	const [loading, setLoading] = useState(true);
	const [caseDetailsLoader, setCaseDetailsLoader] = useState(false);
	const [saveButtonLoading, setSaveButtonLoading] = useState(false);
	const [finalizeButtonLoading, setFinalizeButtonLoading] = useState(false);
	const [disableEdit, setDisableEdit] = useState(false);
	const [questionnaireResponseId, setQuestionnaireResponseId] = useState("");
	const [caseDetailsView, setCaseDetailsView] = useState([]);
	const [data, setData] = useState({});
	const [hasData, setHasData] = useState(false);
	const [editingState, setEditingState] = useState({
		path: null,
		type: null, // 'key-value', 'object', or 'array'
	});
	const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
	const [commentText, setCommentText] = useState("");
	const [openRubricsTable, setOpenRubricsTable] = useState(false);
	const [rubricsData, setRubricsData] = useState([]);
	const [attemptedDate, setAttemptedDate] = useState(null);
	const [originalData, setOriginalData] = useState({
		caseScore: {},
		rubrics: [],
	});
	const [transcriptDialog, setTranscriptDialog] = useState(false);
	const [showTranscript, setShowTranscript] = useState([]);
	const [stationDetails, setStationDetails] = useState({});
	const [open, setOpen] = useState(false);
	const [finalizeOpen, setFinalizeOpen] = useState(false);
	const query = useQuery();
	const queryPatientId = query.get("patientId");
	const queryAttemptId = query.get("attemptId");
	const queryType = query.get("type");
	const chipStyles = {
		color: "#fff",
		fontWeight: "700",
		borderRadius: "8px",
		height: "1.5rem",
	};

	useEffect(() => {
		const dataChanged = !_.isEqual(originalData.caseScore, data);
		const rubricsChanged =
			originalData?.rubrics?.length > 0 &&
			rubricsData?.length > 0 &&
			!_.isEqual(originalData.rubrics, rubricsData);
		if (dataChanged || rubricsChanged) {
			setDataChanged(true);
		} else {
			setDataChanged(false);
		}
	}, [data, rubricsData]);

	const currentAttemptId = queryAttemptId || attemptId;

	function getValueByLinkId(data, linkId) {
		const item = data?.item?.find((entry) => entry.linkId === linkId);
		if (!item || !item.answer || item.answer.length === 0) {
			return null;
		}
		const value = item.answer[0].valueString;
		try {
			return typeof value === "string" ? JSON.parse(value) : value;
		} catch (error) {
			console.error(error);
			return value;
		}
	}

	const handleCaseDetails = async () => {
		try {
			setCaseDetailsLoader(true);
			const response = await GET_INTEGRATED_CASE_BY_PATIENT_ID(patientId);
			setCaseDetailsView(response?.data);
		} catch (error) {
			console.error("Error fetching case details:", error);
		} finally {
			setCaseDetailsLoader(false);
		}
	};

	const getCaseScoreById = async () => {
		const id = queryPatientId || patientId;
		try {
			setLoading(true);
			if (type === "circuits") {
				setDisableTabs(true);
			}
			const response = await GET_CASE_SCORE_BY_ID({
				patientId: id,
				attemptId: [currentAttemptId],
				station: station,
			});
			const resources = response?.data?.entries[0]?.resource?.item?.reduce(
				(acc, curr) => {
					const { linkId, answer } = curr;
					acc[linkId] = answer?.[0] ? { ...answer[0] } : {};
					return acc;
				},
				{},
			);
			const data = resources?.["case-score"]?.valueString;
			let rubricsData = resources?.rubrics?.valueString;
			if (rubricsData) {
				rubricsData = JSON.parse(rubricsData);
				setOriginalData({
					rubrics: rubricsData?.value?.Sections,
				});
			}
			setRubricsData(rubricsData?.value?.Sections);
			setQuestionnaireResponseId(response?.data?.entries[0]?.resource?.id);
			setAttemptedDate(response?.data?.entries[0]?.resource?.authored);
			setStationDetails(JSON.parse(resources?.stationDetails?.valueString));
			const parsedTranscript = getValueByLinkId(
				response?.data?.entries[0]?.resource,
				"transcript",
			);
			setShowTranscript(parsedTranscript?.value);
			if (
				response?.data?.entries[0]?.resource?.text?.div?.includes("completed")
			) {
				setDisableEdit(true);
				setTitle("View Score");
			} else {
				setTitle("Edit Score");
			}
			if (data) {
				const parsedData = JSON.parse(data);
				setOriginalData({
					caseScore: parsedData?.value,
				});
				const { score, total } = getScore(rubricsData);
				setData({
					...parsedData?.value,
					"Overall Score": `${score} / ${total}`,
				}); // Initialize jsonData with fetched data
				setHasData(true);
			} else {
				setHasData(false);
			}
		} catch (error) {
			console.error("Error fetching JSON:", error);
			toast.error("Failed to fetch data ", error.message);
			setHasData(false);
		} finally {
			setLoading(false);
			if (type === "circuits") {
				setDisableTabs(false);
			}
		}
	};

	useEffect(() => {
		getCaseScoreById();
	}, []);

	const updateData = (newData) => {
		setData(newData);
		if (onDataChange) onDataChange(newData);
	};

	const getNestedValue = (obj, path) => {
		return path.reduce((acc, key) => acc[key], obj);
	};

	const setNestedValue = (obj, path, value) => {
		const lastKey = path[path.length - 1];
		const parent = path.slice(0, -1).reduce((acc, key) => acc[key], obj);
		parent[lastKey] = value;
	};

	const handleDeleteKey = (path, keyToDelete) => {
		const updated = structuredClone(data);
		const obj = getNestedValue(updated, path);
		delete obj[keyToDelete];
		updateData(updated);
	};

	const handleAddKey = (path) => {
		setEditingState({ path, type: "key-value" });
	};

	const handleAddObject = (path) => {
		setEditingState({ path, type: "object" });
	};

	const handleDeleteArrayItem = (path, index) => {
		const updated = structuredClone(data);
		const arr = getNestedValue(updated, path);
		arr.splice(index, 1);
		updateData(updated);
	};

	const handleAddArrayItem = (path) => {
		setEditingState({ path, type: "array" });
	};

	const handleSubmitNewKeyValue = (path, key, value) => {
		const updated = structuredClone(data);
		const obj = getNestedValue(updated, path);
		obj[key] = value;
		updateData(updated);
		setEditingState({ path: null, type: null });
	};

	const handleSubmitNewObject = (path, key) => {
		const updated = structuredClone(data);
		const obj = getNestedValue(updated, path);
		obj[key] = {};
		updateData(updated);
		setEditingState({ path: null, type: null });
	};

	const handleSubmitNewArrayItem = (path, value) => {
		const updated = structuredClone(data);
		const arr = getNestedValue(updated, path);
		arr.push(value);
		updateData(updated);
		setEditingState({ path: null, type: null });
	};

	const handleAddArrayObject = (path) => {
		setEditingState({ path, type: "array-object" });
	};

	const handleSubmitNewArrayObject = (path, key) => {
		const updated = structuredClone(data);
		const obj = getNestedValue(updated, path);
		obj[key] = []; // Initialize with empty array
		updateData(updated);
		setEditingState({ path: null, type: null });
	};

	const handleAddComments = () => {
		setIsCommentModalOpen(true);
	};

	const handleCommentSubmit = () => {
		const updated = structuredClone(data);
		updated.Comment = commentText;
		updateData(updated);
		setIsCommentModalOpen(false);
		setCommentText("");
	};

	const handleCommentCancel = () => {
		setIsCommentModalOpen(false);
		setCommentText("");
	};
	const payload = {
		caseScore: { value: { ...data } },
		rubrics: { value: { Sections: rubricsData } },
		attemptId: currentAttemptId,
		type: queryType || type,
	};
	const handleSaveDraft = async () => {
		try {
			setSaveButtonLoading(true);
			await UPDATE_CASE_SCORE_BY_ID(questionnaireResponseId, payload);
			toast.success("Your changes have been saved as Draft.");
		} catch (error) {
			toast.error(
				"Failed to update case score. Please try again.",
				error.message,
			);
		} finally {
			setSaveButtonLoading(false);
			getCaseScoreById();
		}
	};
	const handleFinalize = () => {
		setFinalizeOpen(true);
	};
	const processFinalize = async () => {
		try {
			setFinalizeButtonLoading(true);
			await UPDATE_CASE_SCORE_BY_ID(questionnaireResponseId, {
				...payload,
				feedbackState: "completed",
				email: email,
			});
		} catch (error) {
			toast.error(
				"Failed to finalize case score. Please try again.",
				error.message,
			);
		} finally {
			setFinalizeButtonLoading(false);
			toast.success("Score has been Reviewed Successfully.");
			getCaseScoreById();
		}
	};

	const InlineKeyValueForm = ({ onSubmit, onCancel }) => {
		const [key, setKey] = useState("");
		const [value, setValue] = useState("");
		return (
			<div className="inlineForm">
				<input
					type="text"
					placeholder="Key"
					value={key}
					onChange={(e) => setKey(e.target.value)}
					className="inlineInput"
				/>
				<input
					type="text"
					placeholder="Value"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="inlineInput"
				/>
				<button
					type="button"
					onClick={() => onSubmit(key, value)}
					className="addButton"
					disabled={!key.trim() || !value.trim()}
				>
					Add
				</button>
				<button type="button" onClick={onCancel} className="deleteButton">
					Cancel
				</button>
			</div>
		);
	};

	const InlineObjectForm = ({
		onSubmit,
		onCancel,
		placeholder = "Section Name",
	}) => {
		const [key, setKey] = useState("");
		return (
			<div className="inlineForm">
				<input
					type="text"
					placeholder={placeholder}
					value={key}
					onChange={(e) => setKey(e.target.value)}
					className="inlineInput"
				/>
				<button
					type="button"
					onClick={() => onSubmit(key)}
					className="addButton"
					disabled={!key.trim()}
				>
					Add
				</button>
				<button type="button" onClick={onCancel} className="deleteButton">
					Cancel
				</button>
			</div>
		);
	};

	const InlineArrayForm = ({ onSubmit, onCancel }) => {
		const [value, setValue] = useState("");
		return (
			<div className="inlineForm">
				<input
					type="text"
					placeholder="Value"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="inlineInput"
				/>
				<button
					type="button"
					onClick={() => onSubmit(value)}
					className="addButton"
					disabled={!value.trim()}
				>
					Add
				</button>
				<button type="button" onClick={onCancel} className="deleteButton">
					Cancel
				</button>
			</div>
		);
	};

	const handleContentEdit = (path, isKey, oldKey, event) => {
		const newValue = event.target.innerText.trim();
		const updated = structuredClone(data);
		if (!newValue) {
			if (isKey) {
				event.target.innerText = oldKey;
				toast.error("Key/Value cannot be empty");
			} else {
				event.target.innerText = getNestedValue(updated, path);
				toast.error("Value cannot be empty");
			}
			return;
		}

		if (isKey) {
			const obj = getNestedValue(updated, path);
			// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
			if (obj && !obj.hasOwnProperty(newValue)) {
				obj[newValue] = obj[oldKey];
				delete obj[oldKey];
				updateData(updated);
			}
		} else {
			setNestedValue(updated, path, newValue);
			updateData(updated);
		}
	};

	// Add new state for collapsed sections
	const [collapsedSections, setCollapsedSections] = useState(new Set());

	const toggleSection = (path) => {
		const pathString = path.join(".");
		setCollapsedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(pathString)) {
				newSet.delete(pathString);
			} else {
				newSet.add(pathString);
			}
			return newSet;
		});
	};

	const isTopLevelKey = (path) => {
		return path.length === 0;
	};

	// UI rendering functions
	const renderValue = (value, path) => {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			return renderObject(value, path);
		}
		if (Array.isArray(value)) {
			return renderArray(value, path);
		}
		return renderPrimitive(value, path);
	};

	const renderObject = (value, path) => {
		const pathString = path.join(".");
		const isTop = isTopLevelKey(path);

		// Defines the desired order of the sections
		const orderedSections = ["Overall Score", "Comment"];

		// Sort entries based on the above order
		const entries = Object.entries(value).sort(([keyA], [keyB]) => {
			const indexA = orderedSections.indexOf(keyA);
			const indexB = orderedSections.indexOf(keyB);

			// If both keys are in orderedSections, sort by their index (First will be first and so on)
			if (indexA !== -1 && indexB !== -1) {
				return indexA - indexB;
			}
			// If only keyA is in orderedSections, it should come first
			if (indexA !== -1) return -1;
			// If only keyB is in orderedSections, it should come first
			if (indexB !== -1) return 1;
			// If neither key is in orderedSections, maintain original order
			return 0;
		});

		return (
			<div className="section">
				{entries.map(([key, val]) => {
					const isSimpleValue = typeof val === "string";

					return (
						<div
							key={key}
							className={isSimpleValue ? "inlineEntry" : undefined}
						>
							<div className="heading">
								{typeof val === "object" && (
									<span
										className="collapseToggle"
										onClick={() => toggleSection([...path, key])}
										onKeyDown={() => toggleSection([...path, key])}
									>
										{collapsedSections.has([...path, key].join("."))
											? "+"
											: "-"}
									</span>
								)}
								<span
									contentEditable={!isTop && !disableEdit}
									suppressContentEditableWarning
									onBlur={(e) =>
										!isTop && handleContentEdit(path, true, key, e)
									}
									className={isSimpleValue ? "keyName" : undefined}
								>
									{key}
								</span>
								{isSimpleValue && (
									<>
										<span>: </span>
										<span
											className="inlineValue"
											contentEditable={key !== "Overall Score" && !disableEdit}
											suppressContentEditableWarning
											onBlur={(e) =>
												handleContentEdit([...path, key], false, null, e)
											}
										>
											{val}
										</span>
									</>
								)}

								<div className="controls">
									&nbsp;&nbsp;
									{!isTop && !disableEdit && (
										<button
											type="button"
											className="deleteButton"
											onClick={() => handleDeleteKey(path, key)}
										>
											Remove
										</button>
									)}
								</div>
							</div>
							{!isSimpleValue &&
								!collapsedSections.has([...path, key].join(".")) &&
								renderValue(val, [...path, key])}
						</div>
					);
				})}
				{!disableEdit && (
					<div className="controls">
						<button
							type="button"
							className="addButton"
							onClick={() => handleAddKey(path)}
						>
							Add Property
						</button>
						<button
							type="button"
							className="addButton"
							onClick={() => handleAddObject(path)}
						>
							Add Section
						</button>
						<button
							type="button"
							className="addButton"
							onClick={() => handleAddArrayObject(path)}
						>
							Add List
						</button>
						{editingState.path?.join(".") === pathString && (
							<>
								{editingState.type === "key-value" && (
									<InlineKeyValueForm
										onSubmit={(key, value) =>
											handleSubmitNewKeyValue(path, key, value)
										}
										onCancel={() => setEditingState({ path: null, type: null })}
									/>
								)}
								{editingState.type === "object" && (
									<InlineObjectForm
										onSubmit={(key) => handleSubmitNewObject(path, key)}
										onCancel={() => setEditingState({ path: null, type: null })}
									/>
								)}
								{editingState.type === "array-object" && (
									<InlineObjectForm
										onSubmit={(key) => handleSubmitNewArrayObject(path, key)}
										onCancel={() => setEditingState({ path: null, type: null })}
										placeholder="List Name"
									/>
								)}
							</>
						)}
					</div>
				)}
			</div>
		);
	};

	const renderArray = (value, path) => (
		<div className="section">
			{value.map((item, index) => (
				<div key={`${index + 1}`} className="listItem">
					<div className="listContent">
						{renderValue(item, [...path, index])}
					</div>
					{!disableEdit && (
						<div className="listControls">
							<button
								type="button"
								className="deleteButton"
								onClick={() => handleDeleteArrayItem(path, index)}
							>
								x
							</button>
						</div>
					)}
				</div>
			))}
			{!disableEdit && (
				<div className="controls">
					<button
						type="button"
						className="addButton"
						onClick={() => handleAddArrayItem(path)}
					>
						Add Item
					</button>
					{editingState.path?.join(".") === path.join(".") &&
						editingState.type === "array" && (
							<InlineArrayForm
								onSubmit={(value) => handleSubmitNewArrayItem(path, value)}
								onCancel={() => setEditingState({ path: null, type: null })}
							/>
						)}
				</div>
			)}
		</div>
	);

	const renderPrimitive = (value, path) => (
		<div
			className="value"
			contentEditable={!disableEdit}
			suppressContentEditableWarning
			onBlur={(e) => handleContentEdit(path, false, null, e)}
		>
			{value}
		</div>
	);
	const handleOpenRubricsTable = () => {
		setOpenRubricsTable(true);
	};
	const calculateAverage = (_data) => {
		// const totalScore = data.reduce((acc, curr) => {
		// 	if (curr.Criteria) {
		// 		const score = curr.Criteria.reduce((acc, curr) => {
		// 			const parsedScore = Number(curr.Score);
		// 			return acc + (Number.isNaN(parsedScore) ? 0 : parsedScore);
		// 		}, 0);
		// 		return acc + score / curr.Criteria.length;
		// 	}
		// 	return acc;
		// }, 0);

		const { score, total } = getScore({ value: { Sections: rubricsData } });

		// const averageScore = totalScore / data.length;

		setData((prev) => ({
			...prev,
			"Overall Score": `${score} / ${total}`,
		}));

		return score;
	};
	return (
		<>
			<UIModal
				open={openRubricsTable}
				handleClose={() => setOpenRubricsTable(false)}
				width={600}
			>
				<div className="modal-body">
					<div className="d-flex flex-column justify-content-center align-items-center">
						<h6 style={{ fontWeight: "bold" }}>Edit Overall Score</h6>
					</div>
				</div>
				<RubricsTable
					data={rubricsData}
					setData={(newData) => {
						setRubricsData(newData);
						calculateAverage(newData);
					}}
					editable={!disableEdit}
				/>
			</UIModal>
			<UIModal
				open={finalizeOpen}
				handleClose={() => setFinalizeOpen(false)}
				width={400}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h6 style={{ fontWeight: "bold" }}>Are you sure?</h6>
							<span style={{ textAlign: "center" }}>
								You cannot edit once you finalize. Do you want to proceed?
							</span>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							text="Cancel"
							variant="outlined"
							onClick={() => {
								setFinalizeOpen(false);
							}}
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
						<UIButton
							text="Proceed"
							onClick={() => {
								setFinalizeOpen(false);
								processFinalize();
							}}
							variant="contained"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<div className="editableJson">
				<UIModal
					open={transcriptDialog}
					handleClose={() => setTranscriptDialog(false)}
					closeOnBackdropClick={true}
					width={600}
				>
					<>
						{" "}
						<h6
							style={{
								color: "#5D5FEF",
								fontWeight: 600,
								marginTop: "2px",
								fontSize: "16px",
							}}
						>
							Transcript{" "}
						</h6>
						{stationRequiresDocumentation?.[stationDetails?.type]?.length >
						0 ? (
							<>
								{Array.isArray(showTranscript)
									? showTranscript?.map((transcript) =>
											Object.entries(transcript).map(([key, value], index) => (
												<div
													className="p-2"
													key={`transcription-map-${index + 1}`}
												>
													<span style={{ color: "#5840BA" }}>
														{capitalize(key)}:
													</span>{" "}
													{typeof value === "object"
														? JSON.stringify(value)
														: value}
												</div>
											)),
										)
									: Object.entries(showTranscript).map(
											([key, value], index) => (
												<div
													className="p-2"
													key={`transcription-map-${index + 1}`}
												>
													<span style={{ color: "#5840BA" }}>
														{capitalize(key)}:
													</span>{" "}
													<span dangerouslySetInnerHTML={{ __html: value }} />
												</div>
											),
										)}
							</>
						) : (
							<div>
								{showTranscript?.filter(
									(item) =>
										!(
											item.speakerId?.toLowerCase() === "unknown" &&
											item.speakerText?.trim() === ""
										),
								).length === 0 ? (
									<div
										className="d-flex justify-content-center align-items-center h-100"
										style={{
											minHeight: "100%",
										}}
									>
										Transcript Not Found
									</div>
								) : (
									showTranscript
										?.filter(
											(item) =>
												!(
													item.speakerId?.toLowerCase() === "unknown" &&
													item.speakerText?.trim() === ""
												),
										)
										.map((item, index) => (
											<div
												className="p-2"
												key={`transcription-map-${index + 1}`}
											>
												<span style={{ color: "#5840BA" }}>
													{item?.speakerId}:
												</span>{" "}
												{item.speakerText}
											</div>
										))
								)}
							</div>
						)}
					</>
				</UIModal>

				<UIModal
					open={open}
					handleClose={() => setOpen(false)}
					closeOnBackdropClick={true}
					width={500}
				>
					<>
						{" "}
						<h6
							style={{
								color: "#5D5FEF",
								fontWeight: 600,
								marginTop: "2px",
								fontSize: "16px",
							}}
						>
							CASE DETAILS{" "}
						</h6>
						{caseDetailsView && (
							<div className="p-2" style={{ fontSize: "16px" }}>
								<div className="p-1">
									<span style={{ fontWeight: 600 }}>Case Name : </span>
									{caseDetailsView?.case?.[0]?.name}
								</div>
								<div className="p-1">
									<span style={{ fontWeight: 600 }}>Description :</span>{" "}
									<div
										className="editInnerHtml"
										dangerouslySetInnerHTML={{
											__html: caseDetailsView?.case?.[0]?.description,
										}}
									/>
								</div>
								<div className="p-1">
									<span style={{ fontWeight: 600 }}>Case Type :</span>{" "}
									{convertHtmlToText(caseDetailsView?.case?.[0]?.case_type)}
								</div>

								<div className="p-1">
									<span style={{ fontWeight: 600 }}>Station Type :</span>{" "}
									{caseDetailsView?.case?.[0]?.applicable_types
										?.map((o) => (Array.isArray(o) ? o.join(", ") : o))
										.join(", ")}
								</div>

								{attemptedDate && (
									<div className="p-1">
										<span style={{ fontWeight: 600 }}>Attempted At :</span>{" "}
										{dayjs(attemptedDate).format("MM/DD/YYYY hh:mm A")}
									</div>
								)}
							</div>
						)}
					</>
				</UIModal>
				{!loading && !disableEdit && (
					<div className="actionButtons">
						<button
							type="button"
							className={"actionButton caseDetails"}
							onClick={async () => {
								await handleCaseDetails();
								setOpen(true);
							}}
						>
							{caseDetailsLoader ? <CommonProgress /> : "Case Details"}
						</button>

						<button
							type="button"
							className={"actionButton transcript"}
							onClick={() => {
								setTranscriptDialog(true);
							}}
						>
							{loading ? <CommonProgress /> : "Transcript"}
						</button>

						{!data.Comment && (
							<button
								type="button"
								className={"actionButton addComment"}
								onClick={handleAddComments}
							>
								Add Comment
							</button>
						)}
						{rubricsData && (
							<button
								type="button"
								className={"actionButton rubricsScore"}
								onClick={handleOpenRubricsTable}
							>
								Edit Overall Score
							</button>
						)}
						<button
							type="button"
							className={"actionButton saveDraft"}
							onClick={handleSaveDraft}
						>
							{saveButtonLoading ? <CommonProgress /> : "Save Draft"}
						</button>
						<button
							type="button"
							className="actionButton finalize"
							onClick={handleFinalize}
						>
							{finalizeButtonLoading ? <CommonProgress /> : "Finalize"}
						</button>
					</div>
				)}
				{disableEdit && (
					<div className="actionButtons">
						<Chip
							label="Reviewed"
							sx={{
								...chipStyles,
								backgroundColor: "#4C9F72",
							}}
						/>
					</div>
				)}
				{/* Add the Comment Modal */}
				<Dialog open={isCommentModalOpen} onClose={handleCommentCancel}>
					<DialogTitle>Add Comment</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							label="Comment"
							type="text"
							fullWidth
							multiline
							rows={4}
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCommentCancel}>Cancel</Button>
						<Button
							onClick={handleCommentSubmit}
							variant="contained"
							color="primary"
						>
							Save Comment
						</Button>
					</DialogActions>
				</Dialog>

				{loading ? (
					<div className="loadingContainer">
						<CommonProgress />
					</div>
				) : !hasData ? (
					<div className="noData">No assessment data found</div>
				) : (
					renderValue(data, [])
				)}
			</div>
		</>
	);
}

export default EditableJson;
