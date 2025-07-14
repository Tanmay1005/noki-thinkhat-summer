import { Typography } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import UIButton from "components/ReusableComponents/UIButton";
import UIInputField from "components/ReusableComponents/UIInputField";
import { useFormContext } from "react-hook-form";
import FileUploadManager from "../../common/FileUploadManager";
import useDeleteFile from "../../manageCaseHelper";
import FormFieldController from "../../sections/FormFieldController";
import AccordionFormHelper from "../AccordionFormHelper";

function TestAccordion({ name, test, categoryName }) {
	const { flatIndex, fileId } = test;
	const { getValues, setValue } = useFormContext();
	const isExisting = getValues(`${name}.${flatIndex}.isExisting`);
	const { deleteAllFiles } = useDeleteFile();
	const isCaseEditable = getValues("isCaseEditable");

	const handleRemoveTest = (testId) => {
		deleteAllFiles(fileId, "case", isExisting);
		const values = getValues(name);
		const updatedValues = values?.filter(({ id }) => id !== testId);
		setValue(name, updatedValues);
	};

	// Create accordion title: "CategoryName - TestName"
	const accordionTitle = categoryName
		? `${categoryName} - ${test.name}`
		: test.name;
	return (
		<AccordionFormHelper
			key={`${fileId}-${flatIndex}`} // Force re-render when flatIndex changes
			label={accordionTitle}
			JSX={
				<div>
					<div>
						<Typography fontWeight="bold">Textual Summary</Typography>
						<FormFieldController
							name={`${name}.${flatIndex}.Textual_Summary`}
							Component={CustomRichTextEditor}
						/>
					</div>
					<div className="my-3">
						<Typography fontWeight="bold">
							Prompt for AI Patient Avatar's Response
						</Typography>
						<FormFieldController
							name={`${name}.${flatIndex}.AI_Prompt`}
							Component={UIInputField}
							extraProps={{ rows: 4, multiline: true }}
						/>
					</div>
					<div className="my-3">
						<Typography fontWeight="bold" className="mb-1">
							Documents
						</Typography>
						<FileUploadManager
							name={`${name}.${flatIndex}.documents`}
							sectionFileId={fileId}
							isExisting={isExisting}
						/>
					</div>
					<div className="my-3">
						<Typography fontWeight="bold" className="mb-1">
							Audio Files
						</Typography>
						<FileUploadManager
							name={`${name}.${flatIndex}.audioFiles`}
							sectionFileId={fileId}
							supportedFiles={["MP3"]}
							isExisting={isExisting}
						/>
					</div>
					{isCaseEditable && (
						<div className="border-top">
							<div className="pt-2 text-end">
								<UIButton
									text="Delete"
									variant="contained"
									color="error"
									onClick={() => handleRemoveTest(test.id)}
								/>
							</div>
						</div>
					)}
				</div>
			}
			backgroundColor="#FFF"
		/>
	);
}
// this written have two level of categories and flexible enough to add n level
function CategoryAccordion({ name, category }) {
	return (
		<AccordionFormHelper
			label={category.category || `Category ${category.id}`}
			JSX={
				<div className="d-flex flex-column gap-3">
					{category?.children?.map((child) => {
						return child?.tests?.map((test, idx) => (
							<TestAccordion
								key={test.fileId || test.id}
								name={name}
								test={test}
								index={idx}
								categoryName={child.category}
							/>
						));
					})}
					{/* Render tests directly under this category */}
					{category?.tests?.map((test, idx) => (
						<TestAccordion
							key={test.fileId || test.id}
							name={name}
							test={test}
							index={idx}
						/>
					))}
				</div>
			}
			backgroundColor="#F9F8FE"
		/>
	);
}

export default function NestedPEAccordions({ data, fieldName }) {
	return (
		<div className="d-flex flex-column gap-3">
			{data.map((category) => (
				<CategoryAccordion
					key={category.id}
					name={fieldName}
					category={category}
					level={0}
				/>
			))}
		</div>
	);
}
