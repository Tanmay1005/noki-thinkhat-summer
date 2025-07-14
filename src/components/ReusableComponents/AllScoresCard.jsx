import dayjs from "dayjs";
import { convertHtmlToText } from "helpers/common_helper";
import { useSelector } from "react-redux";
import AssignedByBadge from "./AssignedByBadge";
import CollapsibleText from "./CollapsibleText";
import UIButton from "./UIButton"; // Assuming UIButton is your custom button component

const AllScoresCasesCard = ({
	applicableTypeText,
	imageSrc,
	styles,
	title,
	description,
	onButtonClick = () => {},
	completedDate,
	reviewStatus,
	assignedUser,
}) => {
	const themeMode = useSelector((state) => state.app.theme);
	const textColor = themeMode === "dark" ? "white" : "#5840BA";
	const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";
	const modifiedDate = dayjs(completedDate).format("MM/DD/YYYY");

	return (
		<div
			className="p-2 d-flex flex-row justify-content-between align-items-center  h-100 w-100"
			style={{
				backgroundColor: CardColor2,
				borderRadius: "10px",
			}}
		>
			<div
				className="item d-flex flex-row justify-content-start align-items-center h-100 gap-2"
				style={{ width: "100%" }}
			>
				<div
					className={`${imageSrc}`}
					style={{
						backgroundPosition: "center",
						...styles?.icon,
						width: "20%",
					}}
				/>
				<div
					className="item"
					style={{
						width: "80%",
					}}
				>
					<div className="d-flex gap-2 align-items-center">
						<CollapsibleText
							value={applicableTypeText}
							type="tooltip"
							fontWeight={"bold"}
							color="primary"
							sx={{
								...(styles?.badge || {
									fontSize: "0.7rem",
									padding: "2px",
									backgroundColor: "#5840BA1A",
									width: "max-content",
									borderRadius: "5px",
								}),
							}}
						/>
						<AssignedByBadge
							name={assignedUser?.name}
							role={assignedUser?.role}
						/>
					</div>
					<CollapsibleText value={title} type="tooltip" fontWeight={"bold"} />
					<CollapsibleText
						value={convertHtmlToText(description)}
						type="tooltip"
						sx={{ fontSize: "0.7rem" }}
						color="grey"
					/>

					<p
						className="text-truncate  m-0"
						style={{ fontWeight: 500, fontSize: "12px" }}
					>
						Completed Date: {modifiedDate}
					</p>
				</div>
			</div>
			<div className="item">
				{reviewStatus === "todo" || reviewStatus === "in progress" ? (
					<UIButton
						text="Feedback Pending"
						onClick={onButtonClick}
						variant="contained"
						sx={{
							backgroundColor: textColor,
							textTransform: "capitalize",
							width: "max-content",
						}}
					/>
				) : (
					<UIButton
						text="View"
						onClick={onButtonClick}
						variant="contained"
						sx={{
							backgroundColor: textColor,
							width: "max-content",
							textTransform: "capitalize",
						}}
					/>
				)}
			</div>
		</div>
	);
};

// AllScoresCasesCard.propTypes = {
// 	imageSrc: PropTypes.string.isRequired,
// 	altText: PropTypes.string,
// 	title: PropTypes.string.isRequired,
// 	description: PropTypes.string.isRequired,
// 	onButtonClick: PropTypes.func,
// 	completedDate: PropTypes.string.isRequired,
// 	applicableTypeText: PropTypes.string,
// 	styles: PropTypes.object,
// 	reviewStatus: PropTypes.string,
// };

export default AllScoresCasesCard;
