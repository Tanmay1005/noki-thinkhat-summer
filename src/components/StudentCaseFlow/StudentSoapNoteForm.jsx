import { Grid, Typography } from "@mui/material";
import CommonProgress from "components/ReusableComponents/Loaders";
import { SoapNoteTabs } from "components/TestConfiguration/HandleCase/stations/SoapNoteForm/SoapNoteTabs";
import useCaseFlowForm from "hooks/useCaseFlowForm";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useSelector } from "react-redux";
import Logo from "../../assets/logo.svg";

const StudentSOAPNoteForm = forwardRef((_props, ref) => {
	const {
		handleOnStartDocumenting,
		handleOnStopDocumenting,
		handleOnPauseDocumenting,
		handleOnResumeDocumenting,
	} = useCaseFlowForm();
	const { isRecording, isPaused } = useSelector((state) => state.speech);

	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleStartRecording = async () => {
		try {
			setLoading(true);
			handleOnStartDocumenting();
			setIsOpen(true);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
	const handleStopRecording = async () => {
		try {
			handleOnStopDocumenting();
		} catch (error) {
			console.error("Error stopping recording or generating score:", error);
		}
	};
	const handlePauseRecording = () => {
		handleOnPauseDocumenting();
	};

	useImperativeHandle(ref, () => ({
		handleStopRecording,
		handlePauseRecording,
		handleResumeRecording,
	}));

	const handleResumeRecording = async () => {
		handleOnResumeDocumenting();
	};

	return (
		<>
			{isRecording && isOpen ? (
				<Grid
					item
					className="h-100 d-flex flex-column justify-content-between overflow-auto"
					sx={{ padding: "1rem 1.5rem 0 1.5rem" }}
				>
					<SoapNoteTabs
						fieldName={"student.expertApproach.soapNote"}
						isInputDisabled={isPaused}
					/>
				</Grid>
			) : (
				<Grid
					item
					className="d-flex justify-content-center align-items-center h-100 flex-column p-5"
				>
					{" "}
					<div
						className="col-12 d-flex justify-content-center align-items-center mb-2"
						style={{
							height: "70px",
							width: "70px",
							background:
								"linear-gradient(93.39deg, #E38DF1 -5.66%, #8C68C3 56.74%, #6754A7 96.84%)",
							borderRadius: "50%",
						}}
						onClick={handleStartRecording}
						onKeyUp={handleStartRecording}
						tabIndex={0}
						role="button"
						aria-label="Start Conversation"
					>
						{loading ? (
							<CommonProgress sx={{ color: "white" }} />
						) : (
							<img src={Logo} alt="Start Recording" />
						)}
					</div>
					<Typography>Start Case</Typography>
				</Grid>
			)}
		</>
	);
});

export default StudentSOAPNoteForm;
