// LeftSection.tsx
import { useContext } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import { LeftSectionCtx } from "../contexts/LeftSectionCtx";

type AncestorShortcut = {
	ancName: string;
	ancKey: string;
	ancPerc: number;
};

type LayerContextValue = {
	name?: string;
	rank?: string;
	totCount?: number;
	unaCount?: number;
	rawCount?: number;
	id?: string;
	ancestors?: AncestorShortcut[];
	IDInfoHandleClick?: (name: string) => void;
	ancestorHandleClick?: (key: string) => void;
};

type HoveredTaxon = {
	name: string;
	rank: string;
	totCount: number;
	unaCount: number;
	rawCount: number;
};

type LeftSectionContextValue = LayerContextValue & {
	hovered?: HoveredTaxon | null;
};

const LeftSection = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				left: "2vw",
				position: "fixed",
				top: 0,
				width: "18vw",
				zIndex: 100,
			}}
		>
			<LayerInfo />
			<HoverInfo />
		</div>
	);
};

const LayerInfo = () => {
	const ctx = useContext(LeftSectionCtx) as LeftSectionContextValue;

	const name = ctx?.name ?? "";
	const rank = ctx?.rank ?? "";
	const totCount = ctx?.totCount ?? 0;
	const unaCount = ctx?.unaCount ?? 0;
	const rawCount = ctx?.rawCount ?? 0;

	const id = ctx?.id ?? "";
	const ancestors = ctx?.ancestors ?? [];

	const hideIdInfo = name === "root" || name.includes("&");

	return (
		<Card className="mt-3" bg="light" text="black" style={{ width: "18vw" }}>
			<Card.Header>Current root:</Card.Header>

			<Card.Body>
				<Card.Title>{name}</Card.Title>

				<Card.Text className="m-0">
					Rank: <b>{rank}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Total count: <b>{totCount}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Unspec. count: <b>{unaCount}</b>
				</Card.Text>

				{rawCount === 0 ? null : (
					<Card.Text className="m-0">
						Raw file count: <b>{rawCount}</b>
					</Card.Text>
				)}

				{hideIdInfo ? null : (
					<div className="p-0 m-0 pt-2 d-flex">
						<Card.Text className="p-0 m-0 pt-2 pb-2">NCBI ID:</Card.Text>

						{id === "" ? (
							<Button
								className="m-0 p-2 ms-2 border-0"
								onClick={() => ctx.IDInfoHandleClick?.(name)}
							>
								FETCH
							</Button>
						) : (
							<Card.Link
								className="p-0 m-0 pt-2 pb-2 ms-2 taxid-link"
								target="_blank"
								rel="noreferrer"
								href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${id}&lvl=3&lin=f&keep=1&srchmode=1&unlock`}
							>
								{id}
							</Card.Link>
						)}
					</div>
				)}

				<div className="p-0 m-0 pt-2">
					{ancestors.map((anc) => (
						<Card.Text
							key={anc.ancKey}
							className="m-0 p-0"
							onClick={() => ctx.ancestorHandleClick?.(anc.ancKey)}
							style={{ cursor: "pointer" }}
						>
							{anc.ancPerc}% of <b>{anc.ancName}</b>
						</Card.Text>
					))}
				</div>
			</Card.Body>
		</Card>
	);
};

const HoverInfo = () => {
	const { hovered } = useContext(LeftSectionCtx) as LeftSectionContextValue;

	if (!hovered) return null;

	return (
		<Card className="mt-3" bg="light" text="black" style={{ width: "18vw" }}>
			<Card.Header>Hovering over:</Card.Header>
			<Card.Body>
				<Card.Title>{hovered.name}</Card.Title>

				<Card.Text className="m-0">
					Rank: <b>{hovered.rank}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Total count: <b>{hovered.totCount}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Unspec. count: <b>{hovered.unaCount}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Raw count: <b>{hovered.rawCount}</b>
				</Card.Text>
			</Card.Body>
		</Card>
	);
};

export default LeftSection;
