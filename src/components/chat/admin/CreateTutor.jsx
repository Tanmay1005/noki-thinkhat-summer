import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const { Popover, FormHelperText } = require("@mui/material");
const { CREATE_TUTOR } = require("adapters/ai_tutor.service");
const { default: UIButton } = require("components/ReusableComponents/UIButton");
const {
	default: UIInputField,
} = require("components/ReusableComponents/UIInputField");
const { useReducer, useState } = require("react");
const { useNavigate } = require("react-router-dom");

const validateDisplayName = (name) => {
	if (!name || name.trim().length === 0) return "Display name is required.";
	if (name.length < 3 || name.length > 63)
		return "Display name must be between 3 and 63 characters.";
	return "";
};

const initialState = {
	displayName: "",
	label: "",
	isFormTriggered: false,
	error: "",
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_DISPLAY_NAME": {
			const sanitizedValue = action.payload.replace(/[^a-zA-Z0-9 ]/g, "");
			const generatedLabel = sanitizedValue.replace(/\s+/g, "").toLowerCase();

			return {
				...state,
				displayName: sanitizedValue,
				label: generatedLabel,
				error: state.isFormTriggered ? validateDisplayName(sanitizedValue) : "",
			};
		}
		case "TRIGGER_FORM":
			return {
				...state,
				isFormTriggered: true,
				error: validateDisplayName(state.displayName),
			};
		case "RESET_FORM":
			return initialState;
		default:
			return state;
	}
}

const CreateTutor = ({ disabled = false }) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [loading, setLoading] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const userId = useSelector((state) => state.auth.personData.id);
	const open = Boolean(anchorEl);
	const navigate = useNavigate();

	const handleClick = (event) => setAnchorEl(event.currentTarget);
	const handleClose = () => {
		setAnchorEl(null);
		dispatch({ type: "RESET_FORM" });
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "displayName") {
			dispatch({ type: "SET_DISPLAY_NAME", payload: value });
		}
	};

	const handleCreate = async () => {
		dispatch({ type: "TRIGGER_FORM" });

		if (
			!state.displayName ||
			state.error ||
			validateDisplayName(state.displayName)
		)
			return;
		try {
			setLoading(true);
			const payload = {
				name: state?.displayName,
				instructions: "",
				label: state?.label,
				created_by: userId,
			};
			const response = await CREATE_TUTOR(payload);
			if (response?.data?.id) {
				navigate(`/ai-tutor/${response?.data?.id}`);
			}

			handleClose();
		} catch (e) {
			console.error(e);
			toast.error(
				e?.message
					? e?.message
					: e
						? e
						: "Something went wrong while create tutor.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div>
				<UIButton
					text="Create Tutor"
					onClick={handleClick}
					disabled={disabled}
				/>
			</div>
			<Popover
				open={open}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
			>
				<div className="p-2 px-3" style={{ width: 300 }}>
					<div className="fs-5">Create Tutor</div>

					<div className="mb-2">
						<UIInputField
							size="small"
							label="Display Name"
							name="displayName"
							value={state.displayName}
							onChange={handleChange}
							isRequired={true}
							error={!!state.error}
							autoFocus
							disabled={loading}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreate();
								}
							}}
						/>
						{state.error && (
							<FormHelperText error>{state.error}</FormHelperText>
						)}
					</div>

					<div className="mb-2">
						<UIInputField
							size="small"
							label="Label"
							name="label"
							value={state.label}
							disabled
						/>
					</div>

					<div className="mt-2 d-flex justify-content-between gap-2">
						<UIButton
							text="Cancel"
							sx={{ width: "100%", textTransform: "none" }}
							onClick={handleClose}
							color="error"
							disabled={loading}
						/>
						<UIButton
							text={loading ? "Creating Tutor..." : "Create"}
							sx={{ width: "100%", textTransform: "none" }}
							onClick={handleCreate}
							disabled={loading}
						/>
					</div>
				</div>
			</Popover>
		</>
	);
};

export default CreateTutor;
