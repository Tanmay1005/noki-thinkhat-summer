import InfoIcon from "@mui/icons-material/Info";
import { IconButton } from "@mui/material";
import UITooltip from "components/ReusableComponents/UITooltip";
import React from "react";
import { toast } from "react-toastify";

const RubricsTable = ({ data, setData, editable }) => {
	const handleContentEdit = (event, index, idx) => {
		const value = event.target.innerText;
		const originalValue = data[index].Criteria[idx].Score;
		if (!/^[0-5]$/.test(value)) {
			toast.error("Please enter a valid number between 0 to 5");
			event.target.innerText = originalValue;
			return;
		}
		const tableDataHelper = [...data];
		tableDataHelper[index].Criteria[idx].Score = value;
		setData(tableDataHelper);
		return;
	};
	return (
		<div className="d-flex justify-content-center w-100">
			<table className="border border-gray-300">
				<thead
					style={{
						background: "linear-gradient(90deg, #6E40C1 0%, #8741CA 100%)",
					}}
				>
					<tr className="bg-gray-200">
						<th className="border px-4 py-2">Category</th>
						<th className="border px-4 py-2">Score</th>
					</tr>
				</thead>
				<tbody>
					{Array.isArray(data) &&
						data.map((section, index) => (
							<React.Fragment key={`${index + 1}`}>
								<tr className="bg-gray-100">
									<td
										className="border px-4 py-2 fw-bold d-flex justify-content-between"
										colSpan={3}
									>
										{section.Category}
										<UITooltip
											tooltipContent={
												<div>
													<p>
														<strong>Reason:</strong>{" "}
														{section?.Feedback?.Evidence_for_Score}
													</p>
													<p>
														<strong>Improvement:</strong>{" "}
														{
															section?.Feedback
																?.Improvement_or_Positive_Feedback
														}
													</p>
												</div>
											}
										>
											<IconButton
												className="text-primary p-0 m-0"
												style={{ cursor: "pointer" }}
											>
												<InfoIcon style={{ color: "orange" }} />
											</IconButton>
										</UITooltip>
									</td>
								</tr>
								{section.Criteria.map((criterion, idx) => (
									<tr key={`${index}.${idx + 1}`}>
										<td className="border px-4 py-2">
											{criterion.Description}
										</td>
										<td
											className="border px-4 py-2 text-center"
											contentEditable={editable}
											onBlur={(event) => handleContentEdit(event, index, idx)}
											suppressContentEditableWarning={true}
										>
											{criterion.Score}
										</td>
									</tr>
								))}
							</React.Fragment>
						))}
				</tbody>
			</table>
		</div>
	);
};

export default RubricsTable;
