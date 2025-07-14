import UIButton from "components/ReusableComponents/UIButton";
import doneIcon from "../../../assets/forgetpass_done_Icon.svg";

const ForgetPassDone = ({ handleJumpStep }) => {
	const handleSubmit = () => {
		handleJumpStep(0);
	};

	return (
		<>
			<h4 className="text-center">Forgot Password</h4>
			<p className="text-center">
				Password reset link has been successfully sent to your email.
			</p>
			<p className="text-center">Please go to your mail and verify.</p>
			<div className="d-flex justify-content-center align-items-center my-3">
				<img src={doneIcon} width={80} alt="done" />
			</div>
			<UIButton
				text="Continue to login"
				className="rounded rounded-2 px-3 w-100"
				variant="contained"
				size="small"
				style={{
					fontSize: "14px",
					backgroundColor: "#6A5ACD",
					// padding: "10px 0",
					// marginTop: "10px",
				}}
				onClick={handleSubmit}
			/>
		</>
	);
};

export default ForgetPassDone;
