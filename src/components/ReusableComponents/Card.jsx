import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	Badge,
	IconButton,
	Menu,
	MenuItem,
	Tooltip,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { useUserType } from "hooks/useUserType";
import _ from "lodash";
import { useState } from "react";
import AssignedByBadge from "./AssignedByBadge";
import CollapsibleText from "./CollapsibleText";
import ProgressBar from "./ProgressBar";
import UIButton from "./UIButton";

const chipStyleObj = {
	menuButtonStyles: { width: "100%", textTransform: "none" },
	chipStyles: {
		color: "#fff",
		fontWeight: "700",
		borderRadius: "8px",
		height: "1.5rem",
	},
};
const icons = {
	Edit: <EditIcon />,
	Remove: <CancelIcon />,
	Assign: <AssignmentTurnedInOutlinedIcon />,
	"Assign to more groups": <AssignmentTurnedInOutlinedIcon />,
	View: <VisibilityIcon />,
};
const Card = ({
	cardImageClass = "",
	cardClasses = "",
	badgeText = "",
	badgeText2 = "",
	maxLength,
	progress,
	styles,
	name = "",
	description = "",
	jsx = <></>,
	actions,
	createdBy = {},
}) => {
	const userRole = useUserType();

	return (
		<div
			className={`main-bg-color p-2 rounded-4 d-flex align-items-center justify-content-between gap-2 h-100 w-100 ${cardClasses}`}
		>
			<div className="h-100 d-flex gap-2 align-items-center w-100">
				{jsx}
				<div
					className={`${cardImageClass}`}
					style={{
						backgroundPosition: "center",
						...styles?.icon,
					}}
				/>

				<div className="d-flex flex-column gap-2 justify-content-center align-items-start w-100 mt-1">
					{badgeText && (
						<div className="d-flex justify-content-between align-items-center w-100">
							<div className="d-flex align-items-center gap-2">
								<div
									className={"rounded rounded-3 d-inline-block bg-light"}
									style={{
										backgroundColor: "rgba(88, 64, 186, 0.1)",
										fontSize: "0.8rem",
										padding: "1px 8px",
									}}
								>
									<CollapsibleText
										value={badgeText}
										type="tooltip"
										fontWeight={"bold"}
										maxLength={maxLength?.badge || 10}
										color="primary"
										sx={{ ...(styles?.badge || { fontSize: "0.8rem" }) }}
									/>
								</div>

								{!_.isEmpty(createdBy) && userRole !== "Student" && (
									<AssignedByBadge
										name={createdBy.name}
										role={createdBy.role}
									/>
								)}

								{badgeText2 && (
									<div
										className="rounded rounded-3 d-inline-block bg-light "
										style={{
											backgroundColor: "rgba(88, 64, 186, 0.1)",
											fontSize: "0.8rem",
											padding: "1px 8px",
										}}
									>
										<CollapsibleText
											value={badgeText2}
											type="tooltip"
											fontWeight={"bold"}
											maxLength={maxLength?.badge || 10}
											color="green"
											sx={{ ...(styles?.badge || { fontSize: "0.8rem" }) }}
										/>
									</div>
								)}
							</div>

							{/* <div className="d-flex align-items-start">
								<CardActions actions={actions} />
							</div> */}
						</div>
					)}

					<CollapsibleText
						value={name}
						type="tooltip"
						fontWeight={"bold"}
						maxLength={maxLength?.header || 20}
						sx={styles?.header}
						className="text-middle"
					/>

					<CollapsibleText
						value={description}
						type="tooltip"
						previewLength={maxLength?.description || 20}
						sx={styles?.description}
						className="text-middle"
					/>

					{progress >= 0 && <ProgressBar percentage={progress} />}
				</div>
			</div>
			<CardActions actions={actions} styles={styles?.iconPlay} />
		</div>
	);
};

export default Card;

const CardActions = ({ actions, styles }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const theme = useTheme();
	const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
	const open = Boolean(anchorEl);
	const handleClickMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	if (actions?.length <= 0) return;
	if (actions?.length > 1 && isMediumScreen) {
		return (
			<>
				<div className="h-100">
					<IconButton
						id="basic-button"
						aria-controls={open ? "basic-menu" : undefined}
						aria-haspopup="true"
						aria-expanded={open ? "true" : undefined}
						onClick={handleClickMenu}
					>
						<MoreHorizIcon />
					</IconButton>
				</div>
				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleCloseMenu}
					MenuListProps={{
						"aria-labelledby": "basic-button",
					}}
					slotProps={{
						paper: {
							style: {
								border: "1px solid #8170CB",
								borderRadius: "16px",
							},
						},
					}}
				>
					{/* Admin Role */}
					{actions?.map(({ label, badgeContent, handler, disabled }) => {
						return (
							<MenuItem key={label}>
								<Badge
									badgeContent={badgeContent}
									color="error"
									sx={{ width: "100%" }}
								>
									<UIButton
										text={label}
										onClick={handler}
										sx={chipStyleObj.menuButtonStyles}
										disabled={disabled}
									/>
								</Badge>
							</MenuItem>
						);
					})}
				</Menu>
			</>
		);
	}
	return (
		<div className="d-flex flex-column gap-2">
			{actions?.map(
				({ label, badgeContent, handler, color, disabled, type }) => {
					if (type === "button") {
						return (
							<UIButton
								text={label}
								onClick={handler}
								sx={chipStyleObj.menuButtonStyles}
								disabled={disabled}
							/>
						);
					}
					if (label) {
						return (
							<Tooltip title={label} key={label}>
								<Badge badgeContent={badgeContent} color="error">
									<IconButton
										style={
											!color
												? {
														color: disabled ? "#D3D3D3" : "#67BA40",
														border: disabled
															? "1px solid #D3D3D3"
															: "1px solid #67BA40",
													}
												: {}
										}
										color={color}
										onClick={handler}
										disabled={disabled}
									>
										{icons?.[label]}
									</IconButton>
								</Badge>
							</Tooltip>
						);
					}
					return (
						<div
							key={label}
							className="green-play-icon"
							style={{ cursor: "pointer", ...styles }}
							onKeyDown={handler}
							onClick={handler}
						/>
					);
				},
			)}
		</div>
	);
};
