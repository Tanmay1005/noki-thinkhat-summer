import { Tab, Tabs } from "@mui/material";

const SwitchTabs = ({
	tabs,
	activeTab,
	onTabChange,
	customStyles = {},
	tabStyles = {},
}) => {
	return (
		<div
			className="rounded-pill"
			style={{
				display: "flex",
				gap: "10px",
				marginBottom: "20px",
				...customStyles,
			}}
		>
			<Tabs
				value={activeTab}
				onChange={onTabChange}
				aria-label="switch tabs"
				variant="fullWidth"
				sx={{
					backgroundColor: "#FFFFFF",
					borderRadius: "35px",
					width: "100%",
					padding: "10px",
					...customStyles,
				}}
				TabIndicatorProps={{ style: { display: "none" } }}
			>
				{tabs.map((tab, index) => (
					<Tab
						key={`tab-${tab.label}-${index}`}
						label={tab.label}
						value={tab.value}
						sx={{
							fontSize: "14px",
							textTransform: "capitalize",
							minHeight: "20px",
							"&.Mui-selected": {
								backgroundColor: "#5840BA",
								color: "white",
								borderRadius: "35px",
							},
							...tabStyles,
						}}
					/>
				))}
			</Tabs>
		</div>
	);
};

export default SwitchTabs;
