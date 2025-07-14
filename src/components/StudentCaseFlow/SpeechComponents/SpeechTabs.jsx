import { Box, Tab, Tabs, Typography } from "@mui/material";
import { ReactComponent as ChatIcon } from "assets/chat.svg";
import { ReactComponent as GroupChatIcon } from "assets/group-chat.svg";
import { ReactComponent as MenuBoxIcon } from "assets/menu-box.svg";
import { getSpeechComponentTabStyles } from "helpers/common_helper";
import { FOCUSED_PHYSICAL_EXAMINATION } from "helpers/constants";
import { memo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import ChatComponent from "./ChatComponent";
import DifferentialsComponent from "./DifferentialsComponent";
import PhysicalExamination from "./PhysicalExamination";
import SpeechComponent from "./SpeechComponent";
const tabs = [
	{
		label: "speech",
		Icon: GroupChatIcon,
	},
	{
		label: "chat",
		Icon: ChatIcon,
	},
	{
		label: "differentials",
		Icon: MenuBoxIcon,
	},
];
const getTabContents = (speechType, value) => {
	switch (value) {
		case 1:
			return <ChatComponent speechType={speechType} />;
		case 2:
			return <DifferentialsComponent />;
	}
};
const SpeechTabs = memo(({ message, speechType }) => {
	const [value, setValue] = useState(0);
	const { getValues } = useFormContext();
	const handleTabChange = (_event, newValue) => {
		setValue(newValue);
	};
	const { stationMap } = useSelector((state) => state.stations);
	const stationId = getValues("currentStationId");
	const stationType = stationMap?.[stationId]?.type;

	return (
		<>
			{" "}
			<Box sx={{ display: "flex", justifyContent: "space-between" }}>
				<Typography fontSize="1.25rem">{speechType}</Typography>
				<Tabs
					value={value}
					onChange={handleTabChange}
					aria-label="icon tabs example"
					variant="fullWidth"
					className="secondary-bg-color d-flex justify-content-center align-items-center"
					sx={{ borderRadius: "90px" }}
					TabIndicatorProps={{ style: { display: "none" } }} // Hide underline
				>
					{tabs?.map(({ Icon, label }, index) => (
						<Tab
							key={label}
							icon={<Icon stroke={value === index ? "#fff" : "#000"} />}
							aria-label="phone"
							sx={getSpeechComponentTabStyles(value === index)}
						/>
					))}
				</Tabs>
			</Box>
			<Box
				sx={{
					display: value === 0 ? "block" : "none",
					height: "100%",
					width: "100%",
				}}
			>
				{stationType === FOCUSED_PHYSICAL_EXAMINATION ? (
					<PhysicalExamination liveTranscript={message} />
				) : (
					<SpeechComponent liveTranscript={message} />
				)}
			</Box>
			{getTabContents(speechType, value)}
		</>

		// {
		//     false && (
		//         <Grid item sx={{ margin: "0 1rem" }} className="w-100">
		//             <ChatInput
		//                 placeholder="Interact with patient..."
		//                 sendMessage={handleSendMessage}
		//             />
		//         </Grid>
		//     )
		// }
	);
});

export default SpeechTabs;
