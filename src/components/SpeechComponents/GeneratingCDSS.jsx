import Disclaimer from "components/ReusableComponents/Disclaimer";
import { repairJson } from "helpers/common_helper";
import React from "react";

const GeneratingCDSS = React.memo(({ isRecording, CDSSJson, requestTime }) => {
	return (
		<div style={{ height: "100%" }}>
			{isRecording && CDSSJson ? (
				<div style={{ overflowX: "hidden", overflowY: "auto", height: "100%" }}>
					<SuggestedQuestions data={CDSSJson} requestTime={requestTime} />
				</div>
			) : (
				<div className="d-flex flex-column justify-content-center align-items-center h-100">
					<p>Here you can view the generated CDSS</p>
				</div>
			)}
		</div>
	);
});

const SuggestedQuestions = React.memo(({ data, requestTime }) => {
	let parsedData = {};
	try {
		parsedData = typeof data === "object" ? data : repairJson(data);
	} catch (e) {
		console.error(e, "Broken json Data");
	}
	const suggestions = parsedData?.suggestions;
	const redirectionMessage = parsedData?.message || "";

	return (
		<div>
			<Disclaimer />
			<h2
				className="text-primary"
				style={{ fontSize: "14px", fontWeight: 500, padding: "5px" }}
			>
				{suggestions?.length > 0 && parsedData?.title}
			</h2>
			{redirectionMessage &&
				redirectionMessage?.length > 0 &&
				requestTime >= 60 && (
					<h2
						className="text-secondary"
						style={{ fontSize: "13px", padding: "5px" }}
					>
						{redirectionMessage}
					</h2>
				)}
			<div className="d-flex flex-column justify-content-center align-items-center p-2">
				{suggestions?.length > 0 ? (
					suggestions?.map((question, idx) => (
						<div
							key={`cdss-suggestions-question-${idx + 1}`} // Should be unique as we are using index
							className="card border-0 mb-2 shadow-sm w-100"
							style={{
								borderRadius: "10px",
								display: "inline-block",
								minWidth: "200px",
								marginRight: "10px",
							}}
						>
							<div className="card-body border-0 p-8">
								<p style={{ fontWeight: 400, fontSize: "13px", margin: "0" }}>
									{question}
								</p>
							</div>
						</div>
					))
				) : (
					<div
						className="d-flex justify-content-center align-items-center h-100"
						style={{ color: "red" }}
					>
						{data?.message || "No suggestions available."}
					</div>
				)}
			</div>
		</div>
	);
});

export default GeneratingCDSS;
