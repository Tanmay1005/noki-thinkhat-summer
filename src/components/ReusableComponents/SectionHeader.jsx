import { Box, Grid } from "@mui/material";
import "../../styles/section_header.scss";
// import TuneIcon from "@mui/icons-material/Tune";
// import UIButton from "../ReusableComponents/UIButton";

/* props description
    -image:
        --content:pass an image
        --class:className for custom css
    -header:
        --content: Header text
        --class:className for custom css
    -filter
        --list: list of options
        --handleFilter:Function to be invoked when an item is selected
        --icon:icon for filter display
	-isBottom
		--to add border bottom
*/
const SectionHeader = ({ image, header, _filter, isBottom }) => {
	return (
		<Grid
			container
			alignItems="center"
			className={`p-2 ${isBottom && "border-bottom"}`}
		>
			<Grid
				container
				sx={{
					width: "fit-content",
					flexGrow: "1",
					gap: "1rem",
					alignItems: "center",
				}}
			>
				{image?.content && (
					<Box className={`icon-container ${image?.class}`}>
						<img src={image?.content} alt="Header" className="icon" />
					</Box>
				)}
				<div className={`header ${header?.class}`}>{header?.content}</div>
			</Grid>
			{/* Filter has been hidden for now. Will add later */}
			{/* {filter?.isPresent && (
				<Grid item>
					<Filter {...filter} />
				</Grid>
			)}
			{filter?.isPresent && (
				<Grid item>
					<UIButton
						text={"Filters"}
						// onClick={handleFilterClick}
						endIcon={<TuneIcon />}
					/>
				</Grid>
			)} */}
		</Grid>
	);
};

export default SectionHeader;
