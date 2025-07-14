import { Add } from "@mui/icons-material";
import { Typography, useMediaQuery } from "@mui/material";
import { GET_ALL_USER_GROUPS, GET_USERS_LIST } from "adapters/noki_ed.service";
import AssessmentList from "components/DashboardWidgets/AssessmentList";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import UIButton from "components/ReusableComponents/UIButton";
import { VideoCard } from "components/StudentDashboard";
import { useUserType } from "hooks/useUserType";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import cases_img from "../assets/admin_dashboard/cases.svg";
import circuits_img from "../assets/admin_dashboard/circuits.svg";
import groups_img from "../assets/admin_dashboard/groups.svg";
import stations_img from "../assets/admin_dashboard/stations.svg";
import CaseList from "../components/DashboardWidgets/CaseList";
import CircuitsList from "../components/DashboardWidgets/CircuitsList";
import UICard from "../components/ReusableComponents/UICard";
import { setUsername } from "../redux/slices/topbarSlice";
import DashboardPieChart from "./DashboardChart";
import AddStudentJSX from "./userManagement/AddStudent";

const CountCard = ({ title, count, imageSrc, bgColor, redirectLink = "" }) => {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
	const navigate = useNavigate();

	return (
		<>
			{isMobile ? (
				<div
					onClick={() => navigate(redirectLink)}
					onKeyDown={() => navigate(redirectLink)}
					className="d-flex align-items-center justify-content-between bg-light rounded-4 p-3 mb-2 count-card-hover"
					style={{ backgroundColor: bgColor, cursor: "pointer" }}
				>
					<div className="d-flex align-items-center gap-2">
						<img
							src={imageSrc}
							alt={title}
							style={{ width: "7vh", height: "7vh" }}
						/>
						<h5 className="mb-0 fs-6">{title}</h5>
					</div>
					<h5 className="fw-bold mb-0">{_.isUndefined(count) ? 0 : count}</h5>
				</div>
			) : (
				<div
					onClick={() => navigate(redirectLink)}
					onKeyDown={() => navigate(redirectLink)}
					className="d-flex flex-column align-items-center justify-content-center bg-light rounded-4 p-3 text-center count-card-hover"
					style={{
						backgroundColor: bgColor,
						height: "100%",
						cursor: "pointer",
					}}
				>
					<img
						src={imageSrc}
						alt={title}
						style={{ width: "6vh", height: "6vh", marginBottom: "10px" }}
					/>
					<h5 className="fw-bold fs-3 mb-2">
						{_.isUndefined(count) ? 0 : count}
					</h5>
					<p className="mb-0 fs-6">{title}</p>
				</div>
			)}
		</>
	);
};

const Dashboard = () => {
	const reduxDispatch = useDispatch();
	const personData = useSelector((state) => state?.auth?.personData);
	const [usersCount, setUsersCount] = useState(null);
	const [group_count, setGroupCount] = useState(0);
	const [open, setOpen] = useState(false);
	const [renderer, setRenderer] = useState(0);
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const [caseListCount, setCaseListCount] = useState(0);
	const [circuitsCount, setCircuitsCount] = useState(0);
	const [assessmentCount, setAssessmentCount] = useState(0);
	const videoLink =
		"https://storage.googleapis.com/noki_public/formd/Formd_Demo_Admin_Eng_V003.mp4";

	const slides = [
		{
			videoLink: videoLink,
			videoTitle: "Formd Demo Video",
			videoLength: "09:44",
		},
	];
	const userType = useUserType();

	useEffect(() => {
		if (personData?.id) {
			reduxDispatch(setUsername(personData?.name));
		}
		return () => {
			reduxDispatch(setUsername(""));
		};
	}, [personData]);

	useEffect(() => {
		const getUsersCount = async () => {
			try {
				const response = await GET_USERS_LIST();
				const data = response?.data;
				setUsersCount([
					{ name: "Students", value: data.student_count.aggregate.count },
					{ name: "Faculty", value: data.examiner_count.aggregate.count },
					{ name: "Admin", value: data.admin_count.aggregate.count },
				]);
				const group_response = await GET_ALL_USER_GROUPS();
				setGroupCount(
					group_response?.data?.user_groups_aggregate?.aggregate?.count,
				);
			} catch (error) {
				console.error("Failed to get users list", error);
				toast.error("Failed to get users list");
			}
		};
		getUsersCount();
	}, [renderer]);
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};
	const handleRenderComponent = () => {
		setRenderer((prev) => prev + 1);
	};

	const COLORS = ["#E7D8FF", "#CCABFF", "#7340C3"];

	return (
		<div className="d-flex flex-column overflow-x-hidden">
			<div className="p-2 row">
				<div className="col-12 col-sm-12 col-md-2 col-lg-2">
					<CountCard
						title="Cases"
						count={caseListCount}
						imageSrc={cases_img}
						bgColor="#FFF4FE"
						redirectLink="/configuration-hub?tab=0&caseTab=0"
					/>
				</div>
				<div className="col-12 col-sm-12 col-md-2 col-lg-2">
					<CountCard
						title="Assignments"
						count={assessmentCount}
						imageSrc={stations_img}
						bgColor="#F8F2FF"
						redirectLink="/admin-feedback"
					/>
				</div>
				<div className="col-12 col-sm-12 col-md-2 col-lg-2">
					<CountCard
						title="Circuits"
						count={circuitsCount}
						imageSrc={circuits_img}
						bgColor="#E9FFF3"
						redirectLink="/configuration-hub?tab=1"
					/>
				</div>
				<div className="col-12 col-sm-12 col-md-2 col-lg-2">
					<CountCard
						title="Groups"
						count={group_count}
						imageSrc={groups_img}
						bgColor="#E9FBFF"
						redirectLink="/users-and-groups?group-tab=1"
					/>
				</div>

				<div className="col-12 col-sm-12 col-md-4 col-lg-4">
					<VideoCard slides={slides} />
				</div>
			</div>

			<div className="flex-1 row p-0 m-0">
				<WidgetRenderer customClasses={"col-md-6 col-lg-4 p-2"}>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<div>
							<div style={{ fontWeight: "600", fontSize: "24px" }}> Users </div>
							{usersCount && (
								<Typography variant="body2">
									Total: {usersCount.reduce((acc, item) => acc + item.value, 0)}
								</Typography>
							)}
						</div>
						{userType === "Admin" && (
							<div>
								<UIButton
									onClick={handleClickOpen}
									startIcon={<Add />}
									text="Add"
									sx={{
										color: textColor,
										border: `1px solid ${textColor}`,
									}}
								/>
								<CreateWrapper open={open}>
									<AddStudentJSX
										handleClose={handleClose}
										handleRender={handleRenderComponent}
									/>
								</CreateWrapper>
							</div>
						)}
					</div>
					{usersCount && (
						<DashboardPieChart
							data={usersCount}
							colors={COLORS}
							labelText={"students"}
						/>
					)}
				</WidgetRenderer>

				<WidgetRenderer customClasses={"col-md-6 col-lg-8 p-2"}>
					<CaseList
						casesCount={caseListCount}
						setCasesCount={setCaseListCount}
					/>
				</WidgetRenderer>
			</div>

			<div className="row flex-1 p-0 m-0">
				<WidgetRenderer customClasses={"col-md-6 col-lg-6 p-2"}>
					<AssessmentList
						assessmentCount={assessmentCount}
						setAssessmentCount={setAssessmentCount}
					/>
				</WidgetRenderer>

				<WidgetRenderer customClasses={"col-md-6 col-lg-6 p-2"}>
					<CircuitsList
						circuitsCount={circuitsCount}
						setCircuitsCount={setCircuitsCount}
					/>
				</WidgetRenderer>
			</div>
		</div>
	);
};

export default Dashboard;

const WidgetRenderer = ({ children, customClasses = "" }) => {
	return (
		<div className={customClasses}>
			<UICard
				jsx
				CardBody={children}
				customBodyClasses={"card-bg-admin-table"}
				customClasses="overflow-hidden"
			/>
		</div>
	);
};
