import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Box, IconButton } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import GCSAudio from "./GcsAudio";

const AudioFileCarousel = ({ name }) => {
	const [current, setCurrent] = useState(0);
	const { getValues } = useFormContext();
	const audioFiles = getValues(`${name}.audioFiles`);
	const fileId = getValues(`${name}.fileId`);

	if (!audioFiles?.length) return null;

	const handlePrev = () => {
		setCurrent((prev) => (prev === 0 ? audioFiles?.length - 1 : prev - 1));
	};
	const handleNext = () => {
		setCurrent((prev) => (prev === audioFiles?.length - 1 ? 0 : prev + 1));
	};

	// Use a unique key to force re-mounting the audio element
	const _audioSrc = audioFiles?.[current]?.url || audioFiles?.[current];

	return (
		<>
			{audioFiles?.length > 0 && (
				<Box display="flex" alignItems="center" gap={1}>
					<IconButton
						onClick={handlePrev}
						size="small"
						disabled={audioFiles.length <= 1}
						aria-label="Previous audio"
					>
						<ArrowBackIosIcon fontSize="small" />
					</IconButton>
					{/* {
                audioFiles?.map((audioFile) => ( */}
					<GCSAudio
						name={audioFiles?.[current]?.originalName}
						fileId={fileId}
						type="case"
					/>
					{/* ))
            } */}
					<IconButton
						onClick={handleNext}
						size="small"
						disabled={audioFiles?.length <= 1}
						aria-label="Next audio"
					>
						<ArrowForwardIosIcon fontSize="small" />
					</IconButton>
				</Box>
			)}
		</>
	);
};

export default AudioFileCarousel;
