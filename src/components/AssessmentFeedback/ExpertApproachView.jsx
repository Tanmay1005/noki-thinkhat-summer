import { CancelRounded, Check, ErrorRounded } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Grid,
	Tab,
	Tabs,
	Typography,
	tabsClasses,
} from "@mui/material";
import { jsonToHtml, repairJson } from "helpers/common_helper";
import { useState } from "react";
import ExpertIcon from "../../assets/expert-analysis-icon.svg";
import StudentIcon from "../../assets/student-analysis-icon.svg";
const TabsProps = {
	scrollButtons: "auto",
	className: "new-card-color",
	allowScrollButtonsMobile: true,
	sx: {
		[`& .${tabsClasses.scrollButtons}`]: {
			"&.Mui-disabled": { opacity: 0.3 },
		},
		borderRadius: "35px",
		minHeight: "",
		padding: 0,
		margin: 0,
	},
	TabIndicatorProps: { style: { display: "none" } },
};

const TabStyle = {
	fontWeight: 500,
	fontSize: "14px",
	textTransform: "capitalize",
	whiteSpace: "nowrap",
	minHeight: "auto",
	px: 2.5,
	"&.Mui-selected": {
		backgroundColor: "#5D5FEF",
		color: "white",
		"&:hover": {
			backgroundColor: "#5D5FEF",
		},
		borderRadius: "35px",
	},
};

const statusColors = {
	correct: "#67ba40",
	"partially correct": "#7C8EEE",
	missing: "#FF9D00",
	wrong: "#B22234",
};

export const StatusChip = ({ status }) => {
	if (!status) return null;
	const color = statusColors[status.toLowerCase()] || "default";

	const getChip = () => {
		switch (status?.toLowerCase()) {
			case "correct":
				return (
					<div
						className="d-flex align-items-center justify-content-end text-end gap-1"
						style={{ color: color }}
					>
						<div className="text-white">
							<Check
								sx={{
									height: "20px",
									width: "20px",
									padding: 0,
									margin: 0,
									backgroundColor: color,
									borderRadius: "50%",
								}}
							/>
						</div>
						<div>Correct</div>
					</div>
				);
			case "missing":
				return (
					<div
						className="d-flex align-items-center justify-content-end text-end gap-1"
						style={{ color: color }}
					>
						<div className="text-white">
							<ErrorRounded
								sx={{
									height: "20px",
									width: "20px",
									padding: 0,
									margin: 0,
									backgroundColor: color,
									borderRadius: "50%",
								}}
							/>
						</div>
						<div>Missing</div>
					</div>
				);
			case "wrong":
				return (
					<div
						className="d-flex align-items-center justify-content-end text-end gap-1"
						style={{ color: color }}
					>
						<div className="text-white">
							<CancelRounded
								sx={{
									height: "20px",
									width: "20px",
									padding: 0,
									margin: 0,
									backgroundColor: color,
									borderRadius: "50%",
								}}
							/>
						</div>
					</div>
				);
			case "partially correct":
				return (
					<div
						className="d-flex align-items-center justify-content-end text-end gap-1"
						style={{ color: color }}
					>
						<div className="text-white">
							<Check
								sx={{
									height: "20px",
									width: "20px",
									padding: 0,
									margin: 0,
									backgroundColor: color,
									borderRadius: "50%",
								}}
							/>
						</div>
						<div>Partially Correct</div>
					</div>
				);
			default:
				return null;
		}
	};

	const Chip = getChip();
	return Chip;
};

const Tile = ({
	heading,
	more,
	content,
	status,
	approach,
	index,
	feedback,
}) => (
	<div className="secondary-bg-color rounded-3 mb-3 p-2">
		<Box
			display="flex"
			justifyContent="space-between"
			className={`${approach === "expert" ? "border-bottom" : ""} mb-1`}
		>
			<Typography variant="subtitle1" fontWeight="bold">
				{`${index}. ${heading}`}
			</Typography>
			<div className="d-flex flex-column flex-end">
				{status && <StatusChip status={status} />}
				{more && <Typography fontSize={"0.8rem"}>{more}</Typography>}
			</div>
		</Box>
		{content?.length && (
			<ul
				className="list-group ms-2"
				style={{ marginTop: "8px", paddingLeft: "20px" }}
			>
				{content?.map((item, index) => {
					let jsonData = {};
					if (typeof item?.body === "object" || item?.body?.startsWith("{")) {
						jsonData = repairJson(item?.body);
					}
					return (
						<div key={`${index + 1}`} className="mb-2">
							{item?.body || item?.feedback ? (
								<>
									{item?.body && (
										<>
											{typeof item?.body === "object" ||
											item?.body?.startsWith("{") ? (
												<div
													dangerouslySetInnerHTML={{
														__html: jsonToHtml(jsonData),
													}}
												/>
											) : (
												<li style={{ listStyleType: "disc" }}>
													<div className="d-flex justify-content-between align-items-center">
														<Typography>{item.body}</Typography>
														{item?.status && (
															<StatusChip status={item.status} />
														)}
													</div>
												</li>
											)}
										</>
									)}
									{item?.feedback && (
										<Typography
											variant="body3"
											fontStyle={"italic"}
											color={"textSecondary"}
										>
											{item?.feedback}
										</Typography>
									)}
								</>
							) : (
								<>-</>
							)}
						</div>
					);
				})}
			</ul>
		)}
		{feedback && (
			<Typography variant="body3" fontStyle={"italic"} color={"textSecondary"}>
				{feedback}
			</Typography>
		)}
	</div>
);

const AccordionGroup = ({ heading, content, approach }) => {
	const [expanded, setExpanded] = useState(false);
	return (
		<Accordion
			sx={{ my: 1, overflow: "hidden" }}
			className="rounded rounded-4 shadow-none"
			expanded={expanded}
			onChange={() => setExpanded(!expanded)}
		>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				sx={{ backgroundColor: "#EDE9FF" }}
			>
				<Typography variant="subtitle1" fontWeight="bold">
					{heading}
				</Typography>
			</AccordionSummary>
			<AccordionDetails className="new-card-color">
				{content?.length ? (
					content?.map((data, idx) => (
						<Tile
							approach={approach}
							index={`${idx + 1}`}
							key={`${idx + 1}`}
							{...data}
						/>
					))
				) : (
					<Typography color="textSecondary">No Data Found.</Typography>
				)}
			</AccordionDetails>
		</Accordion>
	);
};

const RenderSection = ({ data, approach }) => (
	<Box>
		{data?.length ? (
			data.map((item, index) => {
				if (item.type === "tile")
					return (
						<Tile
							index={`${index + 1}`}
							key={`${index + 1}`}
							{...item}
							approach={approach}
						/>
					);
				if (item.type === "accordion")
					return (
						<AccordionGroup
							approach={approach}
							key={`${index + 1}`}
							{...item}
						/>
					);
				return null;
			})
		) : (
			<Typography color="textSecondary">No Data Found.</Typography>
		)}
	</Box>
);

const ExpertApproachView = ({ jsonData = {} }) => {
	const sections = Object?.keys?.(jsonData)?.filter(
		(item) => !["title"]?.includes(item),
	);
	const [activeTab, setActiveTab] = useState(0);

	return (
		<Box>
			<div className="d-flex justify-content-center mt-3">
				{sections?.length > 1 && (
					<Tabs
						variant="scrollable"
						value={activeTab}
						onChange={(_e, v) => setActiveTab(v)}
						{...TabsProps}
					>
						{sections?.map?.((section, _index) => (
							<Tab key={section} label={section} sx={{ ...TabStyle }} />
						))}
					</Tabs>
				)}
			</div>

			<Grid
				container
				gap={2}
				mt={1}
				className="d-flex justify-content-between my-3"
			>
				<Grid
					sx={{ maxHeight: "600px" }}
					item
					xs={12}
					md={5.8}
					lg={5.9}
					className="new-card-color d-flex flex-column rounded-4 p-3 px-3 overflow-auto"
				>
					<div className="d-flex gap-1 align-items-center pb-2">
						<div
							className="p-2 rounded rounded-circle"
							style={{ backgroundColor: "#5840ba" }}
						>
							<img
								height={"20px"}
								width={"20px"}
								src={StudentIcon}
								alt="student-icon"
							/>
						</div>
						<Typography variant="h6" gutterBottom className="mt-1">
							{jsonData?.title?.student_approach || "Your Approach"}
						</Typography>
					</div>
					<div className="flex-1 h-100 overflow-auto">
						<RenderSection
							data={jsonData?.[sections?.[activeTab]]?.student_approach || []}
							approach="student"
						/>
					</div>
				</Grid>
				<Grid
					sx={{ maxHeight: "600px" }}
					item
					xs={12}
					md={5.8}
					lg={5.9}
					className="new-card-color d-flex flex-column rounded-4 p-3 px-3 overflow-auto"
				>
					<div className="d-flex gap-1 align-items-center pb-2">
						<div
							className="p-2 rounded rounded-circle"
							style={{ backgroundColor: "#5840ba" }}
						>
							<img
								height={"20px"}
								width={"20px"}
								src={ExpertIcon}
								alt="student-icon"
							/>
						</div>
						<Typography variant="h6" gutterBottom className="mt-1">
							{jsonData?.title?.expert_approach || "Expert Approach"}
						</Typography>
					</div>
					<div className="flex-1 h-100 overflow-auto">
						<RenderSection
							data={jsonData?.[sections?.[activeTab]]?.expert_approach || []}
							approach="expert"
						/>
					</div>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ExpertApproachView;
