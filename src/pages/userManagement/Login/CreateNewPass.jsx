import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import {
	CHECK_TOKEN_VERIFY,
	CREATE_NEW_PASSWORD,
} from "adapters/noki_ed.service";
import CloudAnimation from "components/LoginAnimations/CloudAnimation";
import OrbitAnimation from "components/LoginAnimations/OrbitAnimation";
import WaveBackGround from "components/LoginAnimations/WaveBackGround";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import CommonProgress from "components/ReusableComponents/Loaders";
import UICard from "components/ReusableComponents/UICard";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FormField from "./FormField";

const { default: UIButton } = require("components/ReusableComponents/UIButton");
const { useForm } = require("react-hook-form");

const CreateNewPass = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm();

	const { token } = useParams();

	const [isVerifyToken, setVerifyToken] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [passwordResetting, setPasswordResetting] = useState(false);
	const [showPassword, setShowPassword] = useState({
		newPassword: false,
		confirmNewPassword: false,
	});

	const navigate = useNavigate();

	const verifyTokenFn = async () => {
		setLoading(true);
		try {
			const req = await CHECK_TOKEN_VERIFY({ token });

			if (req.status === 200) {
				setVerifyToken(true);
			} else {
				setVerifyToken(false);
			}
		} catch (_err) {
			setVerifyToken(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		verifyTokenFn();
	}, []);

	const onSubmit = async (data) => {
		try {
			setPasswordResetting(true);
			const payload = {
				password: data.newPassword,
			};

			const req = await CREATE_NEW_PASSWORD({ token, payload });

			if (req.status === 200) {
				toast.success("Password updated successfully");
				setIsSuccess(true);
			} else {
				toast.error("Password update failed");
				setIsSuccess(false);
			}
		} catch (err) {
			toast.error("Password update failed");
			console.error(err.message);
			setIsSuccess(false);
		} finally {
			setPasswordResetting(false);
		}
	};

	const newPassword = watch("newPassword");

	return (
		<>
			<div
				style={{
					position: "relative",
					overflow: "hidden",
				}}
			>
				<CloudAnimation />

				<div
					className="d-flex justify-content-center align-items-center"
					style={{
						background: "#5840BA",
						position: "relative",
						height: "100dvh",
					}}
				>
					<UICard
						CardBody={
							<div
								style={{
									background: "#8a79cf",
									position: "relative",
									padding: "30px",
									zIndex: "100",
									width: "350px",
								}}
							>
								{isSuccess ? (
									<div style={{ textAlign: "center" }}>
										<h4>Password Changed</h4>
										<p>Your password has been updated successfully.</p>
										<UIButton
											text="Continue to login"
											className="rounded rounded-2 px-3 w-100"
											variant="contained"
											size="small"
											style={{
												fontSize: "14px",
												backgroundColor: "#6A5ACD",
											}}
											onClick={() => navigate("/login")}
										/>
									</div>
								) : loading ? (
									<div className="d-flex justify-content-center">
										<CommonProgress />
									</div>
								) : !isVerifyToken ? (
									<div style={{ textAlign: "center" }}>
										<h4>Verification Failed</h4>
										<p>
											Your confirmation link has either expired or has already
											been used. Please request a new confirmation email to
											verify your account.
										</p>
									</div>
								) : (
									<>
										<h4>Reset your Password</h4>
										<p>
											Please create a new password which is different from your
											existing password.
										</p>
										<form onSubmit={handleSubmit(onSubmit)}>
											<FormField
												label={
													<CustomFormLabel
														name="New Password"
														required={true}
													/>
												}
												type={showPassword?.newPassword ? "text" : "password"}
												register={register("newPassword", {
													required: "* New Password is required",
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
												})}
												inputProps={{
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																aria-label="toggle password visibility"
																onPointerDown={() =>
																	setShowPassword((prev) => ({
																		...prev,
																		newPassword: true,
																	}))
																}
																onPointerUp={() =>
																	setShowPassword((prev) => ({
																		...prev,
																		newPassword: false,
																	}))
																}
																edge="end"
															>
																{showPassword?.newPassword ? (
																	<Visibility
																		style={{ color: "#FFFF" }}
																		size={18}
																	/>
																) : (
																	<VisibilityOff
																		style={{ color: "#FFFF" }}
																		size={18}
																	/>
																)}
															</IconButton>
														</InputAdornment>
													),
												}}
												errors={errors}
												errorKey="newPassword"
												disabled={passwordResetting}
											/>
											<p className="mb-3 mt-1 ms-1" style={{ color: "red" }}>
												{errors?.newPassword?.message}
											</p>

											<FormField
												label={
													<CustomFormLabel
														name="Confirm New Password"
														required={true}
													/>
												}
												type={
													showPassword?.confirmNewPassword ? "text" : "password"
												}
												register={register("ConfirmPassword", {
													required: "* Confirm Password is required",
													validate: (value) =>
														value === newPassword || "Passwords do not match",
												})}
												inputProps={{
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																aria-label="toggle password visibility"
																onPointerDown={() =>
																	setShowPassword((prev) => ({
																		...prev,
																		confirmNewPassword: true,
																	}))
																}
																onPointerUp={() =>
																	setShowPassword((prev) => ({
																		...prev,
																		confirmNewPassword: false,
																	}))
																}
																edge="end"
															>
																{showPassword?.confirmNewPassword ? (
																	<Visibility
																		style={{ color: "#FFFF" }}
																		size={18}
																	/>
																) : (
																	<VisibilityOff
																		style={{ color: "#FFFF" }}
																		size={18}
																	/>
																)}
															</IconButton>
														</InputAdornment>
													),
												}}
												errors={errors}
												errorKey="ConfirmPassword"
												disabled={passwordResetting}
											/>
											<p className="mt-1 ms-1" style={{ color: "red" }}>
												{errors?.ConfirmPassword?.message}
											</p>

											<UIButton
												text={
													passwordResetting ? "Please Wait" : "Confirm Password"
												}
												className="rounded rounded-2 px-3 w-100"
												variant="contained"
												size="small"
												type="submit"
												style={{
													fontSize: "14px",
													backgroundColor: "#6A5ACD",
												}}
											/>
										</form>
									</>
								)}
							</div>
						}
						customClasses="h-auto p-0 m-0 rounded-4 border-2 overflow-hidden text-white"
						customBodyClasses="p-0 m-0"
					/>
				</div>
				<OrbitAnimation />
				<WaveBackGround />
			</div>
		</>
	);
};

export default CreateNewPass;
