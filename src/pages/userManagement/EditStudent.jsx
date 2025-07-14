import { Close } from "@mui/icons-material";

import {
	Checkbox,
	IconButton,
	ListItemText,
	MenuItem,
	TextField,
} from "@mui/material";
import FallBackLoader from "components/FallbackLoader";
import UIButton from "components/ReusableComponents/UIButton";
import { roles, specializations } from "helpers/constants";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
	GET_ALL_USER_GROUPS,
	GET_USER_BY_ID,
	UPDATE_USER,
} from "../../adapters/noki_ed.service";

const EditStudentJSX = ({ handleClose, handleRender, details }) => {
	const [loading, setLoading] = useState(true);
	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
		reset,
		watch,
	} = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			role: "",
			specialization: "",
			group: [],
		},
	});

	const [userData, setUserData] = useState(null);
	const [groups, setGroups] = useState([]);
	const selectedRole = watch("role");

	// Fetch user details
	const userDetails = async (id) => {
		try {
			const response = await GET_USER_BY_ID(id);
			setUserData(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	// Fetch groups list
	const groupList = async () => {
		try {
			const response = await GET_ALL_USER_GROUPS();
			setGroups(response?.data?.user_groups);
		} catch (e) {
			console.error(e);
		}
	};

	// Set form values once userData and groups are available
	useEffect(() => {
		if (userData) {
			const { name, email, role } = userData;
			const firstName = name.split(" ")[0];
			const lastName = name.split(" ").slice(1).join(" ");
			const specialization =
				userData?.fhirPractitioner?.qualification?.[0].code.text;
			const groups = userData?.user_group_assignments?.map(
				(item) => item.user_group?.id,
			);
			reset({
				firstName: firstName || "",
				lastName: lastName || "",
				email: email || "",
				role: role || "",
				specialization: specialization || "",
				group: groups,
			});

			setLoading(false);
		}
	}, [userData, groups, reset]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await groupList();
			await userDetails(details?.id);
		};

		fetchData();
	}, [details]);

	// Form submission handler
	const onSubmit = async (data) => {
		try {
			setLoading(true);

			const updateStudent = {
				user_id: userData?.id,
				fhir_practitioner_id: userData?.fhir_practitioner_id,
				firstName: data.firstName,
				lastName: data.lastName,
				groups: data.group,
				specialization: data.specialization,
				oldGroups: userData?.user_group_assignments,
				role: data?.role,
			};

			const response = await UPDATE_USER(updateStudent);

			if (response.error) {
				throw new Error(response.error.message);
			}
			toast.success("User updated successfully");
			handleRender();
			handleClose();
		} catch (err) {
			const errorMessage =
				err?.response?.data?.error || err?.message || "Failed to update user";
			toast.error(errorMessage);
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
					<h4>Edit User</h4>
				</div>
				<UIButton
					text="Save"
					variant="contained"
					size="large"
					disabled={loading || !isDirty}
					onClick={handleSubmit(onSubmit)}
				/>
			</div>

			{loading ? (
				<div className="d-flex justify-content-center align-items-center h-50">
					<FallBackLoader /> {/* Loading indicator */}
				</div>
			) : (
				<div className="border border-1 rounded-4 m-3">
					<form onSubmit={handleSubmit(onSubmit)} className="p-4">
						<h4>Details</h4>

						<div>
							<div className="row mb-3">
								<div className="col-md-4 mt-3">
									<Controller
										name={"firstName"}
										control={control}
										rules={{ required: "* First Name is required" }}
										render={({ field }) => (
											<TextField
												{...field}
												onChange={(e) =>
													field.onChange(e.target.value.trimStart())
												}
												onBlur={(e) => field.onChange(e.target.value.trim())}
												label="First Name *"
												variant="outlined"
												fullWidth
												error={!!errors?.firstName}
												helperText={errors?.firstName?.message}
											/>
										)}
									/>
								</div>

								<div className="col-md-4 mt-3">
									<Controller
										name={"lastName"}
										control={control}
										rules={{ required: "* Last Name is required" }}
										render={({ field }) => (
											<TextField
												{...field}
												onChange={(e) =>
													field.onChange(e.target.value.trimStart())
												}
												onBlur={(e) => field.onChange(e.target.value.trim())}
												label="Last Name *"
												variant="outlined"
												fullWidth
												error={!!errors?.lastName}
												helperText={errors?.lastName?.message}
											/>
										)}
									/>
								</div>

								<div className="col-md-4 mt-3">
									<Controller
										name={"email"}
										control={control}
										rules={{
											required: "* Email is required",
											pattern: {
												value:
													/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,

												message: "Invalid email address",
											},
										}}
										render={({ field }) => (
											<TextField
												{...field}
												disabled
												label="Email ID *"
												variant="outlined"
												fullWidth
												type="email"
												error={!!errors?.email}
												helperText={errors?.email?.message}
											/>
										)}
									/>
								</div>

								<div className="col-md-4 mt-3">
									<Controller
										name={"role"}
										control={control}
										rules={{
											required: "* Role is required",
										}}
										render={({ field }) => (
											<TextField
												{...field}
												disabled={userData?.user_group_assignments?.length > 0}
												label="Role *"
												variant="outlined"
												fullWidth
												select
												error={!!errors?.role}
												helperText={errors?.role?.message}
											>
												{roles?.map((item, idx) => (
													<MenuItem key={`role-${idx + 1}`} value={item.value}>
														{item.label}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</div>

								{selectedRole === "student" && (
									<>
										<div className="col-md-4 mt-3">
											<Controller
												name={"specialization"}
												control={control}
												// rules={{ required: "* Specialization is required" }}
												render={({ field }) => (
													<TextField
														{...field}
														label="Specialization"
														variant="outlined"
														fullWidth
														select
														error={!!errors?.specialization}
														helperText={errors?.specialization?.message}
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
										</div>

										<div className="col-md-4 mt-3">
											<Controller
												name={"group"}
												control={control}
												// rules={{ required: "* Group is required" }}
												render={({ field }) => (
													<TextField
														{...field}
														label="Group"
														variant="outlined"
														fullWidth
														select
														multiple
														value={
															Array.isArray(field.value) ? field.value : []
														}
														error={!!errors?.group}
														helperText={errors?.group?.message}
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
														{groups?.length ? (
															groups?.map((item, _idx) => (
																<MenuItem key={item.id} value={item.id}>
																	<Checkbox
																		checked={field.value?.includes(item.id)}
																	/>
																	<ListItemText primary={item.name} />
																</MenuItem>
															))
														) : (
															<MenuItem
																disabled={true}
																onClick={(e) => e?.preventDefault()}
															>
																<ListItemText primary={"No Group Found."} />
															</MenuItem>
														)}
													</TextField>
												)}
											/>
										</div>
									</>
								)}
							</div>
						</div>
					</form>
				</div>
			)}
		</>
	);
};
export default EditStudentJSX;
