import StationDetailsAdmin from "components/StationComponents/StationDetailsAdmin";
import ChatInterface from "pages/AiTutor/student/ChatInterface";
import { lazy } from "react";
import { useUserType } from "../hooks/useUserType";

// Lazy load pages and components
const AssessmentFeedback = lazy(
	() => import("../components/AssessmentFeedback/AssessmentFeedback"),
);
const Chats = lazy(() => import("../pages/AiTutor/student/Chats.jsx"));

const OSCETraining = lazy(
	() => import("../components/OSCETraining/OSCETraining"),
);
const Tests = lazy(() => import("../components/TestConfiguration/Tests"));
const StudentDashboard = lazy(
	() => import("../components/Student/StudentDashboard"),
);
const CaseView = lazy(() => import("../components/StudentTask/CaseView"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const NotFound = lazy(() => import("../pages/NotFound"));
const TestConfig = lazy(() => import("../pages/TestConfig"));
const UserManagement = lazy(
	() => import("../pages/userManagement/UserManagement"),
);
const GroupManagement = lazy(() => import("../pages/GroupManagement"));
const QuizConfig = lazy(() => import("../pages/QuizConfig"));
const AllScoreTabs = lazy(
	() => import("../components/AllScores/AllScoresTabs"),
);
const Feedback = lazy(() => import("../pages/Feedback/Feedback"));
const EditableJson = lazy(
	() => import("../components/AssessmentFeedback/EditableJson.jsx"),
);

const AdminTutorDashboard = lazy(
	() => import("../pages/AiTutor/admin/Dashboard.jsx"),
);

const ManageAITutor = lazy(
	() => import("../pages/AiTutor/admin/ManageAITutor.jsx"),
);

const StudentCaseFlow = lazy(() => import("../pages/StudentCaseFlow.jsx"));

const DiffDashboardPages = {
	Admin: Dashboard,
	Student: StudentDashboard,
	Examiner: Dashboard,
};

const useRoutes = () => {
	const userType = useUserType();
	let routes = [];

	switch (userType) {
		case "Admin":
			routes = [
				{ path: "/", component: DiffDashboardPages[userType] },
				{ path: "/configuration-hub", component: TestConfig },
				{ path: "/users-and-groups", component: UserManagement },
				{ path: "/station-details/:id", component: StationDetailsAdmin },
				{ path: "/quiz-config", component: QuizConfig },
				{ path: "/admin-feedback", component: Feedback },
				{ path: "/edit-score", component: EditableJson },
				{ path: "/ai-tutor", component: AdminTutorDashboard },
				{ path: "/ai-tutor/:id", component: ManageAITutor },
				{ path: "/feedback", component: AssessmentFeedback },
			];
			break;
		case "Student":
			routes = [
				{ path: "/", component: DiffDashboardPages[userType] },
				{ path: "/case/:id", component: StudentCaseFlow },
				{ path: "/attempt", component: StudentCaseFlow },
				{ path: "/attempt/virtual", component: StudentCaseFlow },
				{ path: "/case/view/:id", component: CaseView },
				{ path: "/OSCE/tests", component: Tests },
				{ path: "/feedback", component: AssessmentFeedback },
				{ path: "/OSCETraining", component: OSCETraining },
				{ path: "/allscores", component: AllScoreTabs },
				{
					path: "/ai-tutor",
					component: Chats,
					children: [
						{ path: ":tutorId", component: ChatInterface },
						{ path: ":tutorId/:chatId", component: ChatInterface },
					],
				},
			];
			break;
		case "Examiner":
			routes = [
				{ path: "/", component: DiffDashboardPages[userType] },
				{ path: "/configuration-hub", component: TestConfig },
				{ path: "/group-management", component: GroupManagement },
				{ path: "/station-details/:id", component: StationDetailsAdmin },
				{ path: "/admin-feedback", component: Feedback },
				{ path: "/edit-score", component: EditableJson },
				{ path: "/ai-tutor", component: AdminTutorDashboard },
				{ path: "/ai-tutor/:id", component: ManageAITutor },
			];
			break;
		default:
			routes = [{ path: "*", component: NotFound }];
			break;
	}

	return routes;
};

export default useRoutes;
