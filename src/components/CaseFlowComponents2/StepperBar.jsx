const StationTracker = ({
	totalCases,
	percentage,
	activeStep,
	completedCase,
	stages,
}) => {
	return (
		<Slider
			totalCases={totalCases}
			percentage={percentage}
			activeStep={activeStep}
			completedCase={completedCase}
			stages={stages}
		/>
	);
};

const Slider = ({
	totalCases,
	percentage,
	activeStep,
	completedCase,
	stages,
}) => {
	const colors = [
		"#4CAF50", // Green
		"#FF9800", // Orange
		"#2196F3", // Blue
		"#F44336", // Red
		"#9C27B0", // Purple
		"#00BCD4", // Cyan
		"#E91E63", // Pink
		"#8BC34A", // Light Green
		"#FFC107", // Amber
		"#795548", // Brown
		"#3F51B5", // Indigo
		"#607D8B", // Blue Grey
		"#FFEB3B", // Yellow
		"#673AB7", // Deep Purple
		"#009688", // Teal
	];

	return (
		<div className="progress-bar-container">
			{Array.from({ length: totalCases }, (_, index) => {
				const stageId = index + 1;
				const isActive = stageId === activeStep;
				const isCompleted = stageId <= completedCase;

				return (
					<div key={stageId} className="segment-container">
						<div
							className={`progress-segment ${isActive ? "active" : ""}`}
							style={{
								background:
									!isActive && !isCompleted
										? "#ccc"
										: `linear-gradient(to right, ${colors[index % colors.length]} ${isCompleted ? 100 : isActive ? percentage : 100}%, #ccc ${isCompleted ? 100 : isActive ? percentage : 100}% 100%)`,
							}}
						/>
						<div className="segment-label">
							{stages?.[index] || `Case ${stageId}`}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default StationTracker;
