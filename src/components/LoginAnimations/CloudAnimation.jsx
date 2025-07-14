import "./CloudAnimation.scss";
const Cloud = ({ cloudClass }) => {
	return (
		<div className="p-2">
			<div
				className={cloudClass}
				style={{
					width: "40rem",
					height: "2rem",
					opacity: "0.3",
				}}
			/>
		</div>
	);
};

const CloudAnimation = () => {
	const cloudClasses = [
		"cloud-1-icon-login",
		"cloud-2-icon-login",
		"cloud-3-icon-login",
	];

	const clouds = [
		{ left: "0%", top: 50, cloudClass: cloudClasses[0] },
		{ left: "40%", top: 50, cloudClass: cloudClasses[1] },
		{ left: "80%", top: 50, cloudClass: cloudClasses[2] },
		{ left: "15%", top: 150, cloudClass: cloudClasses[0] },
		{ left: "65%", top: 150, cloudClass: cloudClasses[1] },
		{ left: "100%", top: 50, cloudClass: cloudClasses[0] },
		{ left: "140%", top: 50, cloudClass: cloudClasses[1] },
		{ left: "180%", top: 50, cloudClass: cloudClasses[2] },
		{ left: "115%", top: 150, cloudClass: cloudClasses[0] },
		{ left: "165%", top: 150, cloudClass: cloudClasses[1] },
	];

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				height: "50dvh",
				width: "100dvw",
				zIndex: 90,
				overflow: "hidden",
			}}
		>
			<div
				className="h-100 w-100"
				style={{
					position: "relative",
					top: 0,
					animation: "moveClouds 20s linear infinite",
				}}
			>
				{clouds.map((cloud, index) => (
					<div
						key={`cloud-number-${index + 1}`} // Should be unique as we are using index now as a key
						style={{
							position: "absolute",
							top: `${cloud.top}px`,
							left: `${cloud.left}`, // Fixed horizontal positions
						}}
					>
						<Cloud cloudClass={cloud.cloudClass} />
					</div>
				))}
			</div>
		</div>
	);
};

export default CloudAnimation;
