import { useContext } from "react";
import Card from "react-bootstrap/Card";
import { LeftSectionCtx } from "../contexts/LeftSectionCtx";

type HoveredTaxon = {
	name: string;
	rank: string;
	totCount: number;
	unaCount: number;
	rawCount: number;
};

type LeftSectionContextValue = {
	hovered?: HoveredTaxon | null;
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

export default HoverInfo;
