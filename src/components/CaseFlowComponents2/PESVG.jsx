import getSvgFileInfo from "helpers/PESVGHelper";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import parse from "../../helpers/svgParser";
import SVGRenderer from "../ReusableComponents/SVGRenderer";
const hotspots = [
	"0d688dad-e99e-433d-81a8-9e3985691128",
	"a9950cdb-b440-4ae5-8a96-115dbb92ef28",
	"17795314-2422-4c21-a173-190b963f2e7b",
	"ceef1662-ec25-4948-a3e7-7debd8f07440",
	"942367a0-86d6-461e-8098-dc09fa909f3b",
	"9dcb6741-f6dc-4dea-ac77-7bcc4408e7a0",
	"d9db023d-4436-437e-8552-e5c241607dce",
	"d9de9a53-442b-46ee-a165-a855a4a0a8a5",
	"8217300a-83c2-4345-b843-db078ae13699",
	"81e71029-a44f-46d0-987f-d0f55a9d4a3f",
	"0aaffcbc-1a2b-4af7-944a-4791158cd91d",
	"176298f1-4142-41cd-b5d6-3e224531d8bc",
	"086837fa-e730-48d0-bb72-8aeda7291edf",
	"1e7a0ef4-a561-4b1c-9c92-89618c4f7c1f",
];
const assetBaseUrl = `${process.env.REACT_APP_GCS_PUBLIC_BUCKET_URL}/physical-exam-svgs`;
const downloadSVG = async (base, points) => {
	const baseSVG = await fetch(`${assetBaseUrl}/${base}`); // Replace with your URL
	const hotSpotSVG = await fetch(`${assetBaseUrl}/${points}`);
	const baseSVGText = await baseSVG.text();
	const parser = new DOMParser();
	const baseSVGJSX = parser.parseFromString(baseSVGText, "image/svg+xml");
	const parsedHotspots = parse(await hotSpotSVG.text());
	return { base: baseSVGJSX, hotspots: parsedHotspots.children[0] };
};

const PESVG = ({
	fieldName,
	isStudent,
	age,
	gender,
	appearance,
	setLoading,
	peTests,
}) => {
	const { setValue, getValues } = useFormContext();
	const containerRef = useRef(null);
	const [svg, setSvg] = useState({});
	// const [click, setClick] = useState("");
	const physicalExaminationTests = useWatch({
		name: fieldName,
		defaultValue: [],
	});
	const activePE = getValues("activePE");
	const isCaseEditable = useWatch({ name: "isCaseEditable" });
	// const currentStationId = getValues("currentStationId");
	// const expertApproach = getValues(
	// 	`stations.${currentStationId}.expertApproach.PETests`,
	// );
	const getActivePE = (categoryId) => {
		const test = peTests?.find(({ category_path_ids }) =>
			category_path_ids?.includes(categoryId),
		);
		return {
			id: test.test_id,
			name: test.test_name,
			description: test.test_description,
			categoryId: categoryId,
		};
	};
	const handleSelectPE = (categoryId) => {
		if (isCaseEditable) {
			const activePE = getActivePE(categoryId);
			setValue("activePE", activePE);
		}
	};
	const getSVG = async () => {
		try {
			setLoading(true);
			const { base, points } = getSvgFileInfo(age, appearance, gender);
			const svgString = await downloadSVG(base, points);
			const svgElement = svgString.base.documentElement;
			const container = containerRef.current;
			if (container) {
				const children = Array.from(container.children);
				if (children.length > 0) {
					container.removeChild(children[0]);
				}
				container.prepend(svgElement); // ⚠️ Appending raw SVG element — still valid here
			}
			setSvg(svgString);
		} catch (error) {
			console.error("Error fetching SVG:", error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		getSVG();
	}, [age, appearance, gender]);
	const getHotSpots = () => {
		if (isStudent) {
			return hotspots;
		}
		if (physicalExaminationTests?.length > 0) {
			const selectedPEIds = physicalExaminationTests?.map((test) => test?.id);
			const filteredPETests = peTests?.filter(({ test_id }) =>
				selectedPEIds?.includes(test_id),
			);
			const selectedHotspots = filteredPETests?.map(
				({ category_path_ids }) => category_path_ids?.[0],
			);
			return selectedHotspots;
		}
		return [];
	};
	return (
		<div id="pe-root">
			<div id="pe-image" className={age > 7 && "scale"} ref={containerRef}>
				{/* {loading ?
				<div className="h-100 w-100 d-flex justify-content-center align-items-center">
					<CommonProgress />
				</div> : */}

				<SVGRenderer
					node={svg.hotspots}
					click={activePE?.categoryId}
					setClick={handleSelectPE}
					hotSpots={getHotSpots()}
				/>
				{/* } */}
			</div>
		</div>
	);
};
export default PESVG;
