import { EditNote } from "@mui/icons-material";
import { Grid } from "@mui/material";
import CustomRichTextEditor from "components/ReusableComponents/CustomRichTextEditor";
import UICard from "components/ReusableComponents/UICard";
import { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const CaseForm = forwardRef(
	({ schema, formState, handleOnStartDocumenting, generateScore }, ref) => {
		const themeMode = useSelector((state) => state.app.theme);
		const CardColor2 = themeMode === "dark" ? "#201F48" : "#F7F5FB";

		const {
			control,
			handleSubmit,
			formState: { errors },
		} = useForm({
			mode: "onChange",
		});

		const onSubmit = (data) => {
			generateScore(data);
		};
		useImperativeHandle(ref, () => ({
			submitForm: () => handleSubmit(onSubmit)(),
		}));
		return (
			<div>
				{formState?.isStarted ? (
					<UICard
						customClasses="p-0 border-0"
						customBodyClasses="p-0"
						CardBody={
							<form onSubmit={handleSubmit(onSubmit)}>
								<Grid
									container
									style={{
										background: CardColor2,
										borderRadius: "10px",
										boxShadow: "none",
										padding: "1rem",
									}}
								>
									{schema?.map((header) => (
										<Grid item xs={12} lg={6} key={header.value} padding={2}>
											<div>
												<h6 style={{ fontWeight: 600 }}>{header.label}</h6>
												<Controller
													name={header.value}
													control={control}
													render={({ field }) => (
														<CustomRichTextEditor
															{...field}
															label={header.label}
															required={true}
															heightClass="small"
															error={!!errors[header.value]}
															readOnly={
																!formState?.isStarted || formState?.isPaused
															}
															fullWidth
															errorMessage={
																errors[header.value]
																	? errors[header.value].message
																	: ""
															}
														/>
													)}
												/>
											</div>
										</Grid>
									))}
								</Grid>
							</form>
						}
					/>
				) : (
					<UICard
						customClasses="p-0 border-0"
						customBodyClasses="p-0"
						CardBody={
							<div
								className="col-12 d-flex flex-column justify-content-center align-items-center p-5"
								style={{ backgroundColor: CardColor2 }}
							>
								<div
									className="col-12 d-flex justify-content-center align-items-center mb-2"
									style={{
										height: "70px",
										width: "70px",
										background:
											"linear-gradient(93.39deg, #E38DF1 -5.66%, #8C68C3 56.74%, #6754A7 96.84%)",
										borderRadius: "50%",
									}}
									onClick={handleOnStartDocumenting}
									onKeyUp={handleOnStartDocumenting}
									tabIndex={0}
									role="button"
									aria-label="Start Conversation"
								>
									<EditNote sx={{ fontSize: "2.75rem", color: "#ffff" }} />
								</div>
								<div>Start</div>
							</div>
						}
					/>
				)}
			</div>
		);
	},
);

export default CaseForm;
