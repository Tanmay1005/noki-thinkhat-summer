import { Box, Grid, Typography } from "@mui/material";
import { GET_PE_DATA } from "adapters/noki_ed.service";
import PESVG from "components/CaseFlowComponents2/PESVG";
import PhysicalExamForm from "components/TestConfiguration/HandleCase/stations/PhysicalExamination/PhysicalExamForm";
import { buildPEHierarchy, calculateAge } from "helpers/common_helper";
import { memo, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import PEDataView from "../PEDataView";
const displayProps = {
	close: false,
	selected: false,
	actions: false,
	addButton: false,
};
const PhysicalExamination = memo(({ liveTranscript }) => {
	const { getValues } = useFormContext();
	const [_loading, setLoading] = useState(false);
	const [peTests, setPETests] = useState([]);
	const [peTree, setPETree] = useState([]);
	const gender = getValues("gender");
	const dob = getValues("dob");
	const appearance = getValues("appearance") || "white";
	const age = calculateAge(dob);
	const getFormData = async () => {
		try {
			setLoading(true);
			const response = await GET_PE_DATA();
			setPETests(response?.data);
			const tree = buildPEHierarchy(peTests);
			setPETree(tree);
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
		<Box
			sx={{
				height: "calc(100% - 48px)",
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				pb: "0.5rem",
			}}
		>
			<Grid container spacing={2} sx={{ height: "calc(100% - 2.5rem)" }}>
				<Grid
					item
					height={"100%"}
					sx={{
						background: "#fff",
						display: "flex",
						flexDirection: "column",
						padding: "16px",
						gap: "0.5rem",
					}}
					xs={12}
					sm={3}
				>
					<PhysicalExamForm
						name="student.expertApproach"
						title="Physical Examination"
						display={displayProps}
						isStudent={true}
						Data={peTree}
					/>
				</Grid>
				<Grid item height={"100%"} xs={12} sm={4.5}>
					<PEDataView fieldName="student.expertApproach.physicalExamination" />
				</Grid>
				<Grid item height={"100%"} xs={12} sm={4.5}>
					<PESVG
						isStudent
						fieldName="student.expertApproach.PETests"
						setLoading={setLoading}
						gender={gender}
						appearance={appearance}
						age={age}
						peTests={peTests}
					/>
				</Grid>
			</Grid>
			{liveTranscript && (
				<Box
					className="secondary-bg-color"
					sx={{
						display: "flex",
						alignItems: "center",
						borderRadius: "12px",
						height: "2.5rem",
						width: "100%",
					}}
				>
					<Typography
						sx={{ padding: "0 2rem", color: "#4F4F4F", fontSize: "0.75rem" }}
					>
						{liveTranscript}
					</Typography>
				</Box>
			)}
		</Box>
	);
});

export default PhysicalExamination;
