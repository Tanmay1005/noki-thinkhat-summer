import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContainerComponent = (props) => {
	const theme = useSelector((state) => state?.app?.theme);

	return <ToastContainer theme={theme} {...props} />;
};

export default ToastContainerComponent;
