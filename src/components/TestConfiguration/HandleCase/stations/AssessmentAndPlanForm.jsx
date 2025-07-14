import CloseIcon from "@mui/icons-material/Close";
import { Box, Chip, Typography } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import DifferentialsResults from "../Differentials&Diagnostics/DifferentialsResults";
import DragableList from "../Differentials&Diagnostics/DragableList";
import CommonStationForm, { GenericExplanationForm } from "./CommonStationForm";

const themeColors = {
	primary: "#6938EF",
	lightGray: "#F9F9F9",
	gray: "#E0E0E0",
	selectedChipBg: "#F4F4F6",
};

const AssessmentAndPlanForm = ({ selectedStation = {} }) => {
	const name = `stations.${selectedStation?.value}.expertApproach.differentials`;
	const methods = useFormContext();
	const { control, getValues } = methods;
	const {
		fields: differentialFields,
		append: appendDifferential,
		remove: removeDifferential,
	} = useFieldArray({
		control,
		name: name,
	});
	const isCaseEditable = getValues("isCaseEditable");
	const [showModal, setShowModal] = useState(false);
	const handleModalOpen = () => {
		setShowModal(true);
	};
	const handleAddDifferentials = (item) => {
		appendDifferential({
			snomed_id: item?.id,
			concept_id: item?.concept_id,
			diagnosis: item?.diagnosis,
		});
	};

	const handleRemoveDifferentials = async (index) => {
		removeDifferential(index);
	};

	return (
		<div>
			<CommonStationForm selectedStation={selectedStation} />
			<div className="secondary-bg-color rounded rounded-4 mt-3 p-3">
				<Typography
					component="span"
					sx={{
						width: "33%",
						flexShrink: 0,
						fontWeight: "bold",
						fontSize: "1.1rem",
					}}
				>
					Expert Approach
				</Typography>

				<div className="my-3">
					<div className="d-flex justify-content-between align-items-center gap-2 mb-2">
						<Typography fontWeight="bold" mb={1}>
							Your Selected Differentials
						</Typography>

						{isCaseEditable && (
							<UIButton
								variant="contained"
								onClick={handleModalOpen}
								className="p-2 px-4 rounded-pill"
								text="Manage Differentials"
							/>
						)}
					</div>
					<UIModal
						open={showModal}
						handleClose={() => {
							setShowModal(false);
						}}
						width={800}
						style={{
							height: "80%",
						}}
					>
						<div className="d-flex flex-column justify-content-center align-items-center">
							<h6>Select Differentials</h6>
						</div>
						<Box style={{ height: "75%" }}>
							<DifferentialsResults
								name={`stations.${selectedStation?.value}.expertApproach.differentials`}
								onAddTest={handleAddDifferentials}
								onRemoveTest={handleRemoveDifferentials}
							/>
						</Box>
						{/*Footer */}
						<div className="d-flex flex-column mt-1" style={{ height: "20%" }}>
							{differentialFields.length > 0 && (
								<>
									<Typography fontWeight="bold" mb={1}>
										Your Selected Differentials
									</Typography>
									<Box
										display="flex"
										flexWrap="wrap"
										gap={1}
										sx={{
											height: "auto",
											maxHeight: "10vh",
											overflowY: "auto",
											scrollbarWidth: "thin",
										}}
									>
										{differentialFields.map((opt, index) => (
											<Chip
												key={`${opt?.fileId}-selected-${index + 1}`}
												label={opt?.diagnosis}
												onDelete={() => {
													handleRemoveDifferentials(index);
												}}
												deleteIcon={
													<CloseIcon
														sx={{ color: themeColors.primary, fontSize: 12 }}
													/>
												}
												sx={{
													backgroundColor: themeColors.selectedChipBg,
													borderRadius: 2,
													fontSize: 14,
												}}
											/>
										))}
									</Box>
								</>
							)}
						</div>
					</UIModal>
					<DragableList
						name={`stations.${selectedStation?.value}.expertApproach`}
						onRemove={handleRemoveDifferentials}
					/>
				</div>
				<GenericExplanationForm selectedStation={selectedStation} />
			</div>
		</div>
	);
};

export default AssessmentAndPlanForm;
