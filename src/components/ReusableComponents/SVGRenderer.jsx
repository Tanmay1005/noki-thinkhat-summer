const SVGRenderer = ({ node, click, setClick, key, hotSpots = [] }) => {
	const handler = (id) => {
		setClick(id);
	};
	if (node?.type === "text") {
		return node.value;
	}

	if (node?.type === "element") {
		const Tag = node.tagName;
		if (Tag === "g" && node.properties.id) {
			if (hotSpots?.includes(node.properties.id)) {
				node.properties.onClick = () => handler(node.properties.id);
				node.properties.style = { cursor: "pointer", display: "block" };
				if (click === node.properties.id) {
					const groupedChildren = node.children.filter(
						(child) => child.tagName === "g",
					)?.[0]?.children;
					for (const child of groupedChildren) {
						switch (child.tagName) {
							case "rect":
								child.properties.style = { fill: "#5840BA" };
								break;
							case "path":
								child.properties.style = { fill: "white" };
								break;
						}
					}
				} else {
					const groupedChildren = node.children.filter(
						(child) => child.tagName === "g",
					)?.[0]?.children;
					for (const child of groupedChildren) {
						switch (child.tagName) {
							case "rect":
								child.properties.style = {};
								break;
							case "path":
								child.properties.style = {};
								break;
						}
					}
				}
			} else {
				node.properties.style = { display: "none" };
			}
		}
		return (
			<Tag key={key} {...node.properties}>
				{node.children?.map((child, i) => (
					<SVGRenderer
						node={child}
						click={click}
						setClick={setClick}
						key={`${i + 1}`}
						hotSpots={hotSpots}
					/>
				))}
			</Tag>
		);
	}

	return null;
};

export default SVGRenderer;
