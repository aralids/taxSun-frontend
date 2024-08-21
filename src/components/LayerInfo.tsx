import { useContext, useMemo } from "react";
import Card from "react-bootstrap/Card";

import BasicLayerInfo from "./BasicLayerInfo.tsx";
import IDInfo from "./IDInfo.tsx";
import Shortcuts from "./Shortcuts.tsx";
import { LeftSectionCtx } from "../App.tsx";

const LayerInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);

	return useMemo(() => {
		return (
			<Card
				className="mt-3"
				bg={"light"}
				text={"black"}
				style={{ width: "18vw" }}
			>
				<Card.Header>Current layer:</Card.Header>
				<Card.Body>
					<Card.Title>{ctx["name"]}</Card.Title>
					<BasicLayerInfo />
					<IDInfo />
					<Shortcuts />
				</Card.Body>
			</Card>
		);
	}, [ctx["name"]]);
};

export default LayerInfo;
