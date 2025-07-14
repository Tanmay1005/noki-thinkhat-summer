import AssessmentFeedback from "components/AssessmentFeedback/AssessmentFeedback";
import TabPanel, { UITabs } from "components/ReusableComponents/Tabs";
import { useEffect, useState } from "react";

const FeedBackCircuits = ({ circuitsData }) => {
	const [value, setValue] = useState(0);
	const [selectedCase, setSelectedCase] = useState(null);

	const handleTabChange = (_event, newValue) => {
		setValue(newValue);
	};

	const cases = circuitsData?.circuit?.stations?.reduce((acc, station) => {
		if (station.cases) {
			acc.push(...station.cases);
		}
		return acc;
	}, []);
	useEffect(() => {
		if (cases?.length > 0) {
			setSelectedCase(cases[value]);
		}
	}, [value, cases]);
	return (
		<>
			<div className="px-2 d-flex justify-content-between align-items-center mt-3">
				<UITabs
					scrollButtons="auto"
					tabList={cases?.map((caseItem) => caseItem.name)}
					handleTabChange={handleTabChange}
					value={value}
					sx={{
						width: "max-content",
					}}
				/>
			</div>

			{selectedCase && (
				<div style={{ height: "100%" }}>
					{cases?.map((caseItem, index) => (
						<TabPanel
							className="rounded-bottom-4 px-2 "
							value={value}
							index={index}
							key={`tab-${caseItem.id}`}
						>
							<AssessmentFeedback
								CasesData={caseItem}
								circuitsData={circuitsData}
								displayBackButton={false}
							/>
						</TabPanel>
					))}
				</div>
			)}
		</>
	);
};

export default FeedBackCircuits;
