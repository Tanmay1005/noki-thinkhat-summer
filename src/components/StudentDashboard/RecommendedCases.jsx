// import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Box, Button, Tooltip, Typography } from "@mui/material";

import { Skeleton } from "@mui/material";
import { GET_RECOMMENDED_CASES } from "adapters/noki_ed.service";
import { convertHtmlToText } from "helpers/common_helper";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import notes from "../../assets/notes.svg";
import SectionHeader from "../../components/ReusableComponents/SectionHeader";
import { imageByType } from "../../helpers/imageHelper";
import UICard from "../ReusableComponents/UICard";
import UICarousel from "../ReusableComponents/UICarousel";

const RecommendedCases = () => {
	const [caseList, setCaseList] = useState([]);
	const [loading, setLoading] = useState(false);
	const handleFilter = (_selectedItem) => {};
	const sectionHeaderProps = {
		header: { content: "Quick Cases" },
		image: { content: notes },
		filter: {
			isPresent: true,
			list: ["Recent Cases", "Quick Cases", "Past Cases"],
			handleFilter,
		},
	};

	const getCaseList = async () => {
		try {
			setLoading(true);
			const cases = await GET_RECOMMENDED_CASES("limit=5");
			setCaseList(cases?.data || []);
		} catch (err) {
			toast.error(err.message || "Error while fetching the quick cases");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getCaseList();
	}, []);

	return (
		<>
			{loading ? (
				<SkeltonLoader sectionHeaderProps={sectionHeaderProps} />
			) : (
				!isEmpty(caseList) && (
					<>
						<SectionHeader {...sectionHeaderProps} />
						<UICarousel
							responsive={[
								{
									breakpoint: 1600,
									settings: {
										slidesToShow: 3,
										// slidesToScroll: sampleData?.length > 3 && 2,
									},
								},
								{
									breakpoint: 1210,
									settings: {
										slidesToShow: 2,
										// slidesToScroll: sampleData?.length > 2 && 1,
									},
								},
								{
									breakpoint: 480,
									settings: {
										slidesToShow: 1,
										// slidesToScroll: 1,
									},
								},
							]}
						>
							{caseList?.map((item, index) => (
								<UICard
									customClasses="card-container carousel-slide"
									key={`recommended-cases-caseList-${item?.name}-${index}`} // Should be unique as we are using index and item.name of each item
									customBodyClasses="card-content"
									CardBody={<CardBody {...item} />}
								/>
							))}
						</UICarousel>
					</>
				)
			)}
		</>
	);
};

const CardBody = ({ name, case_type, description, id, applicable_types }) => {
	const navigate = useNavigate();

	const handleStart = (id, applicable_types) => {
		navigate(`case/${id}?stationId=${applicable_types?.[0]}&osceType=case`);
	};

	return (
		<Box className="d-flex flex-column gap-2 w-100 h-100 justify-content-between">
			<Box className="d-flex flex-column gap-1">
				<Typography
					component="div"
					sx={{
						fontSize: "0.9rem",
						fontWeight: "600",
						lineHeight: "1.2",
						display: "-webkit-box",
						WebkitBoxOrient: "vertical",
						WebkitLineClamp: 2,
						overflow: "hidden",
						marginBottom: "0.5rem",
					}}
				>
					{name}
				</Typography>
				<Tooltip title={convertHtmlToText(description)}>
					<Typography
						sx={{
							fontSize: "0.75rem",
							fontWeight: "300",
							lineHeight: "1.2",
							display: "-webkit-box",
							WebkitBoxOrient: "vertical",
							WebkitLineClamp: 3,
							overflow: "hidden",
						}}
					>
						{convertHtmlToText(description)}
					</Typography>
				</Tooltip>
			</Box>
			<Box className="d-flex justify-content-between align-items-center">
				<Button
					sx={{
						fontSize: "0.75rem",
						fontWeight: "400",
						border: "0.5px solid #5840BA",
						borderRadius: "24px",
						textTransform: "none",
						color: "#5840BA",
						padding: "2px 8px",
						minWidth: "6rem",
					}}
					onClick={() => handleStart(id, applicable_types)}
				>
					Start Test
				</Button>
				<Box>
					<div
						className={`${imageByType("case", {
							case_type,
						})} card-img`}
						style={{ width: "3rem", height: "3rem" }}
					/>
				</Box>
			</Box>
			{/* {created_at && (
				<Typography
					sx={{
						fontSize: "0.625rem",
						fontWeight: "400",
						marginLeft: "0.5rem",
					}}
				>
					Complete by {created_at}
				</Typography>
			)} */}
		</Box>
	);
};

export default RecommendedCases;
const SkeltonLoader = (sectionHeaderProps) => {
	const style = {
		transform: "none",
		WebkitTransform: "none",
	};
	return (
		<>
			<SectionHeader {...sectionHeaderProps} />
			<UICarousel
				responsive={[
					{
						breakpoint: 1600,
						settings: {
							slidesToShow: 3,
						},
					},
					{
						breakpoint: 1210,
						settings: {
							slidesToShow: 2,
						},
					},
					{
						breakpoint: 480,
						settings: {
							slidesToShow: 1,
						},
					},
				]}
			>
				{[1, 2, 3, 4].map((item) => (
					<Box
						key={`skeleton-card-${item}`}
						className="card-container d-flex flex-column w-100 h-100 justify-content-between"
						p={2}
						sx={{
							// Add right margin to create gaps between cards
							mr: { xs: 0, sm: 2 }, // Adjust margin as needed
						}}
					>
						{/* Title and Description Skeletons */}
						<Box className="d-flex flex-column gap-1">
							{/* Title Skeleton */}
							<Skeleton
								variant="text"
								height={30}
								width="80%"
								sx={{
									...style,
									backgroundColor: "#e0e0e0", // Light gray color
								}}
								animation="wave"
							/>
							{/* Description Skeletons */}
							<Skeleton
								variant="text"
								height={20}
								width="100%"
								sx={{
									...style,
									backgroundColor: "#e0e0e0",
								}}
								animation="wave"
							/>
							<Skeleton
								variant="text"
								height={20}
								width="90%"
								sx={{
									...style,
									backgroundColor: "#e0e0e0",
								}}
								animation="wave"
							/>
						</Box>

						{/* Button and Image Skeletons */}
						<Box className="d-flex justify-content-between align-items-center">
							{/* Button Skeleton */}
							<Skeleton
								variant="rectangular"
								height={36}
								width="30%"
								sx={{
									...style,
									backgroundColor: "#e0e0e0",
									borderRadius: "24px",
								}}
								animation="wave"
							/>
							{/* Image Skeleton */}
							<Skeleton
								variant="circular"
								height={48}
								width={48}
								sx={{
									...style,
									backgroundColor: "#e0e0e0",
								}}
								animation="wave"
							/>
						</Box>
					</Box>
				))}
			</UICarousel>
		</>
	);
};
