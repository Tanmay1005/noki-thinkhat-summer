import { Box, keyframes } from "@mui/system";

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.3;
  } 
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const LoadingDots = () => {
	return (
		<Box display="flex" alignItems="center" gap={1}>
			{[0, 1, 2].map((i) => (
				<Box
					key={i}
					sx={{
						width: 8,
						height: 8,
						borderRadius: "50%",
						backgroundColor: "primary.main",
						animation: `${bounce} 1.4s infinite ease-in-out`,
						animationDelay: `${i * 0.2}s`,
					}}
				/>
			))}
		</Box>
	);
};

export default LoadingDots;
