import StationsList from "../components/DashboardWidgets/StationsList";
import UICard from "../components/ReusableComponents/UICard";

const Stations = () => {
	return <UICard jsx CardBody={<StationsList />} />;
};

export default Stations;
