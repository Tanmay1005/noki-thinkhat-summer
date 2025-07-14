import SectionHeader from "../ReusableComponents/SectionHeader";
import OsceRenderer from "./OsceRenderer";

const OSCESections = ({ type, headerProps, limit }) => {
	return (
		<>
			<SectionHeader {...headerProps} />
			<OsceRenderer type={type} limit={limit} />
		</>
	);
};

export default OSCESections;
