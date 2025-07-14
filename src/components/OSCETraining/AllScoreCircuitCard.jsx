import MoreTimeIcon from "@mui/icons-material/MoreTime";
import { Alert, TextField, Tooltip } from "@mui/material";
import AssignedByBadge from "components/ReusableComponents/AssignedByBadge";
import CollapsibleText from "components/ReusableComponents/CollapsibleText";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import dayjs from "dayjs";
import { useState } from "react";
import { useSelector } from "react-redux";

const AllScoreCircuitCard = ({
	cardImageClass = "",
	styles,
	onButtonClick,
	firstCase,
	remainingCount,
	circuitName,
	stationType,
	identifier,
	date,
	userName,
}) => {
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const modifiedDate = dayjs(date).format("MM/DD/YYYY");
	const [open, setOpen] = useState(false);
	const [requestReason, setRequestReason] = useState("");
	const handleModalOpen = () => setOpen(true);
	const requestedStatus =
		circuitName?.circuit?.request_extensions?.[0]?.approved_status;
	const extendedTime =
		circuitName?.circuit?.request_extensions?.[0]?.extended_time;
	const isExtendedTimePast = dayjs(extendedTime) < dayjs(new Date());
	const rejectedReason =
		circuitName?.circuit?.request_extensions?.[0]?.rejected_reason || "";
	const handleModalClose = () => {
		setOpen(false);
		setRequestReason("");
	};
	const overdueDate = modifiedDate;
	const cardBodyContent = (
		<div className="d-flex align-items-start">
			<div
				className={`${cardImageClass} me-3`}
				style={{
					backgroundPosition: "center",
					...styles?.icon,
					width: "50px",
					height: "50px",
				}}
			/>

			<div className="d-flex flex-column">
				<div className="d-flex justify-content-start align-items-center gap-1">
					<div
						className="rounded rounded-3 mb-2 text-center"
						style={{
							backgroundColor: "rgba(88, 64, 186, 0.1)",
							fontSize: "0.8rem",
							padding: "4px 8px",
							alignSelf: "start",
						}}
					>
						<CollapsibleText
							value={stationType}
							type="tooltip"
							fontWeight={"bold"}
							maxLength={10}
							color="primary"
							sx={{ fontSize: "0.8rem" }}
						/>
					</div>
					<div
						className="rounded rounded-3 mb-2 text-center"
						style={{
							backgroundColor: "rgba(88, 64, 186, 0.1)",
							fontSize: "0.8rem",
							padding: "4px 8px",
							alignSelf: "start",
						}}
					>
						<CollapsibleText
							value={firstCase?.case_type}
							type="tooltip"
							fontWeight={"bold"}
							maxLength={10}
							color="green"
							sx={{ fontSize: "0.8rem" }}
						/>
					</div>
				</div>
				<div>
					<CollapsibleText
						value={firstCase?.name}
						type="tooltip"
						fontWeight={"bold"}
						maxLength={20}
						sx={styles?.header}
						className=""
					/>
				</div>
			</div>
		</div>
	);
	const cardActions = () => {
		switch (identifier) {
			case "to-do":
			case "in-progress":
				return (
					<div
						className="green-play-icon"
						style={{ cursor: "pointer", ...styles?.iconPlay }}
						onKeyDown={onButtonClick}
						onClick={onButtonClick}
					/>
				);
			case "overdue": {
				const requestData = {
					circuit_id: circuitName?.circuit?.id,
					circuit_name: circuitName?.circuit?.name,
					reason: requestReason,
					assignerName: circuitName?.assigned_by_user?.name,
					email: circuitName?.assigned_by_user?.email,
					test_assignment_id: circuitName?.id,
					end_time: overdueDate,
				};
				return (
					<div className="d-flex flex-column gap-2 text-end">
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
									width: "100%",
									cursor:
										requestedStatus === "approved" && isExtendedTimePast
											? "not-allowed"
											: requestedStatus === "pending"
												? "not-allowed"
												: "pointer",
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
										onClick={handleModalClose}
									/>
								</div>
								{requestedStatus === "rejected" && (
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
							<div className="d-flex flex-row mt-4 justify-content-center align-items-center px-2 py-2 border-top gap-4">
								<UIButton
									variant="outlined"
									onClick={handleModalClose}
									text={"Cancel"}
									size="medium"
									sx={{
										width: "100%",
										textTransform: "capitalize !important",
									}}
								/>
								<UIButton
									variant="contained"
									text={"Send"}
									size="Medium"
									onClick={() => {
										handleModalClose();
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
				);
			}
			default:
				if (
					circuitName?.review_status === "todo" ||
					circuitName?.review_status === "in progress"
				)
					return (
						<UIButton
							text="Feedback Pending"
							variant="contained"
							sx={{
								textTransform: "capitalize !important",
								width: "100%",
								padding: "10px 5px",
								backgroundColor: textColor,
							}}
							onClick={onButtonClick}
						/>
					);
				return (
					<UIButton
						text="View"
						variant="contained"
						sx={{
							textTransform: "capitalize !important",
							width: "100%",
							padding: "10px 5px",
							backgroundColor: textColor,
						}}
						onClick={onButtonClick}
					/>
				);
		}
	};
	const styleClasses = {
		content:
			remainingCount > 0 ? "col-10 col-md-6" : "col-12 col-lg-8 col-md-9",
		count: "col-2 col-lg-1 col-md-2",
		actions:
			remainingCount > 0
				? "col-12 col-lg-4 col-md-4"
				: "col-12 col-lg-4 col-md-3 col-sm-3",
	};
	const assignedUsername =
		circuitName?.assigned_by_user?.name ||
		circuitName?.circuit?.test_assignments?.[0]?.assigned_by_user?.name;
	const assignedUserRole =
		circuitName?.assigned_by_user?.role ||
		circuitName?.circuit?.test_assignments?.[0]?.assigned_by_user?.role;
	return (
		<div className="my-4">
			<div className="rounded rounded-4 p-4 card-bg-secondary">
				<div className="d-flex align-items-center gap-3 justify-content-between">
					<div className="d-flex gap-2 align-items-center">
						<div
							style={{
								fontWeight: "600",
								fontSize: "2vh",
							}}
						>
							{circuitName?.circuit?.name}
						</div>
						<AssignedByBadge name={assignedUsername} role={assignedUserRole} />
					</div>
					{userName ? (
						<div className="text-end">
							{userName}&nbsp;&nbsp;&nbsp;{modifiedDate}
						</div>
					) : (
						<div className="text-end">
							{!identifier || identifier === "completed"
								? "Completion Date "
								: "Due Date "}
							: {modifiedDate}
						</div>
					)}
				</div>

				<div className="row mt-3 h-100 justify-content-between">
					<div className={styleClasses.content}>
						<div
							className="rounded-5 bg-white h-100 p-3"
							style={{
								border: "none",
								boxShadow: "none",
							}}
						>
							{cardBodyContent}
						</div>
					</div>

					{remainingCount !== 0 && (
						<div className={styleClasses.count}>
							<div
								className="rounded-5 h-100 d-flex justify-content-center align-items-center"
								style={{
									border: "none",
									boxShadow: "none",
								}}
							>
								<div
									style={{
										fontSize: "1.7vh",
									}}
								>
									{`+${remainingCount} more`}
								</div>
							</div>
						</div>
					)}

					<div
						className={`${styleClasses.actions} d-flex align-items-center mt-2 justify-content-md-center`}
					>
						{cardActions()}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AllScoreCircuitCard;
