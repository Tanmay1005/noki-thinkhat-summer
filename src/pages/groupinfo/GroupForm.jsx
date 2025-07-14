import { Box, TextField, Typography } from "@mui/material";
import {
	CREATE_USER_GROUPS,
	UPDATE_USER_GROUP,
} from "adapters/noki_ed.service";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import CommonProgress from "components/ReusableComponents/Loaders";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useUserType } from "hooks/useUserType";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const GroupForm = ({
	handleOpen,
	handleClose,
	onGroupCreated,
	currentGroups,
	group,
	mode,
}) => {
	const [loading, setLoading] = useState(false);
	const userRole = useUserType();

	const personData = useSelector((state) => state?.auth?.personData);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			groupName: "",
		},
	});

	useEffect(() => {
		if (mode === "edit" && group) {
			reset({
				groupName: group?.name || "",
			});
		} else {
			reset({
				groupName: "",
			});
		}
	}, [group, mode, reset]);

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			let response;
			if (mode === "edit") {
				response = await UPDATE_USER_GROUP({
					id: group?.id,
					name: data?.groupName,
					role: userRole?.toLowerCase(),
					updated_by: personData?.id,
					created_by: group?.created_by,
				});
			} else {
				response = await CREATE_USER_GROUPS({
					created_by: personData?.id,
					name: data?.groupName,
					updated_by: personData?.id,
					role: userRole?.toLowerCase(),
				});
			}

			if (response.status === 200 || response.status === 201) {
				toast.success(
					mode === "edit"
						? "Group Updated Successfully"
						: "New Group Added Successfully",
				);
				onGroupCreated();
				reset();
				handleClose();
			}
		} catch (err) {
			toast.error(
				err?.message || `Failed to ${mode === "edit" ? "Update" : "Add"} Group`,
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<UIModal
			open={handleOpen}
			handleClose={() => {
				reset();
				handleClose();
			}}
		>
			<Typography
				variant="h5"
				gutterBottom
				sx={{
					py: 2,
					mt: -3,
				}}
			>
				{mode === "edit" ? "Edit Student Group Name" : "Add Student Group Name"}
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller
					name="groupName"
					control={control}
					rules={{
						required: "* Student Group Name is required",
						validate: (value) => {
							const trimmedValue = value.trim();
							if (trimmedValue === "") {
								return "* Student Group Name cannot be just spaces";
							}
							if (mode === "add") {
								const isDuplicate = currentGroups
									.map((group) => group.trim().toLowerCase()) // Trim and lowercase all values
									.includes(trimmedValue.toLowerCase()); // Check for a match

								if (isDuplicate) {
									return "* Student Group Name already exists";
								}
							}

							return true;
						},
					}}
					render={({ field }) => (
						<TextField
							{...field}
							label={
								<CustomFormLabel
									name={
										mode === "edit"
											? "Edit Group Name"
											: "Add Student Group Name"
									}
									required={true}
								/>
							}
							variant="outlined"
							fullWidth
							error={!!errors?.groupName?.message}
							helperText={errors?.groupName?.message}
							disabled={loading}
						/>
					)}
				/>

				<Box
					sx={{
						textAlign: "center",
					}}
				>
					<div className="flex-grow-1 d-flex gap-3 mt-3">
						<UIButton
							text="Cancel"
							size="large"
							className="flex-grow-1 rounded rounded-pill p-2"
							onClick={() => {
								reset();
								handleClose();
							}}
							disabled={loading}
							sx={{ width: "70px" }}
						/>
						<UIButton
							text={
								loading ? (
									<CommonProgress />
								) : mode === "edit" ? (
									"Update"
								) : (
									"Create"
								)
							}
							variant="contained"
							size="large"
							className="flex-grow-1 rounded rounded-pill p-2"
							onClick={handleSubmit(onSubmit)}
							disabled={loading || (mode === "edit" && !isDirty)}
							sx={{
								backgroundColor: "#5840BA",
								width: "70px",
							}}
						/>
					</div>
				</Box>
			</form>
		</UIModal>
	);
};

export default GroupForm;
