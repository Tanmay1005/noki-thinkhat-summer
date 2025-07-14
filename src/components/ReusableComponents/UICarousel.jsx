import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const UICarousel = ({ children, endLoading, ...props }) => {
	const settings = {
		dots: false,
		infinite: false,
		speed: 500,
		slidesToShow: 4,
		slidesToScroll: 1,
		initialSlide: 0,
		nextArrow: endLoading ? (
			<CircularProgress
				size="small"
				className="p-0 m-0"
				sx={{
					width: "17px",
					height: "17px",
					marginTop: "-10px",
				}}
			/>
		) : (
			<SampleNextArrow />
		),
		prevArrow: <SamplePrevArrow />,
	};

	return (
		<div className="w-100 px-4">
			<Slider {...settings} {...props}>
				{children}
			</Slider>
		</div>
	);
};

export default UICarousel;

function SampleNextArrow(props) {
	const { className, onClick } = props;
	return (
		<div
			className={`${className} slick-button`}
			onClick={onClick}
			onKeyUp={onClick}
			color="primary"
			aria-label="next"
		>
			<NavigateNext />
		</div>
	);
}

function SamplePrevArrow(props) {
	const { className, onClick } = props;
	return (
		<div
			className={`${className} slick-button`}
			onClick={onClick}
			onKeyUp={onClick}
			aria-label="next"
		>
			<NavigateBefore />
		</div>
	);
}
