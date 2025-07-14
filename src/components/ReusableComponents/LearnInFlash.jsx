import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Typography,
} from "@mui/material";
import { getSpecialtyIcon } from "helpers/flashCardHelpers";
import { useEffect, useMemo, useState } from "react";
import ContentLoader from "react-content-loader";
import { GET_RANDOM_FLASH_CARDS } from "../../adapters/noki_ed.service";
import UIButton from "./UIButton";
import UIModal from "./UIModal";

const SkeltonLoader = () => (
	<ContentLoader
		height={"100%"}
		width={"100%"}
		backgroundColor="#f0f0f0"
		foregroundColor="#ecebeb"
		key="skeleton-loader-learn-in-flash"
	>
		<rect x="10%" y="8%" rx="10" ry="10" width="80%" height="50%" />
		<rect x="10%" y="65%" rx="10" ry="10" width="80%" height="10%" />
		<rect x="20%" y="78%" rx="10" ry="10" width="60%" height="10%" />
	</ContentLoader>
);

const LearnInFlash = ({
	open,
	handleClose,
	flashCardCount = 5,
	closeonBackdrop,
}) => {
	const [loading, setLoading] = useState(false);
	const [flashCardData, setFlashCardData] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	const getFlashCardData = async () => {
		setLoading(true);
		try {
			const response = await GET_RANDOM_FLASH_CARDS(flashCardCount);
			setFlashCardData(response?.data?.random_flash_cards);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (open) {
			getFlashCardData();
			setCurrentIndex(0);
		}
	}, [open, flashCardCount]);

	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const handleNext = () => {
		if (currentIndex < flashCardData.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	const currentFlashCard = flashCardData[currentIndex];
	const specialtyIcon = useMemo(() => {
		if (currentFlashCard?.category?.[0]) {
			return getSpecialtyIcon(currentFlashCard?.category?.[0]);
		}
		return getSpecialtyIcon("default");
	}, [currentFlashCard]);

	return (
		<>
			{!loading && flashCardData.length < 1 ? (
				<UIModal open={open} handleClose={handleClose} width={350}>
					<div className="modal-content">
						<div className="modal-body">
							<div className="d-flex flex-column justify-content-center align-items-center">
								No Flash cards available at this moment.
							</div>
						</div>
						<div className="d-flex justify-content-end align-items-center mt-2">
							<UIButton
								text="Close"
								variant="contained"
								onClick={handleClose}
								sx={{
									width: "fit-content",
									textTransform: "capitalize !important",
								}}
							/>
						</div>
					</div>
				</UIModal>
			) : (
				<Dialog
					fullWidth
					maxWidth="xs"
					open={open}
					onClose={closeonBackdrop ? handleClose : null}
					PaperProps={{
						style: { height: "70dvh", borderRadius: "25px" },
					}}
				>
					<DialogTitle className="d-flex border-bottom justify-content-between align-items-center m-0 p-0 py-3 mx-3">
						<div className="d-flex gap-1 align-items-center">
							<div className="learn-in-flash-icon" />
							<div>Learn in a Flash</div>
						</div>
						<IconButton
							edge="start"
							color="inherit"
							onClick={handleClose}
							aria-label="close"
							className="m-0 p-0"
						>
							<Close />
						</IconButton>
					</DialogTitle>
					<DialogContent>
						{loading ? (
							<div className="h-100">
								<SkeltonLoader />
							</div>
						) : (
							<div className="d-flex flex-column align-items-center h-100">
								<div className="text-center my-2">
									{currentIndex + 1}/{flashCardData.length}
								</div>
								<div
									className="border flex-grow-1 rounded rounded-4 d-flex flex-column justify-content-around align-items-center"
									style={{
										backgroundColor: specialtyIcon.bg,
										width: "80%",
									}}
								>
									<div className={specialtyIcon.icon} />
									<Typography
										className="text-center fw-bold"
										sx={{ color: "#fff" }}
									>
										{currentFlashCard?.description}
									</Typography>
								</div>
							</div>
						)}
					</DialogContent>
					<DialogActions className="d-flex justify-content-center mb-2">
						{!loading && (
							<>
								<IconButton
									onClick={handlePrev}
									disabled={currentIndex === 0}
									color="primary"
									aria-label="prev"
									className={`border me-2 ${currentIndex !== 0 && "border-primary"} `}
								>
									<ArrowBackIos />
								</IconButton>
								<IconButton
									onClick={handleNext}
									disabled={currentIndex === flashCardData.length - 1}
									color="primary"
									aria-label="next"
									className={`border ${currentIndex !== flashCardData.length - 1 && "border-primary"} `}
								>
									<ArrowForwardIos />
								</IconButton>
							</>
						)}
					</DialogActions>
				</Dialog>
			)}
		</>
	);
};

export default LearnInFlash;
