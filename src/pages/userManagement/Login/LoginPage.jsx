import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import CloudAnimation from "components/LoginAnimations/CloudAnimation";
import OrbitAnimation from "components/LoginAnimations/OrbitAnimation";
import WaveBackGround from "components/LoginAnimations/WaveBackGround";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import UIButton from "components/ReusableComponents/UIButton";
import UICard from "components/ReusableComponents/UICard";
import { NOKI_TENANT_ID } from "constants.js";
import { auth, signInWithEmailAndPassword } from "firebase-setup";
import { startCase } from "lodash";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ForgetPassDone from "./ForgetPassDone";
import ForgetPassLink from "./ForgetPassLink";
import FormField from "./FormField";

const Login = () => {
	const [step, setStep] = useState(0);

	const handleJumpStep = (p) => {
		setStep(p);
	};

	return (
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
							{step === 0 && <LoginCard handleJumpStep={handleJumpStep} />}
							{step === 1 && <ForgetPassLink handleJumpStep={handleJumpStep} />}
							{step === 2 && <ForgetPassDone handleJumpStep={handleJumpStep} />}
						</div>
					}
					customClasses="h-auto p-0 m-0 rounded-4 border-2 overflow-hidden text-white"
					customBodyClasses="p-0 m-0"
				/>
			</div>
			<OrbitAnimation />
			<WaveBackGround />
		</div>
	);
};

export default Login;

const LoginCard = ({ handleJumpStep }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			auth.tenantId = NOKI_TENANT_ID;
			const _result = await signInWithEmailAndPassword(
				auth,
				data?.email,
				data?.password,
			);
		} catch (error) {
			const errorMessage =
				startCase(error?.code?.replace("auth/", "").replaceAll("-", " ")) ||
				"An error occurred during login.";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h4>Login</h4>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormField
					label={<CustomFormLabel name="Email" required={true} />}
					type="email"
					register={register("email", {
						required: "* Email is required",
						pattern: {
							value: /^\S+@\S+$/i,
							message: "Invalid email format",
						},
					})}
					errors={errors}
					errorKey="email"
				/>
				<p className="mb-3 mt-1 ms-1" style={{ color: "red" }}>
					{errors?.email?.message}
				</p>

				<FormField
					label={<CustomFormLabel name="Password" required={true} />}
					type={showPassword ? "text" : "password"}
					register={register("password", {
						required: "* Password is required",
					})}
					inputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton
									aria-label="toggle password visibility"
									onPointerDown={() => setShowPassword(true)}
									onPointerUp={() => setShowPassword(false)}
									edge="end"
								>
									{showPassword ? (
										<Visibility style={{ color: "#FFFF" }} size={18} />
									) : (
										<VisibilityOff style={{ color: "#FFFF" }} size={18} />
									)}
								</IconButton>
							</InputAdornment>
						),
					}}
					errors={errors}
					errorKey="password"
				/>
				<p className="mt-1 ms-1" style={{ color: "red" }}>
					{errors?.password?.message}
				</p>

				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<p
					className="pt-2"
					style={{ cursor: "pointer", display: "inline-block" }}
					onClick={() => {
						handleJumpStep(1);
					}}
				>
					Forgot password?
				</p>

				<UIButton
					text="Login"
					className="rounded rounded-2 px-3 w-100"
					variant="contained"
					size="small"
					type="submit"
					style={{
						fontSize: "14px",
						backgroundColor: "#6A5ACD",
						// padding: "10px 0",
						// marginTop: "10px",
					}}
					disabled={loading}
				/>
			</form>
		</>
	);
};
