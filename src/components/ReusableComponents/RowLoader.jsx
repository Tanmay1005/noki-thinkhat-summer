const { Skeleton } = require("@mui/material");

const RowLoader = () => (
	<div className="d-flex gap-4" style={{ margin: "0 1.5rem 0 0.5rem" }}>
		{[1, 2].map((item) => (
			<Skeleton
				key={`infinite-scroll-scores-${item}`}
				variant="rectangular"
				width="50%"
				height="100px"
				className="col-12 col-md-6 col-lg-6 mb-3 rounded"
			/>
		))}
	</div>
);

export default RowLoader;
