import { Skeleton } from "@mui/material";
import { useEffect, useRef, useState } from "react";

// Reusable InfiniteScroll component
const InfiniteScroll = ({ children, hasMore, isLoading, loader, setPage }) => {
	const observer = useRef(null);
	const lastElementRef = useRef(null);
	const [currentPage, setCurrentPage] = useState(1);
	useEffect(() => {
		if (lastElementRef.current) {
			observer.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && hasMore && !isLoading) {
						setPage((prev) => {
							setCurrentPage(prev + 1);
							return prev + 1;
						});
					}
				},
				{
					root: null,
					rootMargin: "100px",
					threshold: 0.1,
				},
			);
			observer.current.observe(lastElementRef.current);
		}

		return () => {
			if (observer.current && lastElementRef.current) {
				observer.current.unobserve(lastElementRef.current);
			}
		};
	}, [hasMore, isLoading]);
	return (
		<div>
			{children}
			{hasMore && !isLoading && (
				<div ref={lastElementRef} style={{ height: "1px" }} />
			)}
			{isLoading &&
				(loader ? (
					loader
				) : (
					<Skeleton
						variant="rectangular"
						width="full"
						height={118}
						className="m-4 rounded"
					/>
				))}
			{!hasMore && currentPage > 1 && (
				<div className="text-center p-2">
					{!isLoading && <span>No More Results</span>}
				</div>
			)}
		</div>
	);
};

export default InfiniteScroll;
