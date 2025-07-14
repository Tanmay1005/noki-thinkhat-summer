import { GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID } from "adapters/noki_ed.service";
import ImagesViewDialog from "components/ReusableComponents/ImagesViewDialog";
import UIButton from "components/ReusableComponents/UIButton";
import { useEffect, useState } from "react";

const ViewCaseDocuments = ({ caseData = {} }) => {
	const [loading, setLoading] = useState(false);
	const [uploadedDocuments, setUploadedDocuments] = useState([]);
	const [open, setOpen] = useState(false);

	const getUploadedResources = async () => {
		try {
			setLoading(true);

			const response = await GET_DOWNLOADABLE_FILES_BY_QUESTIONNAIRE_ID(
				caseData?.fhir_questionnaire_id,
			);
			if (response?.data?.data?.length) {
				setUploadedDocuments(response?.data?.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (caseData?.fhir_questionnaire_id) {
			getUploadedResources();
		}
	}, [caseData?.fhir_questionnaire_id]);
	return (
		<>
			<UIButton
				disabled={loading || !uploadedDocuments?.length}
				text={
					loading
						? "Loading Documents"
						: !uploadedDocuments?.length
							? "No Documents Found"
							: "View Documents"
				}
				onClick={() => setOpen(true)}
			/>
			<ImagesViewDialog
				files={uploadedDocuments}
				open={open}
				handleClose={() => setOpen(false)}
			/>
		</>
	);
};

export default ViewCaseDocuments;
