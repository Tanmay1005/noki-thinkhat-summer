import DifferentialsResults from "components/TestConfiguration/HandleCase/Differentials&Diagnostics/DifferentialsResults";
import { memo } from "react";
import { useController, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";

const DifferentialsComponent = memo(() => {
	const fieldName = "student.expertApproach.differentials";
	const { control } = useFormContext();
	const {
		field: { value, onChange },
	} = useController({
		name: fieldName,
		control,
		defaultValue: [],
	});
	const { isPaused } = useSelector((state) => state.speech);
	const handleDifferentialsChange = (selectedItems) => {
		const transformedItems = selectedItems.map((item) => ({
			snomed_id: item?.snomed_id,
			diagnosis: item?.diagnosis,
			concept_id: item?.concept_id,
			id: item?.snomed_id,
		}));
		onChange(transformedItems);
	};
	return (
		<DifferentialsResults
			name={fieldName}
			onSelectedItemsChange={handleDifferentialsChange}
			resultsProps={{ sx: { height: "75%", ml: 3, mt: 1 } }}
			selectedItems={value}
			isDisabled={isPaused}
		/>
	);
});

export default DifferentialsComponent;
