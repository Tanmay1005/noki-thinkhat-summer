import UIModal from "components/ReusableComponents/UIModal";
import { useState } from "react";
import FileUploadViewer from "./FileUploadViewer";

const AttachmentsModal = ({ open, handleClose, formFieldName }) => {
	const [loading, setLoading] = useState(false);
	return (
		<UIModal
			open={open}
			handleClose={handleClose}
			closeOnBackdropClick={false}
			width="900px"
			loading={loading}
		>
			<div>
				<div className="fs-4 mb-3 text-center">
					<h6 style={{ fontWeight: "bold" }}>Attachments</h6>
				</div>
			</div>
			<div style={{ height: "400px" }}>
				<FileUploadViewer
					name={formFieldName}
					handleLoadingStatus={setLoading}
				/>
			</div>
		</UIModal>
	);
};

export default AttachmentsModal;
