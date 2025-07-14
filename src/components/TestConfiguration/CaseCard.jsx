import MoreTimeIcon from "@mui/icons-material/MoreTime";
import { Alert, TextField, Tooltip } from "@mui/material";
import AssignedByBadge from "components/ReusableComponents/AssignedByBadge";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import { useState } from "react";
import CollapsibleText from "../ReusableComponents/CollapsibleText";

const CaseCard = ({
	cardImageClass = "",
	badgeText = "",
	badgeText2 = "",
	maxLength,
	name = "",
	assignedUser = {},
	description = "",
	footerText = "",
	isButtonDisplay,
	isOverdue = false,
	overdueDate = "",
	styles = {},
	caseDetails,
	onButtonClick,
	onClick = () => {},
}) => {
	const [open, setOpen] = useState(false);
	const [requestReason, setRequestReason] = useState("");
	const handleModalOpen = () => setOpen(true);
	const requestedStatus =
		caseDetails?.case?.request_extensions?.[0]?.approved_status;
	const extendedTime =
		caseDetails?.case?.request_extensions?.[0]?.extended_time;
	const isExtendedTimePast = dayjs(extendedTime) < dayjs(new Date());
	const rejectedStatus =
		caseDetails?.case?.request_extensions?.[0]?.approved_status === "rejected";
	const rejectedReason =
		caseDetails?.case?.request_extensions?.[0]?.rejected_reason || "";
	const handleClose = () => {
		setOpen(false);
		setRequestReason("");
	};
	const requestData = {
		case_id: caseDetails?.case?.id,
		case_name: caseDetails?.case?.name,
		reason: requestReason,
		assignerName: caseDetails?.assigned_by_user?.name,
		email: caseDetails?.assigned_by_user?.email,
		test_assignment_id: caseDetails?.id,
		end_time: overdueDate,
	};

	return (
		<div
			className={
				"main-bg-color p-2 rounded-4 d-flex align-items-center justify-content-between gap-2 h-100 w-100"
			}
		>
			<div className="h-100 d-flex gap-2 align-items-center w-100">
				<div
					className={`${cardImageClass}`}
					style={{
						backgroundPosition: "center",
						...styles.icon,
					}}
				/>

				<div className="d-flex flex-column gap-1 justify-content-center align-items-start w-100">
					{badgeText && (
						<div className="d-flex gap-2">
							<div
								className="rounded rounded-3 d-inline-block bg-light"
								style={{
									backgroundColor: "rgba(88, 64, 186, 0.1)",
									fontSize: "0.8rem",
									padding: "1px 8px",
									...styles.badgeText,
								}}
							>
								<CollapsibleText
									value={badgeText}
									type="tooltip"
									fontWeight={"bold"}
									maxLength={maxLength?.badge || 10}
									color="primary"
									sx={{ fontSize: "0.8rem" }}
								/>
							</div>

							{badgeText2 && (
								<div
									className="rounded rounded-3 d-inline-block bg-light "
									style={{
										backgroundColor: "rgba(88, 64, 186, 0.1)",
										fontSize: "0.8rem",
										padding: "1px 8px",
										...styles.badgeText2,
									}}
								>
									<CollapsibleText
										value={badgeText2}
										type="tooltip"
										fontWeight={"bold"}
										maxLength={maxLength?.badge || 10}
										color="green"
										sx={{ fontSize: "0.8rem" }}
									/>
								</div>
							)}
							{assignedUser?.name && (
								<AssignedByBadge
									name={assignedUser.name}
									role={assignedUser.role}
								/>
							)}
						</div>
					)}

					<CollapsibleText
						value={name}
						type="tooltip"
						fontWeight={"bold"}
						maxLength={maxLength?.header || 20}
						className="text-middle"
					/>

					<CollapsibleText
						value={description}
						type="tooltip"
						previewLength={maxLength?.description || 20}
						className="text-middle"
					/>
					{footerText && (
						<p
							className="text-truncate  m-0"
							style={{
								fontWeight: 500,
								fontSize: "12px",
								...styles.footerText,
							}}
						>
							{footerText}
						</p>
					)}
				</div>
			</div>
			{isButtonDisplay && (
				<div
					className="green-play-icon"
					style={{ cursor: "pointer" }}
					onKeyDown={onClick}
					onClick={onClick}
				/>
			)}
			{isOverdue && (
				<div className="d-flex flex-column gap-2 px-3 justify-content-between">
					<Tooltip
						title={
							requestedStatus === "rejected"
								? "Request Rejected"
								: requestedStatus === "approved" && isExtendedTimePast
									? "You can't request again as your requested approval is expired."
									: requestedStatus === "pending"
										? "Waiting for Request Approval"
										: "Request for Date Extension"
						}
						arrow
					>
						<div
							role="button"
							tabIndex={0}
							style={{
								width: "10%",
								cursor:
									requestedStatus === "approved" && isExtendedTimePast
										? "not-allowed"
										: requestedStatus === "pending"
											? "not-allowed"
											: "pointer",

								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
							onClick={
								requestedStatus === "approved" && isExtendedTimePast
									? null
									: requestedStatus === "pending"
										? null
										: handleModalOpen
							}
							onKeyDown={(e) => {
								if (
									!requestedStatus === "pending" &&
									!(requestedStatus === "approved" && isExtendedTimePast) &&
									(e.key === "Enter" || e.key === " ")
								) {
									e.preventDefault();
									handleModalOpen();
								}
							}}
						>
							<MoreTimeIcon
								sx={{
									fontSize: 28,
									color:
										requestedStatus === "rejected"
											? (theme) => theme.palette.error.main
											: requestedStatus === "approved" && isExtendedTimePast
												? "gray"
												: requestedStatus === "pending"
													? (theme) => theme.palette.warning.main
													: "#5D5FEF",
									pointerEvents:
										requestedStatus === "approved" && isExtendedTimePast
											? "none"
											: requestedStatus === "pending"
												? "none"
												: "auto",
								}}
							/>
						</div>
					</Tooltip>
					<UIModal
						open={open}
						displayCloseIcon={false}
						width={400}
						style={{ p: 2 }}
					>
						<div className="d-flex flex-column gap-4">
							<div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom">
								<h5 className="m-0 fw-bold">Request For Date Extension</h5>
								<button
									type="button"
									className="btn-close"
									aria-label="Close"
									onClick={handleClose}
								/>
							</div>
							{rejectedStatus && (
								<Alert severity="warning" sx={{ fontSize: 14 }}>
									Rejected Reason:{" "}
									{rejectedReason || "Your previous request was rejected."}
								</Alert>
							)}
							<TextField
								label="Write Your Reason Here"
								multiline
								rows={3}
								value={requestReason}
								onChange={(e) => setRequestReason(e.target.value)}
								fullWidth
							/>
						</div>
						<div className="d-flex flex-row mt-4 justify-content-center align-items-center px-2 py-2 gap-4 border-top">
							<UIButton
								variant="outlined"
								onClick={handleClose}
								text={"cancel"}
								size="medium"
								sx={{
									width: "100%",
									textTransform: "capitalize !important",
								}}
							/>
							<UIButton
								variant="contained"
								text={"Send"}
								size="medium"
								onClick={() => {
									handleClose();
									onButtonClick(requestData);
								}}
								disabled={!requestReason.trim()}
								sx={{
									width: "100%",
									textTransform: "capitalize !important",
								}}
							/>
						</div>
					</UIModal>
				</div>
			)}
		</div>
	);
};

export default CaseCard;
