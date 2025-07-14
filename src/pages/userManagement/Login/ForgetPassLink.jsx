import { SEND_FORGET_PASSWORD_LINK } from "adapters/noki_ed.service";
import RecaptchaComponent from "components/RecaptchaComponent";
import CustomFormLabel from "components/ReusableComponents/CustomFormLabel";
import UIButton from "components/ReusableComponents/UIButton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormField from "./FormField";

const ForgetPassLink = ({ handleJumpStep }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		clearErrors,
	} = useForm();

	const [isVerifyCode, setIsVerifyCode] = useState(false);
	const [captchaToken, setCaptchaToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [refreshKey, setrefreshKey] = useState(2);

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			const payload = {
				email: data.email,
				reCaptchaToken: captchaToken,
			};

			const verify = await SEND_FORGET_PASSWORD_LINK(payload);

			if (verify.status === 200) {
				clearErrors();
				handleJumpStep(2);
			}
		} catch (err) {
			setError("root", {
				type: "manual",
				message: err.response?.data?.message || "This email is incorrect",
			});
		} finally {
			setLoading(false);
			setIsVerifyCode(false);
			setrefreshKey((p) => p + 1);
		}
	};

	return (
		<>
			<h4>Forgot Password</h4>
			<form onSubmit={handleSubmit(onSubmit)}>
				<p>
					No worries! Just enter your email and we’ll send you a reset password
					link.
				</p>
				{errors.root?.message && (
					<p style={{ color: "red" }}>* {errors.root?.message}</p>
				)}
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
					disabled={loading}
					errors={errors}
					errorKey="email"
				/>
				<p className="mb-3 mt-1 ms-1" style={{ color: "red" }}>
					{errors?.email?.message}
				</p>

				<RecaptchaComponent
					key={refreshKey}
					setIsVerifyCode={setIsVerifyCode}
					setCaptchaToken={setCaptchaToken}
					action={"PASSWORD_RESET"}
				/>
				<UIButton
					text={loading ? "Validating..." : "Send Reset Link"}
					className="rounded rounded-2 px-3 w-100 mt-2 text-white hover:text-gray-100"
					variant="contained"
					size="small"
					type="submit"
					style={{
						fontSize: "14px",
						backgroundColor: "#6A5ACD",
					}}
					loading={loading}
					disabled={loading || !isVerifyCode}
				/>
				<div className="pt-2 text-center">
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
					<p
						onClick={() => handleJumpStep(0)}
						style={{ cursor: "pointer", display: "inline-block" }}
					>
						Remembered your password? Log in
					</p>
				</div>
			</form>
		</>
	);
};

export default ForgetPassLink;
