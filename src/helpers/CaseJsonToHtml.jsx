import { isEmpty } from "lodash";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// MUI Imports
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";

import FileUploadViewer from "components/TestConfiguration/HandleCase/common/FileUploadViewer";
import { useFormContext } from "react-hook-form";
// Note: The 'AccordionFormHelper' component was imported but not used.
// It can be removed if it's not needed elsewhere.
// import AccordionFormHelper from 'components/TestConfiguration/HandleCase/stations/AccordionFormHelper';

const ignoreProperties = [
	"fileId",
	"expertApproach",
	"genericExplanation",
	"scoreRange",
];

const CaseJsonToHtml = ({ name = "" }) => {
	const { getValues } = useFormContext();
	const jsonData = getValues(name);

	const accordionFromJson = [
		{ key: "OLDCARTS", accordionHeaderKey: "Description" },
		{ key: "tests", accordionHeaderKey: "testName" },
	];

	return (
		<div className="p-2 pt-0">
			{jsonToStyledJSX(jsonData, 1, name, accordionFromJson)}
		</div>
	);
};

const isHtmlString = (str) => {
	if (typeof str !== "string") return false;
	// A simple regex to check for the presence of any HTML tag.
	const htmlRegex = /<[a-z][\s\S]*>/i;
	return htmlRegex.test(str);
};

export function jsonToStyledJSX(
	data,
	level = 1,
	parentKey = "",
	accordionFromJson = [],
) {
	if (!data || typeof data !== "object") return null;

	const elements = [];

	for (const key in data) {
		const value = data[key];

		const headingTag = level === 1 ? "h5" : level === 2 ? "h6" : "div";
		const headingStyle =
			level === 1
				? { color: "#5D5FEF", fontWeight: 600, marginTop: "0.5rem" }
				: level === 2
					? { fontWeight: 700, marginTop: "0.5rem" }
					: {};

		const isEmptyValue =
			value === null ||
			value === undefined ||
			(typeof value === "string" && value.trim() === "") ||
			(typeof value === "object" && isEmpty(value));

		if (ignoreProperties?.includes(key)) {
			continue;
		}

		if (key === "documents") {
			const Heading = headingTag;
			elements.push(
				<Heading key={key} style={headingStyle}>
					{formatKey(key)}
				</Heading>,
			);
			elements.push(
				isEmptyValue ? (
					<p
						key={`${key}-empty`}
						style={{ color: "#6c757d", fontStyle: "italic" }}
					>
						No Data Found.
					</p>
				) : (
					<FileUploadViewer
						key={`${key}-viewer`}
						viewOnly={true}
						name={parentKey}
					/>
				),
			);
			continue;
		}

		if (typeof value === "object" && !Array.isArray(value) && !isEmpty(value)) {
			const Heading = headingTag;
			elements.push(
				<Heading key={key} style={headingStyle}>
					{formatKey(key)}
				</Heading>,
			);
			elements.push(
				<div key={`${key}-child`} style={{ marginLeft: `${level * 10}px` }}>
					{jsonToStyledJSX(
						value,
						level + 1,
						`${parentKey}.${key}`,
						accordionFromJson,
					)}
				</div>,
			);
		} else if (Array.isArray(value)) {
			const Heading = headingTag;
			elements.push(
				<Heading key={key} style={headingStyle}>
					{formatKey(key)}
				</Heading>,
			);

			if (isEmpty(value)) {
				elements.push(
					<p
						key={`${key}-empty`}
						style={{ color: "#6c757d", fontStyle: "italic" }}
					>
						No Data Found.
					</p>,
				);
			} else {
				const accordionConfig = accordionFromJson.find(
					(config) => config.key === key,
				);

				if (accordionConfig) {
					elements.push(
						<div
							key={`${key}-accordion-group`}
							className="rounded-4 encounter-overview-panel-card p-2"
						>
							{value.map((item, idx) => {
								if (typeof item === "object" && item !== null) {
									const header =
										item[accordionConfig.accordionHeaderKey] ||
										`${key}-${idx + 1}`;
									const contentData = { ...item };
									delete contentData[accordionConfig.accordionHeaderKey];

									return (
										<Accordion
											className="rounded rounded-4"
											key={`${key}-${idx + 1}`}
											sx={{ my: 1, overflow: "hidden" }}
										>
											<AccordionSummary
												expandIcon={<ExpandMoreIcon />}
												aria-controls={`panel${idx}-content`}
												id={`panel${idx}-header`}
												sx={{ backgroundColor: "#EDE9FF" }}
											>
												<Typography sx={{ fontWeight: "bold" }}>
													{header}
												</Typography>
											</AccordionSummary>
											<AccordionDetails>
												{jsonToStyledJSX(
													contentData,
													level + 1,
													`${parentKey}.${key}.${idx}`,
													accordionFromJson,
												)}
											</AccordionDetails>
										</Accordion>
									);
								}
								return <li key={`${idx + 1}`}>{item}</li>;
							})}
						</div>,
					);
				} else {
					elements.push(
						<ul key={`${key}-ul`} className="mb-2">
							{value.map((item, idx) =>
								typeof item === "object" ? (
									<li key={`${idx + 1}-li`}>
										{jsonToStyledJSX(
											item,
											level + 1,
											`${parentKey}.${key}.${idx}`,
											accordionFromJson,
										)}
									</li>
								) : (
									<li key={item}>{item}</li>
								),
							)}
						</ul>,
					);
				}
			}
		} else {
			let displayValue;

			// Check if the value is an HTML string
			if (isHtmlString(value)) {
				displayValue = <div dangerouslySetInnerHTML={{ __html: value }} />;
			} else if (isEmptyValue) {
				displayValue = (
					<span style={{ color: "#6c757d", fontStyle: "italic" }}>
						No Data Found.
					</span>
				);
			} else {
				displayValue = value;
			}

			const formattedKey = formatKey(key);

			formattedKey?.toLowerCase() === "task"
				? elements.unshift(
						<div key={key}>
							<h5
								style={{
									color: "#5D5FEF",
									fontWeight: 600,
									marginTop: "0.5rem",
								}}
							>
								{formattedKey}
							</h5>{" "}
							<div className="ms-4">{displayValue}</div>
						</div>,
					)
				: formattedKey?.toLowerCase() === "category"
					? elements.push(
							<h6 key={key}>
								{formattedKey?.toLowerCase() === "value" ? (
									<>{displayValue}</>
								) : (
									<>
										<strong>{formattedKey}</strong>: {displayValue}
									</>
								)}
							</h6>,
						)
					: elements.push(
							<li key={key}>
								{formattedKey?.toLowerCase() === "value" ? (
									<>{displayValue}</>
								) : (
									<>
										<strong>{formattedKey}</strong>: {displayValue}
									</>
								)}
							</li>,
						);
		}
	}

	return <>{elements}</>;
}

function formatKey(key) {
	return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default CaseJsonToHtml;
