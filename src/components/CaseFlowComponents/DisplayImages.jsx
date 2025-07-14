import { Box } from "@mui/material";
import { GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID } from "adapters/noki_ed.service";
import UICarousel from "components/ReusableComponents/UICarousel";
import { useEffect, useState } from "react";
import ImagesViewDialog from "../ReusableComponents/ImagesViewDialog";

const DisplayImages = ({ questionnaireId, stationType }) => {
	const [files, setFiles] = useState([]);
	const [open, setOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);

	const fetchFiles = async () => {
		try {
			const response =
				await GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID(questionnaireId);
			if (response?.data?.data) {
				const filesByStationType = response?.data?.data?.filter((file) =>
					file?.applicableStations.includes(stationType),
				);
				setFiles(filesByStationType);
			}
		} catch (error) {
			console.error("Error fetching files: ", error);
		}
	};
	useEffect(() => {
		fetchFiles();
	}, [questionnaireId]);

	const handleImageClick = (file) => {
		setOpen(true);
		setSelectedFile(file);
	};
	const handleClose = () => {
		setOpen(false);
		setSelectedFile(null);
	};
	return (
		<>
			{files?.length > 0 && (
				<UICarousel
					slidesToShow={2}
					responsive={[
						{
							breakpoint: 700,
							settings: {
								slidesToShow: 1,
							},
						},
					]}
				>
					{files?.map((file, index) => (
						<Box
							key={`recent-practices-box-${file.fileName}-${index + 1}`}
							p={1}
						>
							<img
								src={file?.url}
								alt={file?.fileName}
								style={{
									width: "100%",
									height: "200px",
									objectFit: "cover",
									borderRadius: "5px",
									border: "10px solid #F7F5FB",
									cursor: "pointer",
								}}
								onClick={() => handleImageClick(file)}
								onKeyDown={() => handleImageClick(file)}
							/>
						</Box>
					))}
				</UICarousel>
			)}

			<ImagesViewDialog
				open={open}
				handleClose={handleClose}
				files={files}
				displayFile={selectedFile}
			/>
		</>
	);
};

export default DisplayImages;
