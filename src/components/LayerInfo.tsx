import { useContext } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import { LeftSectionCtx } from "../contexts/LeftSectionCtx";

const LayerInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);

	const name: string = ctx?.name ?? "";
	const rank = ctx?.rank;
	const totCount = ctx?.totCount;
	const unaCount = ctx?.unaCount;
	const rawCount = ctx?.rawCount ?? 0;

	const id: string = ctx?.id ?? "";
	const ancestors = ctx?.ancestors ?? [];

	const hideIdInfo = name === "root" || name.includes("&");

	return (
		<Card className="mt-3" bg="light" text="black" style={{ width: "18vw" }}>
			<Card.Header>Current root:</Card.Header>

			<Card.Body>
				<Card.Title>{name}</Card.Title>

				{/* BasicLayerInfo */}
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

				{/* IDInfo */}
				{hideIdInfo ? null : (
					<div className="p-0 m-0 pt-2 d-flex">
						<Card.Text className="p-0 m-0 pt-2 pb-2">NCBI ID:</Card.Text>

						{id === "" ? (
							<Button
								className="m-0 p-2 ms-2 border-0"
								onClick={() => ctx.IDInfoHandleClick(name)}
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

				{/* Shortcuts */}
				<div className="p-0 m-0 pt-2">
					{ancestors.map((anc: any) => (
						<Card.Text
							key={anc.ancName}
							className="m-0 p-0"
							onClick={() => ctx.ancestorHandleClick(anc.ancKey)}
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

export default LayerInfo;
