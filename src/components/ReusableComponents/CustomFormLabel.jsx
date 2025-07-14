const CustomFormLabel = ({ required, name }) => {
	return (
		<>
			{name}&nbsp;
			{required && <span style={{ color: "#f44336" }}>*</span>}
		</>
	);
};

export default CustomFormLabel;
