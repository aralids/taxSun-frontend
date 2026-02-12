// RightSection.tsx
import { useContext } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { RightSectionCtx } from "../contexts/RightSectionCtx";
import type { ViewMode } from "../contexts/buildRightSectionCtxValue";

type RightCtx = ReturnType<
	typeof import("../contexts/buildRightSectionCtxValue").buildRightSectionCtxValue
>;

const CARD_STYLE = { width: "18vw" } as const;

const RightSection = () => (
	<div
		style={{
			display: "flex",
			flexDirection: "column",
			left: "80vw",
			position: "fixed",
			top: 0,
			width: "18vw",
			zIndex: 100,
		}}
	>
		<Upload />
		<ViewingModes />
		<Download />
	</div>
);

function SectionCard(props: { title: string; children: React.ReactNode }) {
	return (
		<Card className="mt-3" bg="light" text="black" style={CARD_STYLE}>
			<Card.Header>{props.title}</Card.Header>
			<Card.Body>{props.children}</Card.Body>
		</Card>
	);
}

function UploadRow(props: {
	id: string;
	label: "TSV" | "FAA";
	disabled?: boolean;
	lastTry: string;
	statusIcon: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	inputRef: React.RefObject<HTMLInputElement>;
}) {
	const hasTried = props.lastTry !== "";

	return (
		<div
			className={`d-flex align-items-center w-100 ${props.label === "FAA" ? "mt-2" : ""}`}
			style={{ justifyContent: hasTried ? "space-between" : "center" }}
		>
			<Button
				className={`${hasTried ? "p-2" : "w-100 p-2"} m-0 border-0`}
				disabled={props.disabled}
				style={{
					transition: "all ease-in-out 1s",
					...(hasTried ? { width: "20%", minWidth: "fit-content" } : null),
				}}
			>
				<label
					htmlFor={props.id}
					className="w-100 d-flex justify-content-center"
					style={{ cursor: props.disabled ? "default" : "pointer" }}
				>
					<span className="material-symbols-outlined">upload</span>
					{props.label}
				</label>
			</Button>

			<input
				id={props.id}
				type="file"
				className="d-none"
				onChange={props.onChange}
				ref={props.inputRef}
			/>

			{hasTried && (
				<>
					<p
						style={{
							textAlign: "center",
							textOverflow: "ellipsis",
							overflow: "hidden",
							whiteSpace: "nowrap",
						}}
						className="ps-2 pe-2 m-0"
					>
						{props.lastTry}
					</p>

					<span className="material-symbols-outlined d-inline">
						{props.statusIcon}
					</span>
				</>
			)}
		</div>
	);
}

const Upload = () => {
	const ctx = useContext(RightSectionCtx) as unknown as RightCtx;

	return (
		<SectionCard title="Load your data:">
			<UploadRow
				id="tsv-file-input"
				label="TSV"
				lastTry={ctx.tsvLastTry}
				statusIcon={ctx.tsvLoadStatus}
				onChange={ctx.uplTsvHandleChange}
				inputRef={ctx.tsvFormRef}
			/>

			<UploadRow
				id="faa-file-input"
				label="FAA"
				disabled={!ctx.fastaEnabled}
				lastTry={ctx.faaLastTry}
				statusIcon={ctx.faaLoadStatus}
				onChange={ctx.uplFaaHandleChange}
				inputRef={ctx.faaFormRef}
			/>
		</SectionCard>
	);
};

const VIEW_OPTIONS: Array<{ id: ViewMode; label: string }> = [
	{ id: "unaltered", label: "Unaltered" },
	{ id: "marriedTaxaI", label: "Married taxa I" },
	{ id: "marriedTaxaII", label: "Married taxa II" },
	{ id: "allEqual", label: "All equal" },
];

const ViewingModes = () => {
	const ctx = useContext(RightSectionCtx) as unknown as RightCtx;

	return (
		<SectionCard title="View:">
			{/* Collapse */}
			<Form>
				<Form.Check
					type="checkbox"
					id="collapse"
					label="Collapse"
					onChange={ctx.collHandleChange}
					checked={ctx.coll}
				/>
			</Form>

			{/* EValue */}
			<Form>
				<Form.Check
					type="checkbox"
					id="eValueApplied"
					label="Filter by e-value: "
					onChange={ctx.eValueAppliedHandleChange}
					checked={ctx.eValueApplied}
					disabled={!ctx.eValueEnabled}
				/>
				<Form.Control
					value={ctx.eValueInput}
					onChange={(e) => ctx.eValueHandleChange(e.target.value)}
					onKeyDown={ctx.eValueHandleKeyDown}
					disabled={!ctx.eValueEnabled}
				/>
			</Form>

			{/* Views */}
			<Form className="mt-4">
				{VIEW_OPTIONS.map((opt) => (
					<Form.Check
						key={opt.id}
						type="radio"
						id={opt.id}
						label={opt.label}
						name="radio"
						checked={ctx.view === opt.id}
						onChange={() => ctx.viewHandleChange(opt.id)}
					/>
				))}
			</Form>
		</SectionCard>
	);
};

const Download = () => {
	const { dldOnClick } = useContext(RightSectionCtx) as unknown as Pick<
		RightCtx,
		"dldOnClick"
	>;

	return (
		<SectionCard title="Download:">
			<Button
				onClick={dldOnClick}
				className="w-100 p-2 m-0 border-0 d-flex justify-content-center"
			>
				<span
					className="material-symbols-outlined"
					style={{ display: "inline" }}
				>
					download
				</span>
				SVG
			</Button>
		</SectionCard>
	);
};

export default RightSection;
