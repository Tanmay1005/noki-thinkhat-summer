import { Box, Divider, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import osce from "../../assets/osce-lined.svg";
import SectionHeader from "../ReusableComponents/SectionHeader";
import OSCESections from "./OSCESections";

const OSCE = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const isTablet = useMediaQuery(theme.breakpoints.down("md"));

	const handleFilter = () => {};

	const osceHeaderProps = {
		header: {
			content: "OSCE",
			class: "osce-header",
		},
		image: {
			content: osce,
			class: "osce-img",
		},
		isBottom: true,
	};

	const caseHeaderProps = {
		header: {
			content: "Cases",
			class: "osce-case-header",
		},
		filter: {
			isPresent: true,
			list: ["Recent Cases", "Quick Cases", "Past Cases"],
			handleFilter,
		},
	};

	const stationHeaderProps = {
		header: {
			content: "Stations",
			class: "osce-stations-header",
		},
		filter: {
			isPresent: true,
			list: ["Recent Cases", "Quick Cases", "Past Cases"],
			handleFilter,
		},
	};

	const circuitHeaderProps = {
		header: {
			content: "Circuits",
			class: "osce-circuit-header",
		},
		filter: {
			isPresent: true,
			list: ["Recent Cases", "Quick Cases", "Past Cases"],
			handleFilter,
		},
	};

	const sections = [
		{
			type: "cases",
			limit: isMobile ? 3 : 5,
			headerProps: caseHeaderProps,
		},
		{
			type: "stations",
			limit: isMobile ? 3 : 5,
			headerProps: stationHeaderProps,
		},
		{
			type: "circuits",
			limit: isMobile ? 3 : 5,
			headerProps: circuitHeaderProps,
		},
	];

	return (
		<Box
			className="main-bg-color"
			sx={{
				padding: { xs: "0.5rem", sm: "1rem" },
				borderRadius: "12px",
				width: "100%",
			}}
		>
			<SectionHeader {...osceHeaderProps} />
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: { xs: "1rem", md: "2rem" },
					width: "100%",
				}}
			>
				{sections.map((section, index) => (
					<React.Fragment key={`osce-section-${section.type}`}>
						<Box
							sx={{
								flex: 1,
								minWidth: 0, // This allows the flex item to shrink below its minimum content size
							}}
						>
							<OSCESections {...section} />
						</Box>
						{!isTablet && index !== sections.length - 1 && (
							<Divider
								orientation="vertical"
								flexItem
								sx={{
									background: "rgba(224, 224, 255, 1)",
								}}
							/>
						)}
					</React.Fragment>
				))}
			</Box>
		</Box>
	);
};

export default OSCE;
