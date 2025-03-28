import { useContext, useMemo } from "react";
import { LeftSectionCtx } from "../App.tsx";

import Card from "react-bootstrap/Card";

const HoverInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);
	return useMemo(() => {
		if (!ctx["hovered"]) {
			return <></>;
		}
		return (
			<Card
				className="mt-3"
				bg={"light"}
				text={"black"}
				style={{ width: "18vw" }}
			>
				<Card.Header>Hovering over:</Card.Header>
				<Card.Body>
					<Card.Title>{ctx["hovered"]["name"]}</Card.Title>
					<Card.Text className="m-0">
						Rank: <b>{ctx["hovered"]["rank"]}</b>
					</Card.Text>
					<Card.Text className="m-0">
						Total count: <b>{ctx["hovered"]["totCount"]}</b>
					</Card.Text>
					<Card.Text className="m-0">
						Unspec. count: <b>{ctx["hovered"]["unaCount"]}</b>
					</Card.Text>
					<Card.Text className="m-0">
						Raw count: <b>{ctx["hovered"]["rawCount"]}</b>
					</Card.Text>
				</Card.Body>
			</Card>
		);
	}, [ctx["hovered"]]);
};

export default HoverInfo;
