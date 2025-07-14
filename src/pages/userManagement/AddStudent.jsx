import { AddCircleOutline, Close, DeleteOutline } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
	Checkbox,
	IconButton,
	InputAdornment,
	ListItemText,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { roles } from "helpers/constants";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
	CREATE_USER,
	GET_ALL_USER_GROUPS,
} from "../../adapters/noki_ed.service";
import doneIcon from "../../assets/student_done.svg";
import uploadIcon from "../../assets/upload_icon.svg";

const AddStudentJSX = ({ handleClose, handleRender }) => {
	const [loading, setLoading] = useState(false);
	const [passwordVisibility, setPasswordVisibility] = useState({});
	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [userCreationResponse, setUserCreationResponse] = useState({
		fail: {},
		success: {},
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
		trigger,
		watch,
	} = useForm({
		defaultValues: {
			students: [
				{
					firstName: "",
					lastName: "",
					email: "",
					role: "",
					password: "",
					specialization: "",
					groups: "",
				},
			],
		},
	});
	const [groups, setGroups] = useState([]);
	const groupList = async () => {
		try {
			const response = await GET_ALL_USER_GROUPS();
			setGroups(response?.data?.user_groups);
		} catch (e) {
			console.error(e);
		}
	};
	useEffect(() => {
		groupList();
	}, []);

	const { fields, append, remove } = useFieldArray({
		control,
		name: "students",
	});

	const showPassword = (index) => {
		setPasswordVisibility((prev) => ({
			...prev,
			[index]: true,
		}));
	};

	const hidePassword = (index) => {
		setPasswordVisibility((prev) => ({
			...prev,
			[index]: false,
		}));
	};

	const onSubmit = async (data) => {
		if (!data?.students || data.students.length === 0) {
			toast.error("No users provided for user creation.");
			return;
		}
		setLoading(true);
		try {
			const payload = data.students.filter(
				(student) =>
					student.firstName.trim() &&
					(userCreationResponse?.fail?.[student.email] ||
						!userCreationResponse?.success?.[student.email]),
			);

			const studentsLength = payload.length;
			const response = await CREATE_USER(payload);
			setUserCreationResponse((prev) => ({
				fail: response?.data?.fail,
				success: { ...prev.success, ...response?.data?.success },
			}));
			const failedStudentCreationLength = Object.keys(
				response?.data?.fail,
			).length;
			if (failedStudentCreationLength < 1) {
				handleRender();
				handleClose();
				toast.success(
					studentsLength > 1
						? "Users created successfully!"
						: "User created successfully!",
				);
				return;
			}
			const message =
				failedStudentCreationLength && studentsLength === 1
					? "User creation failed!"
					: failedStudentCreationLength === studentsLength
						? "Users creation failed!"
						: "Users creation failed partially!";
			toast.error(message);
			setIsFormSubmitted(true);
		} catch (err) {
			if (err.message?.includes("duplicate key")) {
				toast.error(`A user already exists with email: ${err?.details?.email}`);
			} else {
				toast.error(err?.message || "Error While Creating User");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="p-4 d-flex justify-content-between align-items-center border-bottom">
				<div className="d-flex align-items-center gap-4">
					<IconButton
						style={{ marginBottom: "8px" }}
						color="primary"
						onClick={handleClose}
					>
						<Close />
					</IconButton>
					<h4>Add User</h4>
				</div>
				<UIButton
					text={
						loading ? <CommonProgress /> : isFormSubmitted ? "Retry" : "Add"
					}
					variant="contained"
					size="large"
					disabled={loading}
					onClick={handleSubmit(onSubmit)}
				/>
			</div>

			<div className="border border-1 rounded-4 m-3">
				<form onSubmit={handleSubmit(onSubmit)} className="p-4">
					<h4>User Details</h4>

					{fields.map((field, index) => {
						const selectedRole = watch(`students.${index}.role`);
						const email = watch(`students.${index}.email`);
						const isFailed = userCreationResponse?.fail?.[email];
						const isSuccess = userCreationResponse?.success?.[email];
						const isDisabled = loading || isSuccess;
						return (
							<div key={`user-management-field-outer-${field?.id}-${index}`}>
								<div
									className="row mb-3"
									key={`user-management-row-${field.id}-${index}`}
								>
									<div
										className="row"
										key={`user-management-inner-row-${field.id}-${index}`}
									>
										{
											<>
												<div className="col-md-12">
													<div className="d-flex justify-content-between align-items-center">
														<h5>User {index + 1}</h5>
														{!isFormSubmitted && (
															<IconButton
																color="secondary"
																onClick={() => {
																	remove(index);
																}}
																disabled={fields.length === 1 && index === 0}
															>
																<DeleteOutline />
															</IconButton>
														)}
													</div>
												</div>
												{isFormSubmitted && (
													<div>
														{isFailed && (
															<Typography color="error">{`User Creation Failed ${isFailed?.error?.message || userCreationResponse?.fail?.[email]?.error}`}</Typography>
														)}
														{isSuccess && (
															<Typography color="#14A44D">
																User Created Successfully
															</Typography>
														)}
													</div>
												)}
											</>
										}
									</div>
									<div className="col-md-4 mt-3">
										<Controller
											name={`students.${index}.firstName`}
											control={control}
											rules={{
												required: "* First Name is required",
											}}
											render={({ field }) => (
												<TextField
													{...field}
													onBlur={(e) => field.onChange(e.target.value.trim())}
													label={
														<CustomFormLabel
															name="First Name"
															required={true}
														/>
													}
													variant="outlined"
													fullWidth
													disabled={isDisabled}
													error={!!errors?.students?.[index]?.firstName}
													helperText={
														errors?.students?.[index]?.firstName?.message
													}
													onChange={(e) => {
														field.onChange(e.target.value.replace(/^\s+/, ""));
													}}
												/>
											)}
										/>
									</div>

									<div className="col-md-4 mt-3">
										<Controller
											name={`students.${index}.lastName`}
											control={control}
											rules={{ required: "* Last Name is required" }}
											render={({ field }) => (
												<TextField
													{...field}
													onChange={(e) =>
														field.onChange(e.target.value.trimStart())
													}
													onBlur={(e) => field.onChange(e.target.value.trim())}
													label={
														<CustomFormLabel name="Last Name" required={true} />
													}
													disabled={isDisabled}
													variant="outlined"
													fullWidth
													error={!!errors?.students?.[index]?.lastName}
													helperText={
														errors?.students?.[index]?.lastName?.message
													}
												/>
											)}
										/>
									</div>
									<div className="col-md-4 mt-3">
										<Controller
											name={`students.${index}.email`}
											control={control}
											rules={{
												required: "* Email is required",
												pattern: {
													value:
														/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
													message: "Invalid email address",
												},
												validate: {
													unique: (value) => {
														const emails = control._formValues.students
															.slice(0, index + 1) // Only check up to the current index
															.map((student) => student.email);
														const isUnique =
															emails.filter((email) => email === value)
																.length <= 1;
														return (
															isUnique || "Each User must have a unique email."
														);
													},
												},
											}}
											render={({ field }) => (
												<TextField
													{...field}
													label={
														<CustomFormLabel name="Email ID" required={true} />
													}
													variant="outlined"
													fullWidth
													type="email"
													disabled={isDisabled}
													error={!!errors?.students?.[index]?.email}
													helperText={errors?.students?.[index]?.email?.message}
												/>
											)}
										/>
									</div>

									<div className="col-md-4 mt-3">
										<Controller
											name={`students.${index}.role`}
											control={control}
											rules={{
												required: "* Role is required",
											}}
											render={({ field }) => (
												<TextField
													{...field}
													label={
														<CustomFormLabel name="Role" required={true} />
													}
													variant="outlined"
													fullWidth
													select
													error={!!errors?.students?.[index]?.role}
													helperText={errors?.students?.[index]?.role?.message}
													disabled={isDisabled}
												>
													{roles?.map((item, idx) => (
														<MenuItem
															key={`add-student-jsx-menu-item-role-${idx + 1}`}
															value={item.value}
														>
															{item.label}
														</MenuItem>
													))}
												</TextField>
											)}
										/>
									</div>
									<div className="col-md-4 mt-3">
										<Controller
											name={`students.${index}.password`}
											control={control}
											rules={{
												required: "* Password is required",
												minLength: {
													value: 8,
													message: "Password must be at least 8 characters",
												},
												pattern: {
													value:
														/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]).*$/,
													message:
														"Passwords must include a combination of uppercase letters, lowercase letters, numbers, and special characters.",
												},
											}}
											render={({ field }) => (
												<TextField
													{...field}
													label={
														<CustomFormLabel name="Password" required={true} />
													}
													variant="outlined"
													fullWidth
													disabled={isDisabled}
													type={passwordVisibility[index] ? "text" : "password"}
													error={!!errors?.students?.[index]?.password}
													helperText={
														errors?.students?.[index]?.password?.message
													}
													InputProps={{
														endAdornment: (
															<InputAdornment position="end">
																<IconButton
																	aria-label="toggle password visibility"
																	onPointerDown={() => showPassword(index)}
																	onPointerUp={() => hidePassword(index)}
																	onPointerLeave={() => hidePassword(index)}
																	edge="end"
																>
																	{passwordVisibility[index] ? (
																		<VisibilityIcon size={20} />
																	) : (
																		<VisibilityOffIcon size={20} />
																	)}
																</IconButton>
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
									</div>
									{(selectedRole === "student" || !selectedRole) && (
										<>
											{/* <div className="col-md-4 mt-3">
												<Controller
													name={`students.${index}.specialization`}
													control={control}
													// rules={{ required: "* Specialization is required" }}
													render={({ field }) => (
														<TextField
															{...field}
															label="Specialization"
															variant="outlined"
															fullWidth
															select
															disabled={isDisabled}
															error={
																!!errors?.students?.[index]?.specialization
															}
															helperText={
																errors?.students?.[index]?.specialization
																	?.message
															}
														>
															{specializations?.map((item, idx) => (
																<MenuItem
																	key={`add-student-jsx-menu-item-${idx + 1}`} // Must be unique as we are using index
																	value={item.value}
																>
																	{item.label}
																</MenuItem>
															))}
														</TextField>
													)}
												/>
											</div> */}
											<div className="col-md-4 mt-3">
												<Controller
													name={`students.${index}.groups`}
													control={control}
													// rules={{ required: "* Group is required" }}
													render={({ field }) => (
														<TextField
															{...field}
															label="Groups"
															variant="outlined"
															fullWidth
															select
															multiple
															disabled={isDisabled}
															value={
																Array.isArray(field.value) ? field.value : []
															}
															error={!!errors?.students?.[index]?.groups}
															helperText={
																errors?.students?.[index]?.groups?.message
															}
															SelectProps={{
																multiple: true,
																renderValue: (selected) =>
																	selected
																		.map((id) => {
																			const selectedGroup = groups.find(
																				(group) => group.id === id,
																			);
																			return selectedGroup
																				? selectedGroup.name
																				: "";
																		})
																		.join(", "),
															}}
															onChange={(e) => field.onChange(e.target.value)}
														>
															{groups?.map((item, _idx) => (
																<MenuItem key={item.id} value={item.id}>
																	<Checkbox
																		checked={field.value?.includes(item.id)}
																	/>

																	<ListItemText primary={item.name} />
																</MenuItem>
															))}
														</TextField>
													)}
												/>
											</div>
										</>
									)}
								</div>
							</div>
						);
					})}

					{!isFormSubmitted && (
						<UIButton
							text="Add Another User"
							size="large"
							startIcon={<AddCircleOutline />}
							onClick={async () => {
								const result = await trigger();
								if (result) {
									if (fields?.length < 10) {
										append({
											firstName: "",
											lastName: "",
											email: "",
											role: "",
											password: "",
											//specialization: "",
											groups: "",
										});
									} else {
										toast.error("You cannot add more than 10 Users.");
									}
								}
							}}
						/>
					)}
				</form>
			</div>

			<MultipleStudentCreate />
		</>
	);
};
export default AddStudentJSX;

const MultipleStudentCreate = () => {
	const [open, setOpen] = useState(false);
	const [isDone, setIsDone] = useState(false);
	const [files, setFiles] = useState([]);

	const _handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setIsDone(false);
	};

	const handleDrop = (acceptedFiles) => {
		const filePreviews = acceptedFiles.map((file) =>
			Object.assign(file, {
				preview: URL.createObjectURL(file),
			}),
		);
		setFiles(filePreviews);
	};

	const {
		getRootProps,
		getInputProps,
		isDragActive = true,
	} = useDropzone({
		onDrop: handleDrop,
		accept: {
			"text/csv": [".csv"],
		},
		multiple: false,
	});

	useEffect(() => {
		return () => {
			setFiles([]);
		};
	}, []);

	return (
		<>
			{/* <UIButton
				text="Add Multiple Student"
				size="large"
				startIcon={<AddCircleOutline />}
				onClick={handleOpen}
				className="rounded rounded-pill px-3 ms-3"
			/> */}

			<UIModal
				open={open}
				handleClose={handleClose}
				closeOnBackdropClick={false}
			>
				{isDone ? (
					<div>
						<h4 className="text-center">User Added Successfully!</h4>
						<div className="d-flex justify-content-center align-items-center my-3">
							<img src={doneIcon} width={80} alt="done" />
						</div>
						<UIButton
							text="Done"
							className="rounded rounded-pill px-3 w-100"
							variant="contained"
							size="medium"
							style={{
								fontSize: "16px",
								backgroundColor: "#6A5ACD",
								padding: "10px 0",
								marginTop: "10px",
							}}
							onClick={handleClose}
						/>
					</div>
				) : (
					<div>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h5>Upload CSV Files</h5>
							<IconButton onClick={handleClose}>
								<Close />
							</IconButton>
						</div>

						{/* Drag and Drop Zone */}
						<div
							{...getRootProps()}
							className={`dropzone ${isDragActive ? "drag-active" : ""}`}
							style={{
								border: "2px dashed #6A5ACD",
								padding: "20px",
								borderRadius: "10px",
								textAlign: "center",
								cursor: "pointer",
							}}
						>
							<input {...getInputProps()} />
							{isDragActive ? (
								<p>Drop the files here...</p>
							) : (
								<p>
									Drag 'n' drop some CSV files here, or click to select files
								</p>
							)}
						</div>

						<div
							{...getRootProps()}
							className={`dropzone ${isDragActive ? "drag-active" : ""}`}
							style={{
								border: "2px dashed #6A5ACD",
								padding: "40px",
								borderRadius: "10px",
								textAlign: "center",
								cursor: "pointer",
								backgroundColor: "#f8f9fc",
								color: "#6A5ACD",
							}}
						>
							<input {...getInputProps()} />
							<div className="d-flex justify-content-center align-items-center my-3">
								<img src={uploadIcon} width={80} alt="done" />
							</div>
							<p
								className="mt-3"
								style={{ fontSize: "18px", fontWeight: "500" }}
							>
								Drag & drop files or{" "}
								<span
									style={{
										color: "#6A5ACD",
										textDecoration: "underline",
										cursor: "pointer",
									}}
								>
									Browse
								</span>
							</p>
							<p style={{ color: "#808080", fontSize: "14px" }}>
								Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
							</p>
						</div>

						{/* Display Uploaded Files */}
						<div className="uploaded-files mt-3">
							<h6>Uploaded Files:</h6>
							{files.length > 0 ? (
								<ul>
									{files.map((file, index) => (
										<li
											key={`multiple-student-create-files-map-${index + 1}`} // Must be unique as we are using index
										>
											{file.name}
										</li>
									))}
								</ul>
							) : (
								<p>No files uploaded yet.</p>
							)}
						</div>

						<UIButton
							text="Upload"
							className="rounded rounded-pill px-3 w-100"
							variant="contained"
							size="medium"
							sx={{
								fontSize: "16px",
								backgroundColor: "#6A5ACD",
								padding: "10px 0",
								marginTop: "10px",
							}}
							onClick={handleClose}
						/>
					</div>
				)}
			</UIModal>
		</>
	);
};
