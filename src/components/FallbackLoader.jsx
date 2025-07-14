import Loading from "../assets/icons/loader.gif";

const FallBackLoader = () => {
	return (
		<>
			<div className="centered-justified-no-page">
				<img src={Loading} className="formd-loader" alt="Loading..." />
				<br />
				<span>
					Loading
					<span className="fallback-dots">
						<span>.</span>
						<span>.</span>
						<span>.</span>
					</span>
				</span>
			</div>
		</>
	);
};

export default FallBackLoader;
