import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Grid,
	Typography,
} from "@mui/material";

const AssessmentInDetail = ({
	feedbackList = [],
	headingKey = "diagnosis",
	feedbackKey = "Feedback",
	symptomKey = "Symptom_Analysis",
	sectionTitle = "In Detail Feedback",
}) => {
	return (
		<div>
			<Accordion
				defaultExpanded
				className="rounded rounded-4"
				sx={{
					backgroundColor: "#F9F9F9",
					border: "1px solid #dee2e6",
				}}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant="h5" sx={{ color: "#000" }}>
						{sectionTitle}
					</Typography>
				</AccordionSummary>

				<AccordionDetails>
					<Box sx={{ backgroundColor: "#f8f9fa", p: 1, borderRadius: 2 }}>
						<Grid container spacing={1}>
							{feedbackList.map((item) => {
								const heading = item[headingKey];
								const feedbackText = item[feedbackKey];
								const symptomText = item[symptomKey];
								const key = item.id || heading;

								return (
									<Grid key={key} item xs={12}>
										<div className="overflow-y-auto">
											<div className="mt-3 mb-1 rounded rounded-3 p-3 bg-white">
												<Grid container spacing={2}>
													<Grid item xs={12}>
														<div className="border-bottom pb-2 mb-2">
															<Typography fontWeight="bold">
																{heading}
															</Typography>
														</div>
														{feedbackText && (
															<Typography sx={{ mb: 2 }}>
																{feedbackText}
															</Typography>
														)}
														{symptomText && (
															<>
																<Typography fontWeight="bold">
																	Symptom Analysis:
																</Typography>
																<Typography>{symptomText}</Typography>
															</>
														)}
													</Grid>
												</Grid>
											</div>
										</div>
									</Grid>
								);
							})}
						</Grid>
					</Box>
				</AccordionDetails>
			</Accordion>
		</div>
	);
};

export default AssessmentInDetail;
