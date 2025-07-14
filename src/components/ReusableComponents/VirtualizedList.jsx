import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from "react";

const VirtualizedList = ({
	items = [],
	itemHeight = 50,
	containerHeight = 400, // Keep as fallback, but will use actual container height
	renderItem,
	onSelectionChange,
	multiSelect = false,
	selectedItems = [],
	overscan = 5,
	className = "",
	...props
}) => {
	const [scrollTop, setScrollTop] = useState(0);
	const [selectedIds, setSelectedIds] = useState(new Set(selectedItems));
	const [actualContainerHeight, setActualContainerHeight] =
		useState(containerHeight);
	const containerRef = useRef(null);
	const scrollElementRef = useRef(null);

	// Update actual container height when container size changes
	useEffect(() => {
		const updateContainerHeight = () => {
			if (containerRef.current) {
				const height = containerRef.current.clientHeight;
				setActualContainerHeight(height || containerHeight);
			}
		};

		updateContainerHeight();

		const resizeObserver = new ResizeObserver(() => {
			updateContainerHeight();
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [containerHeight]);

	// Calculate visible range with overscan
	const visibleRange = useMemo(() => {
		const visibleStart = Math.floor(scrollTop / itemHeight);
		const visibleEnd = Math.min(
			visibleStart + Math.ceil(actualContainerHeight / itemHeight),
			items.length - 1,
		);

		return {
			start: Math.max(0, visibleStart - overscan),
			end: Math.min(items.length - 1, visibleEnd + overscan),
		};
	}, [scrollTop, itemHeight, actualContainerHeight, items.length, overscan]);

	// Get visible items
	const visibleItems = useMemo(() => {
		const result = [];
		for (let i = visibleRange.start; i <= visibleRange.end; i++) {
			result.push({
				index: i,
				item: items[i],
				id: items[i]?.id || i,
			});
		}
		return result;
	}, [items, visibleRange]);

	// Handle scroll
	const handleScroll = useCallback((e) => {
		setScrollTop(e.target.scrollTop);
	}, []);

	// Handle item selection
	const handleItemSelect = useCallback(
		(itemId, index, item) => {
			let newSelectedIds;

			if (multiSelect) {
				newSelectedIds = new Set(selectedIds);
				if (newSelectedIds.has(itemId)) {
					newSelectedIds.delete(itemId);
				} else {
					newSelectedIds.add(itemId);
				}
			} else {
				newSelectedIds = new Set([itemId]);
			}

			setSelectedIds(newSelectedIds);

			if (onSelectionChange) {
				onSelectionChange(Array.from(newSelectedIds), itemId, index, item);
			}
		},
		[selectedIds, multiSelect, onSelectionChange],
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e) => {
			if (!items.length) return;

			const selectedArray = Array.from(selectedIds);
			const currentIndex =
				selectedArray.length > 0
					? items.findIndex(
							(item) =>
								(item?.id || items.indexOf(item)) ===
								selectedArray[selectedArray.length - 1],
						)
					: -1;

			let newIndex = currentIndex;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					newIndex = Math.min(currentIndex + 1, items.length - 1);
					break;
				case "ArrowUp":
					e.preventDefault();
					newIndex = Math.max(currentIndex - 1, 0);
					break;
				case "Home":
					e.preventDefault();
					newIndex = 0;
					break;
				case "End":
					e.preventDefault();
					newIndex = items.length - 1;
					break;
				default:
					return;
			}

			if (newIndex !== currentIndex && newIndex >= 0) {
				const newItem = items[newIndex];
				const newItemId = newItem?.id || newIndex;

				if (!multiSelect || !e.shiftKey) {
					setSelectedIds(new Set([newItemId]));
					if (onSelectionChange) {
						onSelectionChange([newItemId], newItemId, newIndex, newItem);
					}
				}

				// Scroll to item if needed
				scrollToIndex(newIndex);
			}
		},
		[items, selectedIds, multiSelect, onSelectionChange],
	);

	// Scroll to specific index
	const scrollToIndex = useCallback(
		(index) => {
			if (!scrollElementRef.current) return;

			const scrollTop = index * itemHeight;
			const scrollBottom = scrollTop + itemHeight;
			const viewTop = scrollElementRef.current.scrollTop;
			const viewBottom = viewTop + actualContainerHeight;

			if (scrollTop < viewTop) {
				scrollElementRef.current.scrollTop = scrollTop;
			} else if (scrollBottom > viewBottom) {
				scrollElementRef.current.scrollTop =
					scrollBottom - actualContainerHeight;
			}
		},
		[itemHeight, actualContainerHeight],
	);

	// Update selected items when prop changes
	useEffect(() => {
		setSelectedIds(new Set(selectedItems));
	}, [selectedItems]);

	// Default item renderer
	const defaultRenderItem = useCallback(
		({ item, _index, isSelected, onSelect }) => (
			<div
				onClick={() => onSelect()}
				style={{ height: itemHeight }}
				className={`virtualized-list-item ${isSelected ? "selected" : ""}`}
				onKeyDown={(_e) => {}}
			>
				{typeof item === "object" ? JSON.stringify(item) : String(item)}
			</div>
		),
		[itemHeight],
	);

	const itemRenderer = renderItem || defaultRenderItem;

	return (
		<div
			ref={containerRef}
			className={`virtualized-list-container ${className}`}
			style={{ height: "100%" }}
			onKeyDown={handleKeyDown}
			{...props}
		>
			<div
				ref={scrollElementRef}
				className="virtualized-list-scroll-container"
				style={{
					height: "100%",
					overflow: "auto",
					scrollBehavior: "smooth",
					scrollbarWidth: "thin",
				}}
				onScroll={handleScroll}
			>
				<div
					className="virtualized-list-spacer"
					style={{ height: items.length * itemHeight }}
				>
					<div
						className="virtualized-list-content"
						style={{
							transform: `translateY(${visibleRange.start * itemHeight}px)`,
						}}
					>
						{visibleItems.map(({ item, index, id }) => {
							const isSelected = selectedIds.has(id);

							return (
								<VirtualizedListItem
									key={id}
									item={item}
									index={index}
									id={id}
									isSelected={isSelected}
									onSelect={() => handleItemSelect(id, index, item)}
									renderer={itemRenderer}
									height={itemHeight}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

// Memoized list item component to prevent unnecessary re-renders
const VirtualizedListItem = React.memo(
	({ item, index, id, isSelected, onSelect, renderer, height }) => {
		return (
			<div className="virtualized-list-item-wrapper" style={{ height }}>
				{renderer({
					item,
					index,
					id,
					isSelected,
					onSelect,
				})}
			</div>
		);
	},
);

VirtualizedListItem.displayName = "VirtualizedListItem";

export default VirtualizedList;
