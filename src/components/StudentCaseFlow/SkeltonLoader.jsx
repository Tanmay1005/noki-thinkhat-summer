const { Skeleton } = require("@mui/material");

const SkeltonLoader = () => {
	const style = {
		transform: "none",
		WebkitTransform: "none",
	};

	return (
		<div className="row h-100 p-2 m-0">
			<div className="col-md-8 col-sm-12 d-flex flex-column gap-4">
				<Skeleton
					animation="wave"
					height={70}
					width={300}
					className="p-0 m-0"
					sx={style}
				/>
				<Skeleton
					animation="wave"
					height={400}
					width={"100%"}
					className="p-0 m-0 "
					sx={style}
				/>
				<Skeleton
					animation="wave"
					height={100}
					width={"100%"}
					className="p-0 m-0"
					sx={style}
				/>
				<div className="h-100">
					<div className="d-flex gap-4 align-items-start">
						{[1, 2, 3, 4, 5, 6, 7]?.map((item) => (
							<Skeleton
								key={`case-flow-layout-skeleton-${item}`} // This key will have 1,2,3,4,5,6,7 as values so it will be unique
								height={70}
								width={90}
								className="p-0 my-2"
								sx={style}
								animation="wave"
							/>
						))}
					</div>
					<Skeleton
						height={"100%"}
						width={"100%"}
						className="p-0 m-0"
						sx={style}
						animation="wave"
					/>
				</div>
			</div>
			<div className="col-md-4 col-sm-12">
				<Skeleton
					height={"110%"}
					width={"100%"}
					className="p-0 m-0"
					sx={style}
					animation="wave"
				/>
			</div>
		</div>
	);
};

export default SkeltonLoader;
