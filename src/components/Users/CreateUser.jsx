import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CREATE_USER } from "../../adapters/noki_ed.service";

const CreateUser = ({ renderFunction = () => {} }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const [loading, setLoading] = useState(false);
	const onSubmit = async (data) => {
		try {
			setLoading(true);
			const _response = await CREATE_USER({ ...data });
			toast.success(
				`User ${data?.firstName} ${data?.lastName} created successfully`,
			);
			renderFunction();
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			component="form"
			onSubmit={handleSubmit(onSubmit)}
			className="mx-3 mt-3"
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: 2,
			}}
		>
			<Typography variant="h5" align="center">
				User Creation Form
			</Typography>

			{/* First Name */}
			<TextField
				label="First Name"
				variant="outlined"
				{...register("firstName", { required: "First Name is required" })}
				error={!!errors.firstName}
				helperText={errors.firstName?.message}
			/>

			{/* Last Name */}
			<TextField
				label="Last Name"
				variant="outlined"
				{...register("lastName", { required: "Last Name is required" })}
				error={!!errors.lastName}
				helperText={errors.lastName?.message}
			/>

			{/* Email */}
			<TextField
				label="Email"
				type="email"
				variant="outlined"
				{...register("email", {
					required: "Email is required",
					pattern: {
						value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
						message: "Enter a valid email address",
					},
				})}
				error={!!errors.email}
				helperText={errors.email?.message}
			/>

			{/* Password */}
			<TextField
				label="Password"
				type="password"
				variant="outlined"
				{...register("password", {
					required: "Password is required",
					minLength: {
						value: 6,
						message: "Password must be at least 6 characters",
					},
				})}
				error={!!errors.password}
				helperText={errors.password?.message}
			/>

			{/* Role */}
			<TextField label="Role" value="Student" />

			{/* Submit Button */}
			<Button
				disabled={loading}
				type="submit"
				variant="contained"
				color="primary"
			>
				{loading ? "Creating User..." : "Create User"}
			</Button>
		</Box>
	);
};

export default CreateUser;
