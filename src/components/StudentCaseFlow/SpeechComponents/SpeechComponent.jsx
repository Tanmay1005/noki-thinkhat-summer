import { Box, Typography } from "@mui/material";
import brokenArmImage from "assets/Broken arm_oldman.svg";
import getSvgFileInfo from "helpers/PESVGHelper";
import { calculateAge } from "helpers/common_helper";
import { memo } from "react";
import { useFormContext } from "react-hook-form";

const SpeechComponent = memo(({ liveTranscript }) => {
	const methods = useFormContext();
	const { getValues } = methods;
	const gender = getValues("gender");
	const dob = getValues("dob");
	const appearance = getValues("appearance");
	const patientAge = calculateAge(dob);
	const imageName = getSvgFileInfo(patientAge, appearance, gender, true);
	const imageSrc = imageName
		? `${process.env.REACT_APP_GCS_PUBLIC_BUCKET_URL}/avatars/${imageName}`
		: brokenArmImage;
	const handleImageError = (e) => {
		e.target.onerror = null;
		e.target.src = brokenArmImage;
	};
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				position: "relative",
				height: "calc(100% - 48px)",
			}}
		>
			<img
				src={imageSrc}
				alt="Patient"
				style={{ height: "100%", width: "auto", objectFit: "contain" }}
				onError={handleImageError}
			/>
			{liveTranscript && (
				<Box
					className="secondary-bg-color"
					sx={{
						position: "absolute",
						bottom: "10%",
						display: "flex",
						alignItems: "center",
						borderRadius: "12px",
						height: "2.5rem",
						width: "100%",
					}}
				>
					<Typography
						sx={{ padding: "0 2rem", color: "#4F4F4F", fontSize: "0.75rem" }}
					>
						{liveTranscript}
					</Typography>
				</Box>
			)}
		</Box>
	);
});

export default SpeechComponent;
