import { Add } from "@mui/icons-material";
import { GET_ASSIGNED_TEST_ASSIGNMENTS } from "adapters/noki_ed.service";
import { GET_ALL_USER_GROUPS } from "adapters/noki_ed.service";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import UIButton from "components/ReusableComponents/UIButton";
import AssignTest from "pages/Feedback/AssignTest";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataTable from "./gridRenderer";

const AssessmentList = ({
	assessmentCount = 0,
	setAssessmentCount = () => {},
}) => {
	const navigate = useNavigate();
	const [assessmentList, setAssessmentList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [userGroups, setUserGroups] = useState([]);
	const [_loadingGroups, setLoadingGroups] = useState(false);
	const [openAssignDialog, setOpenAssignDialog] = useState(false);
	const handleOpenAssignDialog = () => setOpenAssignDialog(true);
	const handleCloseAssignDialog = () => setOpenAssignDialog(false);

	const getAssessment = async () => {
		try {
			setLoading(true);
			const response = await GET_ASSIGNED_TEST_ASSIGNMENTS();
			if (response?.data?.test_assignment?.length) {
				setAssessmentList(response?.data?.test_assignment);
				setAssessmentCount(response?.data?.count);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getAssessment();
	}, []);
	const fetchUserGroups = async () => {
		try {
			setLoadingGroups(true);
			const { data } = await GET_ALL_USER_GROUPS();
			setUserGroups(data?.user_groups ?? []);
		} catch (error) {
			console.error("Failed to fetch user groups:", error);
			toast.error("Failed to fetch user groups");
		} finally {
			setLoadingGroups(false);
		}
	};

	useEffect(() => {
		fetchUserGroups();
	}, []);

	const renderType = (params) => {
		const type = params?.row?.case?.name ? "Case" : "Circuit";

		return (
			<div
				style={{
					display: "flex",
					gap: "8px",
					alignItems: "center",
					marginTop: "8px",
				}}
			>
				<span
					style={{
						backgroundColor: "#3B81F6",
						color: "#fff",
						padding: "0 8px",
						height: "24px",
						lineHeight: "24px",
						borderRadius: "4px",
						fontSize: "12px",
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "inline-block",
					}}
				>
					{type}
				</span>
			</div>
		);
	};

	const columns = [
		{
			field: "userGroupName", // Custom name, NOT 'user_group.name'
			headerName: "Group",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			renderCell: (params) => params?.row?.user_group?.name || "",
		},
		{
			field: "type", // Custom name, NOT 'user_group.name'
			headerName: "Type",
			sortable: false,
			disableColumnMenu: true,
			minWidth: 70,
			maxWidth: 80,
			flex: 1,
			renderCell: renderType,
		},
		{
			field: "caseOrCircuitName",
			headerName: "Name",
			sortable: false,
			disableColumnMenu: true,
			flex: 1,
			renderCell: (params) =>
				params?.row?.case?.name
					? params?.row?.case?.name
					: params?.row?.circuit?.name,
		},
	];

	const CustomHeader = () => {
		return (
			<div className="d-flex justify-content-between align-items-baseline">
				<div className="mb-4" style={{ fontWeight: "600", fontSize: "24px" }}>
					Assignments
					<div
						style={{ fontSize: "14px", fontWeight: "normal", color: "#5840BA" }}
					>
						<span
							style={{
								cursor: "pointer",
								fontSize: "14px",
								fontWeight: "normal",
								color: "#5840BA",
							}}
							onKeyDown={() => {
								navigate("/admin-feedback");
							}}
							onClick={() => {
								navigate("/admin-feedback");
							}}
						>
							View All
						</span>
					</div>
				</div>
				<div>
					<UIButton
						onClick={handleOpenAssignDialog}
						startIcon={<Add />}
						text="Add"
						sx={{
							color: "#5840BA",
							border: "1px solid #5840BA",
						}}
					/>
					<CreateWrapper open={openAssignDialog}>
						<AssignTest
							userGroups={userGroups}
							onClose={handleCloseAssignDialog}
						/>
					</CreateWrapper>
				</div>
			</div>
		);
	};
	return (
		<div>
			<DataTable
				CustomHeader={CustomHeader}
				rows={assessmentList}
				columns={columns}
				pageSizeOptions={5}
				rowCount={assessmentCount}
				loading={loading}
				sx={{
					border: "none",
					overflow: "hidden",
					"& .MuiDataGrid-container--top [role=row]": {
						color: "gray",
						background: "#F9F9F9",
						fontSize: "14px",
						fontWeight: "bold",
					},
					"& .MuiDataGrid-cell": {
						border: "none !important",
					},
					"& .MuiDataGrid-columnHeader": {
						borderBottom: "1px solid #ccc",
						borderTop: "1px solid #ccc",
					},
				}}
			/>
		</div>
	);
};

export default AssessmentList;
