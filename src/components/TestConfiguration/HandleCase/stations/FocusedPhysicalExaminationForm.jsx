import { Typography } from "@mui/material";
import { GET_PE_DATA } from "adapters/noki_ed.service";
import PESVG from "components/CaseFlowComponents2/PESVG";
import { calculateAge } from "helpers/common_helper";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import CommonStationForm, { GenericExplanationForm } from "./CommonStationForm";
import ConfigureHotSpots from "./PhysicalExamination/ConfigureHotSpots";

const FocusedPhysicalExaminationForm = ({ selectedStation = {} }) => {
	const [loading, setLoading] = useState(false);
	const [peTests, setPETests] = useState([]);
	const gender = useWatch({ name: "gender" });
	const dob = useWatch({ name: "dob" });
	const appearance = useWatch({ name: "appearance" });
	const age = calculateAge(dob);
	const fieldName = `stations.${selectedStation?.value}.expertApproach`;
	const getFormData = async () => {
		try {
			setLoading(true);
			const response = await GET_PE_DATA();
			setPETests(response?.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		getFormData();
	}, []);
	return (
		<div>
			<CommonStationForm selectedStation={selectedStation} />
			<div className="secondary-bg-color rounded rounded-4 mt-3 p-3">
				<Typography
					component="span"
					sx={{
						width: "33%",
						flexShrink: 0,
						fontWeight: "bold",
						fontSize: "1.1rem",
					}}
				>
					Expert Approach
				</Typography>
				{!gender || !dob || !appearance ? (
					<div
						className="d-flex justify-content-center align-items-center "
						style={{ height: "100%", width: "100%" }}
					>
						Please fill the DOB, Appearance and Gender to configure the Physical
						Examination.
					</div>
				) : (
					<>
						<Typography fontWeight="bold">Configure Hot Spots</Typography>
						<div className="mb-3 mt-2 new-card-color p-2 rounded-4">
							<div
								className="pe-root"
								style={{ height: "40em", padding: "2em" }}
							>
								<PESVG
									fieldName={`${fieldName}.PETests`}
									gender={gender}
									age={age}
									appearance={appearance}
									setLoading={setLoading}
									loading={loading}
									peTests={peTests}
								/>
							</div>
							<ConfigureHotSpots name={fieldName} peTests={peTests} />
						</div>
					</>
				)}
				<GenericExplanationForm selectedStation={selectedStation} />
			</div>
		</div>
	);
};

export default FocusedPhysicalExaminationForm;
