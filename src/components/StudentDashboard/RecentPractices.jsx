import { Box } from "@mui/material";
import { Skeleton } from "@mui/material";
import { RECENT_PRACTICES } from "adapters/noki_ed.service";
import { convertHtmlToText } from "helpers/common_helper";
import { imageByType } from "helpers/imageHelper";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../ReusableComponents/Card";
import SectionHeader from "../ReusableComponents/SectionHeader";
import UICarousel from "../ReusableComponents/UICarousel";

const headerProps = {
	header: {
		content: "Jump Back In",
	},
};
const calculateProgress = (total, unAttempted) => {
	return ((total - unAttempted) / total) * 100;
};
const styles = {
	badge: {
		fontSize: "0.7rem",
		color: "#414141",
	},
	header: {
		fontSize: "1rem",
		fontWeight: "600",
		lineHeight: "1.19rem",
	},
	description: {
		fontSize: "0.75rem",
		fontWeight: "300",
		lineHeight: "0.85rem",
	},
	iconPlay: {
		height: "2rem",
	},
};
const maxLength = {
	badge: 20,
	header: 20,
	description: 25,
};
const RecentPractices = () => {
	const [data, setData] = useState([]);
	// const [isLastSlide, setIsLastSlide] = useState(false);
	// const [nextPageToken, setNextPageToken] = useState("");

	const practitionerId = useSelector(
		(state) => state?.auth?.personData?.fhir_practitioner_id,
	);

	const [loading, setLoading] = useState(false);
	const [isNextCaseLoadingIndex, setIsNextCaseLoadingIndex] = useState(null);
	// const [selectedCase, setSelectedCase] = useState(null);
	// const [selectedCaseName, setSelectedCaseName] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		if (!data.length) {
			getRecentPractices();
		}
	}, []);
	const handleAssessmentStart = async ({ id, caseId, stationId }) => {
		try {
			setIsNextCaseLoadingIndex(true);
			navigate(
				`/case/${caseId}?stationId=${stationId}&attemptId=${id}&osceType=circuit`,
			);
		} catch (error) {
			console.error("error occurred while fetching next case", error.message);
		} finally {
			setIsNextCaseLoadingIndex(false);
		}
	};
	const getRecentPractices = async () => {
		const query = {
			practitionerId: practitionerId,
			status: "in progress",
			limit: 5,
			is_visible: true,
		};
		try {
			setLoading(true);
			const response = await RECENT_PRACTICES(query);
			setData(response.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};
	return (
		<>
			{/* <UIModal
				open={showDialog}
				handleClose={() => {
					setShowDialog(false);
					setSelectedModel("rolePlay");
					setSelectedCase(null);
				}}
				width={500}
			>
				<div className="modal-content p-2">
					<div className="modal-body">
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h5 style={{ textAlign: "center", fontWeight: "bold" }}>
								Choose a Model to continue
							</h5>
						</div>
						<div className="d-flex flex-column align-items-center">
							<h5 className="m-0 p-0 mt-2" style={{ fontWeight: "bold" }}>
								Model
							</h5>
							<FormControl>
								<RadioGroup
									row
									value={selectedModel}
									onChange={handleModelChange}
								>
									<FormControlLabel
										value="rolePlay"
										control={<Radio />}
										label="Role Play"
									/>
									<FormControlLabel
										value="virtualPatient"
										control={<Radio />}
										label="Virtual Patient"
									/>
								</RadioGroup>
							</FormControl>
						</div>
					</div>
					<div className="d-flex flex-row mt-4 justify-content-center align-items-center gap-2">
						<UIButton
							className={"rounded rounded-pill"}
							text={"cancel"}
							onClick={() => setShowDialog(false)}
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
						<UIButton
							className={"rounded rounded-pill"}
							text={
								isNextCaseLoadingIndex !== null ? "loading... " : "Continue"
							}
							onClick={handleContinue}
							size="medium"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
							variant="contained"
						/>
					</div>
				</div>
			</UIModal> */}
			{loading ? (
				<SkeltonLoader headerProps={headerProps} />
			) : (
				!isEmpty(data) && (
					<>
						<SectionHeader {...headerProps} />
						<UICarousel
							responsive={[
								{
									breakpoint: 1600,
									settings: {
										slidesToShow: 2,
									},
								},
								{
									breakpoint: 1210,
									settings: {
										slidesToShow: 2,
									},
								},
								{
									breakpoint: 480,
									settings: {
										slidesToShow: 1,
									},
								},
							]}
						>
							{data?.map(
								(
									{ name, type, circuit_id, description, progress, ...item },
									index,
								) => (
									<Box key={`recent-practices-box-${name}-${index + 1}`} p={1}>
										<Card
											maxLength={maxLength}
											cardClasses="secondary-bg-color card-shadow"
											cardImageClass={imageByType("circuits", item)}
											badgeText={type}
											name={name}
											description={convertHtmlToText(description)}
											styles={styles}
											progress={calculateProgress(
												item.totalCases,
												item.unAttemptedCase,
											)}
											actions={[
												{
													label: "Continue",
													type: "button",
													handler: () => {
														handleAssessmentStart(item);
													},
												},
											]}
											isLoading={isNextCaseLoadingIndex === index}
										/>
									</Box>
								),
							)}
						</UICarousel>
					</>
				)
			)}
		</>
	);
};

export default RecentPractices;
const SkeltonLoader = (headerProps) => {
	const style = {
		transform: "none",
		WebkitTransform: "none",
	};
	return (
		<>
			<SectionHeader {...headerProps} />
			<UICarousel
				responsive={[
					{
						breakpoint: 1600,
						settings: {
							slidesToShow: 2,
						},
					},
					{
						breakpoint: 1210,
						settings: {
							slidesToShow: 2,
						},
					},
					{
						breakpoint: 480,
						settings: {
							slidesToShow: 1,
						},
					},
				]}
			>
				{[1, 2, 3, 4].map((item) => (
					<Box key={`skeleton-card-${item}`} p={1}>
						<Box
							className="secondary-bg-color card-shadow"
							sx={{
								width: "100%",
								borderRadius: "8px",
								overflow: "hidden",
							}}
						>
							<Skeleton
								variant="rectangular"
								height={80}
								width="100%"
								sx={{ style, backgroundColor: "#e0e0e0" }}
								animation="wave"
							/>
						</Box>
					</Box>
				))}
			</UICarousel>
		</>
	);
};
