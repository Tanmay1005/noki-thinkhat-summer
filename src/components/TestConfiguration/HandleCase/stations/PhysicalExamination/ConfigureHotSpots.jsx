import { Box } from "@mui/material";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { buildPEHierarchy } from "helpers/common_helper";
import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import NestedPEAccordions from "./PECategories";
import PhysicalExamForm from "./PhysicalExamForm";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "90%",
	maxWidth: 800,
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
	display: "flex",
	flexDirection: "column",
	height: "90vh",
};

const ConfigureHotSpots = ({
	name = "hotSpotConfig",
	disabled = false,
	peTests = [],
}) => {
	const fieldName = `${name}.PETests`;
	const selectedPEValues = useWatch({
		name: fieldName,
	});
	const selectedPEIDs = useMemo(() => {
		return selectedPEValues?.map(({ id }) => id) || [];
	}, [selectedPEValues]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);
	const [loading, _setLoading] = useState(false);
	const [examsData, setExamData] = useState([]);
	const [selectedPETree, setSelectedPETree] = useState([]);
	const { getValues } = useFormContext();
	const isCaseEditable = getValues("isCaseEditable");
	useEffect(() => {
		const tree = buildPEHierarchy(peTests);
		setExamData(tree);
	}, [peTests]);
	const buildSelectedPEHirearchy = () => {
		const selectedPELookup = selectedPEValues?.reduce((acc, curr, index) => {
			acc[curr.id] = { ...curr, flatIndex: index };
			return acc;
		}, {});
		const PE = peTests
			.map(({ test_id, category_path_ids, category_path_names }) => {
				if (selectedPEIDs?.includes(test_id)) {
					return {
						...selectedPELookup[test_id],
						category_path_ids,
						category_path_names,
					};
				}
				return;
			})
			.filter(Boolean);
		const tree = buildPEHierarchy(PE);
		setSelectedPETree(tree);
	};
	useEffect(() => {
		buildSelectedPEHirearchy();
	}, [JSON.stringify(selectedPEIDs), peTests]);
	return (
		<div className="secondary-bg-color p-2 rounded-4">
			<UIModal
				displayCloseIcon={false}
				width={"90%"}
				style={{ ...modalStyle }}
				open={isModalOpen}
				handleClose={handleCloseModal}
			>
				<Box className="d-flex flex-column h-100" sx={{ gap: "1rem" }}>
					<PhysicalExamForm
						name={name}
						onClose={handleCloseModal}
						Data={examsData}
					/>
				</Box>
			</UIModal>
			<NestedPEAccordions data={selectedPETree} fieldName={fieldName} />
			{isCaseEditable && (
				<div className="text-center py-2">
					<UIButton
						disabled={loading || disabled}
						text="Add Category"
						variant="contained"
						onClick={handleOpenModal}
					/>
				</div>
			)}
		</div>
	);
};

export default ConfigureHotSpots;
