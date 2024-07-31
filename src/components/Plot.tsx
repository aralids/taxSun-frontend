import { useMemo } from "react";

import Shape from "./Shape.tsx";
import Label from "./Label.tsx";

interface Props {
	ancestors?: any;
	handleHover?: any;
	lyr?: string;
	relTaxSet?: any;
	paintingOrder?: any;
	plotHandleClick?: any;
	plotRef?: any;
}

const Plot = ({
	ancestors,
	handleHover,
	lyr,
	relTaxSet,
	paintingOrder,
	plotHandleClick,
	plotRef,
}: Props) => {
	const signature = JSON.stringify(relTaxSet);
	return useMemo(() => {
		let groups: any[] = [];
		for (const key of paintingOrder) {
			const hc =
				key === lyr && ancestors.length > 0
					? () => plotHandleClick(ancestors[0].ancKey)
					: () => plotHandleClick(key);
			groups = groups.concat([
				<g className="wedge">
					<Shape
						path={relTaxSet[key]["path"]}
						color={relTaxSet[key]["color"]}
						handleClick={hc}
						handleMouseOver={() => {
							handleHover(key);
						}}
						handleMouseOut={() => {
							handleHover("");
						}}
					/>
					<Label
						content={relTaxSet[key]["lblObj"]["abbrContent"]}
						fontSize="2vmin"
						lineHeight="2vmin"
						transform={relTaxSet[key]["lblObj"]["transform"]}
						x={relTaxSet[key]["lblObj"]["abbrX"]}
						y={relTaxSet[key]["lblObj"]["y"]}
						handleClick={hc}
						handleMouseOver={() => {
							handleHover(key);
						}}
						handleMouseOut={() => {
							handleHover("");
						}}
					/>
				</g>,
			]);
		}
		return (
			<svg
				ref={plotRef}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: window.innerWidth,
					height: window.innerHeight,
					zIndex: 0,
				}}
			>
				{...groups}
			</svg>
		);
	}, [signature]);
};

export default Plot;
