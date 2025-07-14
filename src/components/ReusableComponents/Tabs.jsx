import { Tab, Tabs, Tooltip } from "@mui/material";

const TabPanel = (props) => {
	const { children, value, index, className, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			className={className ? `${className}` : "p-2"}
			{...other}
		>
			{value === index && children}
		</div>
	);
};

export default TabPanel;

export const a11yProps = (index) => {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
};

export const UITabs = ({
	tabList = [],
	handleTabChange = () => {},
	value = 0,
	sx = {},
	maxTextLength = 30,
	tabsx = {},
	scrollButtons,
	disabled,
	selectedTabSx = {},
}) => {
	const tabProps = {
		tabWrapperProps: {
			padding: 0,
			margin: 0,
			minHeight: "auto",
			width: "100%",
			".MuiTabScrollButton-root": {
				width: "auto",
				padding: "0 5px",
			},
			".MuiTabs-scrollButtons.Mui-disabled": {
				opacity: 0.25,
			},
			...sx,
		},
		singleTabProps: {
			className: "m-0 p-1 px-3",
			sx: {
				textTransform: "none",
				minHeight: "auto",
				...tabsx,
			},
		},
	};

	const handleElipsis = (text) => {
		if (typeof text === "string") {
			if (text.length <= maxTextLength) {
				return text;
			}
			return (
				<Tooltip title={text}>
					<span>{`${text.slice(0, maxTextLength)}...`}</span>
				</Tooltip>
			);
		}
		return text;
	};

	return (
		<Tabs
			sx={{
				...tabProps.tabWrapperProps,
			}}
			variant="scrollable"
			aria-label="scrollable auto tabs example"
			className="border-bottom"
			value={value}
			onChange={handleTabChange}
			allowScrollButtonsMobile
			scrollButtons={scrollButtons}
		>
			{tabList?.map((item, idx) => {
				const isObject = typeof item === "object";
				const labelContent = (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<span>{handleElipsis(isObject ? item?.label : item)}</span>
						{item?.icon && (
							<span style={{ marginLeft: "8px" }}>{item.icon}</span>
						)}
					</div>
				);
				return (
					<Tab
						disabled={disabled}
						{...tabProps?.singleTabProps}
						key={`uitabs-tab-${idx + 1}`}
						label={labelContent}
						value={isObject ? item?.value : idx}
						sx={{
							padding: "5px",
							textTransform: "capitalize",
							fontWeight: "bold",
							...selectedTabSx,
						}}
					/>
				);
			})}
		</Tabs>
	);
};
