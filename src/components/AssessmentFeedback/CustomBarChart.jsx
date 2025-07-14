import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const CustomBarChart = ({ data, appTheme }) => {
	const barChartColors = [
		"rgba(255, 99, 132, 1)",
		"rgba(54, 162, 235, 1)",
		"rgba(255, 206, 86, 1)",
		"rgba(75, 192, 192, 1)",
		"rgba(153, 102, 255, 1)",
		"rgba(255, 159, 64, 1)",
		"rgba(255, 99, 71, 1)",
		"rgba(60, 179, 113, 1)",
		"rgba(238, 130, 238, 1)",
		"rgba(255, 215, 0, 1)",
		"rgba(30, 144, 255, 1)",
		"rgba(255, 20, 147, 1)",
	];
	const getMarginLeft = () => {
		if (!data || data.length === 0) return 100;
		const maxLength = Math.max(...data.map((item) => item.x.length));
		return Math.min(Math.max(maxLength * 5, 100), 200); // Adjust this multiplier for margin left to wrap the text
	};
	return (
		<ResponsiveContainer width="100%" height={250}>
			<BarChart
				layout="vertical"
				data={data}
				margin={{
					top: 20,
					right: 30,
					left: 5,
					bottom: 5,
				}}
			>
				<XAxis
					type="number"
					domain={[0, 5]}
					ticks={[0, 1, 2, 3, 4, 5]}
					axisLine={false}
					tickLine={false}
				/>
				<YAxis
					type="category"
					dataKey="x"
					width={getMarginLeft()}
					axisLine={false}
					tickLine={false}
					tick={{
						fontSize: window.innerWidth < 600 ? 12 : 12,
						fill: appTheme === "dark" ? "white" : "black",
					}}
				/>
				{/* <Tooltip /> */}
				<Bar
					dataKey="y"
					fill="#8884d8"
					shape={(props) => {
						const { x, y, width, height, index, value } = props;
						return (
							<g>
								<rect
									x={x}
									y={y}
									width={width}
									height={height}
									fill={barChartColors[index % barChartColors.length]}
								/>
								{value > 0 && (
									<text
										x={width > 25.65 ? x + width - 3 : x + width + 25} // Position text near the end of bar
										y={y + height / 2}
										dy={5} //  vertical alignment
										textAnchor="end" // Align text to end of bar
										fill={width > 25.65 ? "white" : "black"} // Text color
										fontSize="12" // Text size
										fontWeight={200}
									>
										{`${value}`}
									</text>
								)}
							</g>
						);
					}}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomBarChart;
