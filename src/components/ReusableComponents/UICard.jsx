import CommonProgress from "../ReusableComponents/Loaders";

const UICard = ({
	header,
	CardBody,
	loading,
	customClasses = "",
	customHeaderClasses = "",
	customBodyClasses = "",
}) => {
	return (
		<div
			className={`card custom-card shadow-sm h-100 ${customClasses}`}
			style={{ borderRadius: "10px" }}
		>
			{header && (
				<div
					className={`card-header custom-card-header ${customHeaderClasses}`}
				>
					{header}
				</div>
			)}
			<div className={`card-body ${customBodyClasses}`}>
				{loading ? <CommonProgress /> : CardBody}
			</div>
		</div>
	);
};

export default UICard;
