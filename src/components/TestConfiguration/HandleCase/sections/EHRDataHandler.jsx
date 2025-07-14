import { Close } from "@mui/icons-material";
import { Tab, Tabs, Typography } from "@mui/material";
import { UITabs, a11yProps } from "components/ReusableComponents/Tabs";
import UIButton from "components/ReusableComponents/UIButton";
import UIModal from "components/ReusableComponents/UIModal";
import { startCase } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import AttachmentsModal from "../common/AttachmentsModal";
import ClinicalReasoning from "../ehr/ClinicalReasoning";
import DefaultEHRForm from "../ehr/DefaultEHRForm";
import FacultyEvaluation from "../ehr/FacultyEvaluation";
import MedicalSocialBackground from "../ehr/MedicalSocialBackground";
import Objective from "../ehr/Objective";
import PatientOverview from "../ehr/PatientOverview";
import Subjective from "../ehr/Subjective";
import { AddCustomValueHelper } from "../manageCaseHelper";

const componentMap = {
	"Patient Overview": PatientOverview,
	Subjective: Subjective,
	"Medical And Social Background": MedicalSocialBackground,
	Objective: Objective,
	"Clinical Reasoning": ClinicalReasoning,
	"Faculty Evaluation": FacultyEvaluation,
};

const ignoreEHRTabs = ["isExisting"];

const EHRDataHandler = () => {
	const methods = useFormContext();
	const {
		control,
		getValues,
		// watch,
		unregister,
		formState: { _errors, _isValid },
	} = methods;
	const isCaseEditable = getValues("isCaseEditable");
	const isLoading = getValues("loading");

	const [tab, setTab] = useState("Past_Encounter_EHR");
	const EhrTab = [
		{ label: "Current Encounter", value: "Current_Encounter_EHR" },
		{ label: "Past Encounter", value: "Past_Encounter_EHR" },
	];
	const [tabsList, setTabsList] = useState({
		Current_Encounter_EHR: [],
		Past_Encounter_EHR: [],
	});
	const [ehrValue, setEhrValue] = useState({
		Current_Encounter_EHR: "",
		Past_Encounter_EHR: "",
	});
	const [customTabName, setCustomTabName] = useState("");
	const [tabErrorMessage, setTabErrorMessage] = useState("");
	const [openConfirm, setOpenConfirm] = useState({
		isOpen: false,
		index: null,
	});
	const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
	const ehrData = useWatch({ control, name: "ehrTabMapper" });
	const isInitialized = useRef(false);
	const SelectedComponent =
		componentMap[startCase(ehrValue?.[tab])] || DefaultEHRForm;

	const handleTabChange = (_e, value) => {
		setTab(value);
	};

	useEffect(() => {
		if (
			!isInitialized.current &&
			ehrData?.Current_Encounter_EHR &&
			ehrData?.Past_Encounter_EHR
		) {
			const currentTabs = ehrData?.Current_Encounter_EHR?.filter(
				(item) => !ignoreEHRTabs?.includes(item),
			);
			const pastTabs = ehrData?.Past_Encounter_EHR?.filter(
				(item) => !ignoreEHRTabs?.includes(item),
			);

			setTabsList({
				Current_Encounter_EHR: currentTabs,
				Past_Encounter_EHR: pastTabs,
			});

			setEhrValue({
				Current_Encounter_EHR: currentTabs?.[0] || "",
				Past_Encounter_EHR: pastTabs?.[0] || "",
			});

			isInitialized.current = true;
		}
	}, [ehrData]);

	const handleChange = (_event, newValue) => {
		setEhrValue((prev) => ({ ...prev, [tab]: newValue }));
	};

	const normalizeTabName = (name) => {
		return name
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("_");
	};

	const onAddTab = () => {
		const normalizedName = normalizeTabName(customTabName);

		if (tabsList?.[tab]?.length >= 15) {
			return setTabErrorMessage("Max limit of tab exceeded.");
		}

		if (
			tabsList?.[tab]?.find(
				(item) => item.toUpperCase() === normalizedName.toUpperCase(),
			)
		) {
			setTabErrorMessage(`${normalizedName} tab already exists.`);
			return;
		}

		setTabsList((prev) => ({
			...prev,
			[tab]: [...prev[tab], normalizedName],
		}));

		setEhrValue((prev) => ({
			...prev,
			[tab]: normalizedName,
		}));

		setCustomTabName("");
		setTabErrorMessage("");
	};

	const handleTabRemove = (index) => {
		const tabListCopy = [...tabsList[tab]];
		const removedTab = tabListCopy[index];
		const updatedTabs = tabListCopy.filter((_, i) => i !== index);

		setTabsList((prev) => ({
			...prev,
			[tab]: updatedTabs,
		}));

		if (ehrValue[tab] === removedTab) {
			const newSelected =
				updatedTabs.length > 0 ? updatedTabs[Math.max(0, index - 1)] : "";

			setEhrValue((prev) => ({
				...prev,
				[tab]: newSelected,
			}));
		}

		// 🔥 Unregister the field to remove it from form memory
		unregister(`ehrData.${tab}.${removedTab}`);

		setOpenConfirm({
			isOpen: false,
			index: null,
		});
	};
	const handleAddAttachmentsModal = () => {
		setIsAttachmentModalOpen((prev) => !prev);
	};
	return (
		<>
			<div className="secondary-bg-color m-3 rounded rounded-4 flex-grow-1 p-2">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<Tabs
							value={tab}
							onChange={handleTabChange}
							aria-label="basic tabs example"
							variant="fullWidth"
							sx={{
								backgroundColor: "#F7F5FB",
								borderRadius: "35px",
								width: 300,
								padding: "0px",
							}}
							TabIndicatorProps={{ style: { display: "none" } }}
						>
							{EhrTab.map((tab, index) => (
								<Tab
									key={`tab-${tab.label}-${index}`} // Unique key for each tab
									label={tab.label}
									value={tab.value}
									{...a11yProps(index)}
									sx={{
										fontWeight: 500,
										fontSize: "14px",
										textTransform: "capitalize",

										"&.Mui-selected": {
											backgroundColor: "#5D5FEF",
											color: "white",
											"&:hover": {
												backgroundColor: "#5D5FEF",
											},
											borderRadius: "35px",
										},
									}}
								/>
							))}
						</Tabs>
					</div>
					<div className="d-flex gap-2">
						<div>
							<AddCustomValueHelper
								value={customTabName}
								setValue={setCustomTabName}
								setErrorMessage={setTabErrorMessage}
								onAdd={onAddTab}
								disabled={false}
							/>
							<Typography sx={{ mt: 1 }} color={"error"}>
								{tabErrorMessage}
							</Typography>
						</div>
						{!isLoading && (
							<div className="mt-1">
								<UIButton
									text={isCaseEditable ? "Add Attachments" : "View Attachments"}
									variant="contained"
									onClick={handleAddAttachmentsModal}
								/>
							</div>
						)}
					</div>
				</div>
				<div className="mt-2">
					<UITabs
						tabList={tabsList?.[tab]?.map((item, index) => ({
							label: (
								<div
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
									}}
								>
									{startCase(item)}
									{!componentMap?.[startCase(item)] && isCaseEditable && (
										<span
											onClick={(e) => {
												e?.stopPropagation();
												setOpenConfirm({
													isOpen: true,
													index: index,
												});
											}}
											onKeyDown={() => {}}
											style={{
												cursor: "pointer",
												marginLeft: "8px",
												color: "red",
											}}
										>
											<Close fontSize="small" />
										</span>
									)}
								</div>
							),
							value: item,
						}))}
						value={ehrValue?.[tab]}
						handleTabChange={handleChange}
						scrollButtons="auto"
						sx={{
							".MuiTabs-indicator": {
								backgroundColor: "#000",
							},
						}}
					/>
				</div>

				<div style={{ height: "400px", overflowY: "auto" }} key={tab}>
					<SelectedComponent name={`ehrData.${tab}.${ehrValue?.[tab]}`} />
				</div>
			</div>

			<UIModal
				open={openConfirm?.isOpen}
				handleClose={() =>
					setOpenConfirm({
						isOpen: false,
						index: null,
					})
				}
				closeOnBackdropClick={false}
			>
				<div>
					<div className="fs-4 mb-3 text-center">
						<h6 style={{ fontWeight: "bold" }}>
							Are you sure you want to delete ?
						</h6>
						<span style={{ textAlign: "center", fontSize: "14px" }}>
							This action cannot be undone.{" "}
							{`Do you really want to delete ${startCase(tabsList[tab][openConfirm?.index])} ?`}
						</span>
					</div>
					<div className="d-flex justify-content-between align-items-center gap-2">
						<UIButton
							text="no"
							variant={"contained"}
							onClick={() =>
								setOpenConfirm({
									isOpen: false,
									index: null,
								})
							}
							size="small"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>

						<UIButton
							text={"yes"}
							onClick={() => handleTabRemove(openConfirm?.index)}
							variant={"contained"}
							color="error"
							size="small"
							sx={{
								width: "100%",
								textTransform: "capitalize !important",
							}}
						/>
					</div>
				</div>
			</UIModal>
			<AttachmentsModal
				open={isAttachmentModalOpen}
				handleClose={handleAddAttachmentsModal}
				formFieldName={`ehrData.${tab}`}
			/>
		</>
	);
};

export default EHRDataHandler;
