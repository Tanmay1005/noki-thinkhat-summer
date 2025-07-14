import "./OrbitAnimation.scss";
const OrbitAnimation = () => {
	const commonOrbitClasses =
		"orbit-rotation-animate orbit-border rounded-circle position-absolute d-flex align-items-center justify-content-between";

	return (
		<div className="position-absolute w-100 h-100 orbit-container">
			<div className="position-relative big-orbit mx-auto">
				<div
					className="position-absolute d-flex h-100 w-100 align-items-center justify-content-center big"
					style={{
						transform: "rotate(45deg)",
					}}
				>
					<div className={`h-100 w-100 flex-column ${commonOrbitClasses}`}>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-1-1"
							style={{
								marginTop: "-1.5rem",
							}}
						/>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-1-2"
							style={{
								marginBottom: "-1.5rem",
							}}
						/>
					</div>
				</div>

				<div
					className="position-absolute d-flex h-100 w-100 align-items-center justify-content-center big"
					style={{
						transform: "rotate(45deg)",
					}}
				>
					<div className={`h-100 w-100 ${commonOrbitClasses}`}>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-1"
							style={{
								marginLeft: "-1.5rem",
							}}
						/>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-2"
							style={{
								marginRight: "-1.5rem",
							}}
						/>
					</div>
				</div>

				<div className="position-absolute d-flex h-100 w-100 align-items-center justify-content-center">
					<div className={`medium-orbit flex-column ${commonOrbitClasses}`}>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-3"
							style={{
								marginTop: "-1.5rem",
							}}
						/>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-4"
							style={{
								marginBottom: "-1.5rem",
							}}
						/>
					</div>
				</div>

				<div className="position-absolute d-flex h-100 w-100 align-items-center justify-content-center">
					<div className={`small-orbit ${commonOrbitClasses}`}>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-5"
							style={{
								marginLeft: "-1.5rem",
							}}
						/>
						<div
							className="icon-size orbit-icon-rotation-animate icon-size orbit-icon-6"
							style={{
								marginRight: "-1.5rem",
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrbitAnimation;
