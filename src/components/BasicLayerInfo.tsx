import { useContext, useMemo } from "react";
import { LeftSectionCtx } from "../App.tsx";
import Card from "react-bootstrap/Card";

const BasicLayerInfo = () => {
	const ctx: any = useContext(LeftSectionCtx);
	return useMemo(() => {
		return (
			<>
				<Card.Text className="m-0">
					Rank: <b>{ctx["rank"]}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Total count: <b>{ctx["totCount"]}</b>
				</Card.Text>
				<Card.Text className="m-0">
					Unspec. count: <b>{ctx["unaCount"]}</b>
				</Card.Text>
				{ctx["rawCount"] === 0 ? (
					<></>
				) : (
					<Card.Text className="m-0">
						Raw file count: <b>{ctx["rawCount"]}</b>
					</Card.Text>
				)}
			</>
		);
	}, [ctx["name"], ctx["rank"], ctx["totCount"]]);
};

export default BasicLayerInfo;
