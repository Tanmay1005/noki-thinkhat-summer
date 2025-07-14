import { GET_CASE_LIST } from "adapters/noki_ed.service";
import FallBackLoader from "components/FallbackLoader";
import Card from "components/ReusableComponents/Card";
import InfiniteScroll from "components/ReusableComponents/InfiniteScroll";
import { convertHtmlToText } from "helpers/common_helper";
import { imageByType } from "helpers/imageHelper";
import useDebounce from "hooks/useDebounce";
import useMultiStationCase from "hooks/useMultiStationCase";
import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getStations } from "../../redux/thunks/stations.js";
import MultiStationCaseSelectionModal from "./MultiStationCaseSelectionModal";

const StudentCaseList = memo(
	({ filter, setCaseFilter, setFilter, searchTerm, isMultiStationCase }) => {
		const [casesList, setCasesList] = useState([]);
		const [pageLoader, setPageLoader] = useState(false);
		const [page, setPage] = useState(0);
		const [isPageReset, setIsPageReset] = useState(false);
		const [hasMore, setHasMore] = useState(false);
		const [loading, setLoading] = useState(true);
		const debouncedSearchTerm = useDebounce(searchTerm, 500);
		const debouncedFilter = useDebounce(filter, 500);
		const {
			showDialog,
			selectedModel,
			setShowDialog,
			handleModelChange,
			attemptDetails,
			getNextStation,
			createAttempt,
			caseDetails,
			nextLoading,
			findAttempt,
		} = useMultiStationCase("public");
		// const auth = useSelector((state) => state?.auth?.personData);
		const stationMap = useSelector((state) => state?.stations?.stationMap);
		const reduxDispatch = useDispatch();
		const navigate = useNavigate();
		const pageSize = 20;
		useEffect(() => {
			if (isPageReset || page > 0) {
				fetchCases();
				setIsPageReset(false);
			}
		}, [page, isPageReset]);

		const fetchCases = async (visibility = ["public"]) => {
			try {
				// setLoading(true);
				setPageLoader(true);
				const response = await GET_CASE_LIST({
					visibility,
					page,
					pageSize,
					isMultiStationCase,
					...(debouncedSearchTerm && { filter: debouncedSearchTerm }),
					...(debouncedFilter && { speciality: debouncedFilter }),
				});
				const cases = response?.data?.data;
				setCasesList((prev) => [...prev, ...cases]);
				setCaseFilter((prev) => [...prev, ...cases]);
				setHasMore((page + 1) * pageSize < response?.data?.count);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
				setPageLoader(false);
			}
		};
		// useEffect(() => {
		// 	if (filter && filter.length > 0) {
		// 		const filtered = caseFilter.filter((item) =>
		// 			filter.some((filterItem) => filterItem === item?.case_type),
		// 		);
		// 		setCasesList(filtered);
		// 	} else {
		// 		setCasesList(caseFilter);
		// 	}
		// }, [filter]);

		useEffect(() => {
			setPage(0);
			setCaseFilter([]);
			setCasesList([]);
			setIsPageReset(true);
		}, [debouncedFilter, debouncedSearchTerm]);

		useEffect(() => {
			if (!Object.keys(stationMap).length) {
				reduxDispatch(getStations());
			}
			return () => {
				setFilter([]);
			};
		}, []);
		useEffect(() => {
			setPage(0);
			setCaseFilter([]);
			setCasesList([]);
			setIsPageReset(true);
		}, [isMultiStationCase]);

		if (loading) {
			return (
				<div
					className="d-flex justify-content-center align-items-center"
					style={{ height: "50vh" }}
				>
					<FallBackLoader />
				</div>
			);
		}
		const handleCaseAttempt = (item) => {
			if (isMultiStationCase) {
				findAttempt(item);
				return;
			}
			navigate(
				`/case/${item?.id}?stationId=${item?.applicable_types?.[0]}&osceType=case`,
			);
		};
		return (
			<>
				<MultiStationCaseSelectionModal
					showDialog={showDialog}
					setShowDialog={setShowDialog}
					attemptDetails={attemptDetails}
					caseDetails={caseDetails}
					handleModelChange={handleModelChange}
					selectedModel={selectedModel}
					getNextStation={getNextStation}
					createAttempt={createAttempt}
					loading={nextLoading}
				/>
				<InfiniteScroll
					setPage={setPage}
					hasMore={hasMore}
					isLoading={pageLoader}
					// loader={<Loader />}
				>
					<div className="d-flex flex-column gap-3 ">
						{casesList?.length === 0 && !pageLoader ? (
							<div
								className="d-flex justify-content-center align-items-center"
								style={{ height: "50vh" }}
							>
								No Cases available
							</div>
						) : (
							<div className="row p-0 m-0">
								{casesList?.map((item, idx) => (
									<div
										className="col-md-6 col-lg-4 p-2"
										key={`student-case-list-case-id-${item?.id}-${idx}`} // Must be unique as we are using index and case id
									>
										<Card
											cardImageClass={imageByType("cases", item)}
											item={item}
											name={item?.name}
											description={convertHtmlToText(item?.description)}
											badgeText={item?.case_type}
											badgeText2={
												!isMultiStationCase &&
												stationMap[item?.applicable_types?.[0]]?.type
											}
											styles={{ iconPlay: { height: "2rem" } }}
											actions={[
												{
													handler: () => handleCaseAttempt(item),
												},
											]}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</InfiniteScroll>
			</>
		);
	},
);

export default StudentCaseList;
