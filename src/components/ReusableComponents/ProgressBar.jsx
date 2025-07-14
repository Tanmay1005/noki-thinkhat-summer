const ProgressBar = ({ percentage }) => {
	const validPercentage = Math.floor(Math.min(Math.max(percentage, 0), 100));
	return (
		<div className="text-last d-flex align-items-center gap-2">
			<div className="progress-bar w-100">
				<div
					className="progress-bar-inner"
					style={{ width: `${validPercentage}%` }}
				/>
			</div>
			<span className="progress-text">{validPercentage}%</span>
		</div>
	);
};

export default ProgressBar;
