import { Box, Grid, Typography } from "@mui/material";
import { StatusChip } from "./ExpertApproachView";

const DiagnosticTestFeedbackSection = ({ data }) => {
	const expert = ["correct", "missing"];
	return (
		<Box className="mb-3">
			<Grid
				key={"assessment-feedback-title-0"}
				item
				xs={12}
				sx={{
					maxHeight: "400px",
				}}
				className="new-card-color d-flex flex-column rounded-4 p-3 px-3 overflow-auto gap-2"
			>
				<Typography variant="h4" sx={{ marginBottom: "16px" }}>
					Diagnosis Selection
				</Typography>
				<Grid container spacing={2} justifyContent="flex-start" gap={2} px={1}>
					<Grid
						item
						xs={12}
						md={4}
						className="mb-3 mt-2 secondary-bg-color rounded-4"
					>
						<Box
							display="flex"
							justifyContent="space-between"
							className={"border-bottom mb-1"}
						>
							<Typography
								variant="h6"
								sx={{
									fontWeight: "bold",
									marginBottom: "8px",
								}}
							>
								Diagnosis Selected by you
							</Typography>
							<div className="d-flex flex-column flex-end">
								{data?.Diagnosis_Selection?.Status && (
									<StatusChip status={data?.Diagnosis_Selection?.Status} />
								)}
							</div>
						</Box>
						<Typography sx={{ marginTop: "8px", fontSize: "1rem" }}>
							{data?.Diagnosis_Selection?.Student_Diagnosis ||
								"No diagnosis selected"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						md={7}
						className="mb-3 mt-2 secondary-bg-color rounded-4"
					>
						<Box
							display="flex"
							justifyContent="space-between"
							className={"border-bottom mb-1"}
						>
							<Typography
								variant="h6"
								sx={{
									fontWeight: "bold",
									marginBottom: "8px",
								}}
							>
								Expert Approach
							</Typography>
							<div className="d-flex flex-column flex-end">
								{data?.Diagnosis_Selection?.Status?.includes(expert) && (
									<StatusChip status={data?.Diagnosis_Selection?.Status} />
								)}
							</div>
						</Box>
						<Typography sx={{ marginTop: "8px", fontSize: "1rem" }}>
							{data?.Diagnosis_Selection?.Expert_Diagnosis ||
								"No diagnosis selected"}
						</Typography>
						<Typography sx={{ marginTop: "8px", marginBottom: "8px" }}>
							{data?.Diagnosis_Selection?.Feedback || "No diagnosis selected"}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	);
};

export default DiagnosticTestFeedbackSection;
