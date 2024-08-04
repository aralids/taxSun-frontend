import * as React from "react";
import Collapse from "./Collapse.tsx";
import EValue from "./EValue.tsx";
import Views from "./Views.tsx";
import Card from "react-bootstrap/Card";

const ViewingModes = () => {
	return React.useMemo(() => {
		return (
			<Card
				className="mt-3"
				bg={"light"}
				text={"black"}
				style={{ width: "18vw" }}
			>
				<Card.Header>View: </Card.Header>
				<Card.Body>
					<Collapse />
					<EValue />
					<Views />
				</Card.Body>
			</Card>
		);
	}, []);
};

export default ViewingModes;
