import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getStations } from "../../../redux/thunks/stations";
import CaseForm from "./CaseForm";
import InitializeCaseForm from "./InitializeCaseForm";

const ManageCase = ({
	id = "",
	open = false,
	handleClose = () => {},
	handleRender = () => {},
	viewOnly = false,
}) => {
	const stations = useSelector((state) => state?.stations?.data);
	const reduxDispatch = useDispatch();
	const [initializeCaseData, setInitializeCaseData] = useState(null);

	useEffect(() => {
		if (!stations) {
			reduxDispatch(getStations());
		}
		return () => {
			setInitializeCaseData(null);
		};
	}, []);
	return (
		<>
			{id || initializeCaseData ? (
				<div>
					<CreateWrapper open={stations?.length && open}>
						<CaseForm
							caseId={id}
							open={stations?.length && open}
							handleClose={handleClose}
							initializeCaseData={initializeCaseData}
							setInitializeCaseData={setInitializeCaseData}
							handleRender={handleRender}
							viewOnly={viewOnly}
						/>
					</CreateWrapper>
				</div>
			) : (
				<div>
					<InitializeCaseForm
						open={stations?.length && open}
						handleClose={handleClose}
						setInitializeCaseData={setInitializeCaseData}
					/>
				</div>
			)}
		</>
	);
};

export default ManageCase;
