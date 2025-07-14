// example

// const data = [
//     { name: "Active", value: 120 },
//     { name: "Inactive", value: 150 },
// ];
// const COLORS = ["#7340C3", "#CCABFF"];

import { useState } from "react";
import {
	Cell,
	Label,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
} from "recharts";

const CustomLabel = ({ viewBox, value1, value2 }) => {
	const { cx, cy } = viewBox;
	return (
		<>
			<text
				x={cx}
				y={cy - 5}
				textAnchor="middle"
				fontSize={24}
				dominantBaseline="middle"
				className="text-lg font-bold"
			>
				{value1}
			</text>
			<text
				x={cx}
				y={cy + 15}
				textAnchor="middle"
				dominantBaseline="middle"
				className="text-sm"
			>
				{value2}
			</text>
		</>
	);
};

const DashboardPieChart = ({ data, colors }) => {
	const [activeIndex, setActiveIndex] = useState(null);
	const count = data.reduce((acc, { value }) => acc + value, 0);

	const onPieEnter = (_event, index) => {
		setActiveIndex(index);
	};

	const onPieLeave = () => {
		setActiveIndex(null);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				width: "100%",
				height: "100%",
			}}
		>
			<ResponsiveContainer width="100%" height={250}>
				<PieChart>
					<Pie
						data={data}
						innerRadius="50%"
						outerRadius="70%"
						fill="#8884d8"
						paddingAngle={5}
						dataKey="value"
						activeIndex={activeIndex}
						onMouseEnter={onPieEnter}
						onMouseLeave={onPieLeave}
					>
						{data.map((_entry, index) => (
							<Cell
								key={`cell-${index + 1}`}
								fill={colors[index % colors.length]}
								stroke={colors[index % colors.length]}
								strokeWidth={activeIndex === index ? 10 : 1}
								style={{
									filter:
										activeIndex === index
											? `drop-shadow(0px 0px 5px ${colors[colors.length - 1 - index]})`
											: "none",
								}}
							/>
						))}
						<Label
							content={
								activeIndex === null ? (
									<CustomLabel value1={count} value2="Total" />
								) : (
									<CustomLabel
										value1={data[activeIndex].value}
										value2={data[activeIndex].name}
										color={colors[activeIndex]}
									/>
								)
							}
							position="center"
						/>
					</Pie>
					<Legend
						layout="horizontal"
						align="center"
						verticalAlign="bottom"
						iconType="circle"
					/>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};

export default DashboardPieChart;
