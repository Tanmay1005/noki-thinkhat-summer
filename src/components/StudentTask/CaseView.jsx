import { marked } from "marked";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { GET_CASE_AND_SCORE_BY_ID } from "../../adapters/noki_ed.service";
import CommonProgress from "../ReusableComponents/Loaders";

const CaseView = () => {
	const auth = useSelector((state) => state?.auth);
	const { id } = useParams();
	const [loading, setLoading] = useState(false);
	const [caseDetails, setCaseDetails] = useState();

	useEffect(() => {
		if (auth?.personData && id) {
			getCaseDetatils();
		}
	}, [auth?.personData, id]);

	const getCaseDetatils = async () => {
		try {
			setLoading(true);
			const response = await GET_CASE_AND_SCORE_BY_ID(
				`/${id}/user/${auth?.personData?.id}`,
			);
			setCaseDetails(response);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="main-border h-100 p-3">
			{loading ? (
				<div className="h-100 d-flex align-items-center justify-content-center">
					<CommonProgress />
				</div>
			) : (
				<div className="d-flex flex-column gap-2">
					<div className="d-flex justify-content-between border-bottom border-2 pb-2">
						<div className="d-flex gap-5">
							<div>
								<strong>Case Name:</strong> {caseDetails?.case?.name}
							</div>
							<div>
								<strong>Case Type:</strong> {caseDetails?.case?.case_type}
							</div>
						</div>
						<div className="pe-4 d-flex gap-2">
							<strong>Status:</strong>
							<span className="text-success">Completed</span>
						</div>
					</div>
					<div
						className="d-flex flex-column gap-2 overflow-auto"
						style={{ flex: 1 }}
					>
						<div className="border-bottom border-2 pb-2">
							<strong>Case Description:</strong>
							<div
								className="px-3"
								dangerouslySetInnerHTML={{
									__html: marked(caseDetails?.case?.description || ""),
								}}
							/>
						</div>
						<div>
							<strong>Case Result:</strong>
							<div
								className="px-3"
								dangerouslySetInnerHTML={{
									__html: marked(caseDetails?.case_report || ""),
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CaseView;
