import { Box, InputBase, Typography, styled } from "@mui/material";
import { GET_ALL_USER_GROUPS } from "adapters/noki_ed.service";
import CreateWrapper from "components/ReusableComponents/CreateWrapper";
import CommonProgress from "components/ReusableComponents/Loaders.jsx";
import SidePanel from "components/ReusableComponents/SidePanel.jsx";
import UIButton from "components/ReusableComponents/UIButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getStations } from "../../redux/thunks/stations.js";
import AssignTest from "./AssignTest.jsx";
import DisplayAssignment from "./DisplayAssignment";

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 2),
		paddingRight: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		[theme.breakpoints.up("sm")]: {
			width: "100%",
			"&:focus": { width: "30ch" },
		},
	},
}));

const Feedback = () => {
	const [userGroups, setUserGroups] = useState([]);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [filter, setFilter] = useState("");
	const [loading, setLoading] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [openAssignDialog, setOpenAssignDialog] = useState(false);
	const reduxDispatch = useDispatch();
	const theme = useSelector((state) => state?.app?.theme);
	const stations = useSelector((state) => state.stations?.data);

	const getUserGroups = useCallback(() => {
		const controller = new AbortController();

		(async () => {
			try {
				setLoading(true);
				const { data } = await GET_ALL_USER_GROUPS(
					{},
					{ signal: controller.signal },
				);
				const groups = data?.user_groups ?? [];
				setUserGroups(groups);
				if (groups.length) setSelectedGroup(groups[0]);
			} catch (err) {
				if (err?.name !== "AbortError") {
					console.error(err);
					toast.error("Failed to fetch user groups");
				}
			} finally {
				setLoading(false);
			}
		})();

		return () => controller.abort();
	}, []);

	useEffect(() => {
		const abortFetch = getUserGroups();
		if (!stations) reduxDispatch(getStations());
		return abortFetch;
	}, [getUserGroups, stations, reduxDispatch]);

	const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

	const handleClickGroup = useCallback((group) => {
		setSelectedGroup(group);
		setMobileOpen(false);
	}, []);

	const handleFilter = useCallback(
		(event) => setFilter(event.target.value),
		[],
	);

	const handleCloseAssignDialog = () => setOpenAssignDialog(false);

	const filteredUserGroups = useMemo(
		() =>
			filter
				? userGroups.filter((g) =>
						g?.name?.toLowerCase().includes(filter.toLowerCase()),
					)
				: userGroups,
		[filter, userGroups],
	);

	const SidebarContent = useMemo(() => {
		return (
			<SidePanel.Container>
				<SidePanel.Header title={`Groups (${userGroups.length})`}>
					<div className="d-flex align-items-center gap-2">
						<UIButton
							variant="outlined"
							onClick={() => setOpenAssignDialog(true)}
							text="Assign Test"
							size="medium"
							sx={{ width: "100%", textTransform: "capitalize !important" }}
						/>
					</div>
				</SidePanel.Header>
				<Box
					sx={{
						borderBottom: "1px solid #E2E8F0",
						paddingBottom: "5px",
						marginBottom: "8px",
					}}
				>
					<SidePanel.SearchBar>
						<StyledInputBase
							placeholder="Search for Groups"
							inputProps={{ "aria-label": "search" }}
							value={filter}
							onChange={handleFilter}
							fullWidth
						/>
					</SidePanel.SearchBar>
				</Box>
				<SidePanel.Body>
					{loading ? (
						<div className="d-flex justify-content-center align-items-center h-100">
							<CommonProgress />
						</div>
					) : filteredUserGroups.length ? (
						<Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
							{filteredUserGroups.map((group) => {
								const isActive = selectedGroup?.id === group.id;
								return (
									<Box
										component="li"
										key={group.id}
										onClick={() => handleClickGroup(group)}
										sx={{
											width: "100%",
											p: "12px",
											mb: "12px",
											cursor: "pointer",
											borderRadius: "12px",
											backgroundColor: isActive
												? "#5840BA0F"
												: theme === "dark"
													? "#333"
													: "#fff",
											border: isActive
												? "1px solid #5840BA"
												: "1px solid transparent",
											"&:hover": {
												backgroundColor: isActive
													? "#5840BA0F"
													: theme === "dark"
														? "#444"
														: "#f1f1f1",
											},
										}}
									>
										<Typography fontSize={14} fontWeight={600} color="#1A202C">
											{group.name}
										</Typography>
										<Typography
											variant="body2"
											fontSize={12}
											color="#718096"
											mt="4px"
										>
											{group.test_assignments_aggregate?.aggregate?.count ?? 0}{" "}
											Assignments |{" "}
											{group.user_group_assignments_aggregate?.aggregate
												?.count ?? 0}{" "}
											Members
										</Typography>
									</Box>
								);
							})}
						</Box>
					) : (
						<Typography className="mx-3">No groups found</Typography>
					)}
				</SidePanel.Body>
			</SidePanel.Container>
		);
	}, [filteredUserGroups, filter, handleFilter, loading, theme, selectedGroup]);

	return (
		<>
			<SidePanel>
				<SidePanel.Mobile
					open={mobileOpen}
					handleDrawerToggle={handleDrawerToggle}
				>
					{SidebarContent}
				</SidePanel.Mobile>
				<SidePanel.DeskTop>{SidebarContent}</SidePanel.DeskTop>
				<SidePanel.Content>
					<DisplayAssignment
						key={selectedGroup?.id ?? "no-group"}
						group={selectedGroup}
					/>
				</SidePanel.Content>
			</SidePanel>
			<CreateWrapper open={openAssignDialog}>
				<AssignTest userGroups={userGroups} onClose={handleCloseAssignDialog} />
			</CreateWrapper>
		</>
	);
};

export default Feedback;
