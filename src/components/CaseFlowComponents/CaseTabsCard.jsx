import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { Box, IconButton, Tab, Tabs, Tooltip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import TabPanel from "../ReusableComponents/Tabs";
import UICard from "../ReusableComponents/UICard";

export const CustomScrollButton = (props) => {
	const { direction, disabled, onClick } = props;
	return (
		<IconButton
			onClick={onClick}
			disabled={disabled}
			size="small"
			sx={{
				backgroundColor: "transparent",
				color: "inherit",
				"&:hover": {
					backgroundColor: "transparent",
					color: "inherit",
				},
			}}
		>
			{direction === "left" ? <ArrowBackIos /> : <ArrowForwardIos />}
		</IconButton>
	);
};

const CaseTabsCard = ({ caseDetails }) => {
	const [value, setValue] = useState(0);
	const [ehrData, setEhrData] = useState(null);
	const themeMode = useSelector((state) => state.app.theme);
	const cardColor = themeMode === "dark" ? "#201F48" : "#F7F5FB";

	useEffect(() => {
		if (caseDetails?.ehrData?.length > 0) {
			try {
				const ehrValueString =
					caseDetails.ehrData[0]?.resource?.extension?.[0]?.valueString;
				if (ehrValueString) {
					if (typeof ehrValueString === "object") {
						setEhrData(ehrValueString);
						return;
					}
					const parsedData = JSON.parse(ehrValueString);
					if (parsedData) {
						setEhrData(parsedData);
					}
				}
			} catch (error) {
				console.error("Error parsing ehrData:", error);
			}
		}
	}, [caseDetails?.ehrData]);

	const handleChange = (_event, newValue) => {
		setValue(newValue);
	};

	const tabs = useMemo(() => {
		if (!ehrData) return [];
		return Object.entries(ehrData).map(([key, value]) => ({
			key,
			content: value,
		}));
	}, [ehrData]);

	return (
		<UICard
			customBodyClasses="p-0"
			customClasses="p-0 border-0"
			CardBody={
				<Box sx={{ width: "100%", height: "100%" }}>
					{tabs.length > 0 ? (
						<>
							<Tabs
								value={value}
								onChange={handleChange}
								variant="scrollable"
								scrollButtons="auto"
								allowScrollButtonsMobile
								aria-label="scrollable auto tabs"
								ScrollButtonComponent={CustomScrollButton}
								TabIndicatorProps={{ style: { display: "none" } }}
								sx={{
									"& .MuiTabs-flexContainer": {
										display: "flex",
										justifyContent: "flex-start",
										gap: "8px",
									},
									width: "100%",
								}}
							>
								{tabs.map((tab, index) => (
									<Tooltip title={tab.key} key={tab.key}>
										<Tab
											label={tab.key}
											iconPosition="top"
											id={`tab-${index}`}
											aria-controls={`tabpanel-${index}`}
											sx={{
												fontWeight: 400,
												fontSize: "12px",
												lineHeight: "27.28px",
												textTransform: "capitalize",
												flexShrink: 0,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												"&.Mui-selected": {
													backgroundColor: cardColor,
													"&:hover": {
														backgroundColor: cardColor,
													},
													borderRadius: "16px 16px 0 0",
												},
											}}
										/>
									</Tooltip>
								))}
							</Tabs>
							{tabs.map((tab, index) => (
								<TabPanel
									key={`tabpanel-${tab.key}`}
									value={value}
									index={index}
									id={`tabpanel-${index}`}
									aria-labelledby={`tab-${index}`}
									style={{
										backgroundColor: cardColor,
										minHeight: "100px",
										maxHeight: "300px",
										overflow: "auto",
									}}
								>
									{tab.content ? (
										<div
											className="editInnerHtml"
											dangerouslySetInnerHTML={{
												__html: tab.content,
											}}
										/>
									) : (
										<div
											className="d-flex justify-content-center align-items-center"
											style={{
												minHeight: "100px",
												maxHeight: "200px",
											}}
										>
											No EHR Data for this Case
										</div>
									)}
								</TabPanel>
							))}
						</>
					) : (
						<div
							className="d-flex justify-content-center align-items-center"
							style={{
								minHeight: "100px",
								maxHeight: "200px",
								color: themeMode === "dark" ? "#FFFFFF" : "#000000",
								backgroundColor: cardColor,
							}}
						>
							No EHR Data for this Case
						</div>
					)}
				</Box>
			}
		/>
	);
};

export default CaseTabsCard;
