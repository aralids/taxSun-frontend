import { useMemo } from "react";

import Shape from "./Shape.tsx";
import Label from "./Label.tsx";
import LabelFrame from "./LabelFrame.tsx";
import { twoVminHeights } from "../services/predefinedObjects.tsx";

interface Props {
	ancestors?: any;
	handleHover?: any;
	hovered?: string;
	lyr?: string;
	relTaxSet?: any;
	paintingOrder?: any;
	plotHandleClick?: any;
	plotRef?: any;
}

const Plot = ({
	ancestors,
	handleHover,
	hovered,
	lyr,
	relTaxSet,
	paintingOrder,
	plotHandleClick,
	plotRef,
}: Props) => {
	const signature = JSON.stringify(relTaxSet) + hovered;
	return useMemo(() => {
		let shapes: any[] = [];
		let labels: any[] = [];
		let labelFrames: any[] = [];
		const twoVmin = Math.min(window.innerWidth, window.innerHeight) / (100 / 2);
		for (const key of paintingOrder) {
			console.log("key: ", key, relTaxSet[key]["lblObj"]);
			const hc =
				key === lyr && ancestors.length > 0
					? () => plotHandleClick(ancestors[0].ancKey)
					: () => plotHandleClick(key);
			shapes = shapes.concat([
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
					strokeWidth={hovered === key ? "0.4vmin" : "0.2vmin"}
				/>,
			]);
			labelFrames = labelFrames.concat([
				<LabelFrame
					display={hovered === key ? "unset" : "none"}
					x={relTaxSet[key]["lblObj"]["frameX"]}
					transform={relTaxSet[key]["lblObj"]["transform"]}
					handleMouseOver={() => {
						handleHover(key);
					}}
					handleMouseOut={() => {
						handleHover("");
					}}
					y={relTaxSet[key]["lblObj"]["frameY"]}
					width={relTaxSet[key]["lblObj"]["frameWidth"]}
					height={twoVminHeights[twoVmin]}
				/>,
			]);
			labels = labels.concat([
				<Label
					content={
						hovered === key
							? relTaxSet[key]["lblObj"]["extContent"]
							: relTaxSet[key]["lblObj"]["abbrContent"]
					}
					fontSize="2vmin"
					fontWeight={hovered === key ? "bold" : "normal"}
					lineHeight="2vmin"
					transform={relTaxSet[key]["lblObj"]["transform"]}
					x={
						hovered === key
							? relTaxSet[key]["lblObj"]["extX"]
							: relTaxSet[key]["lblObj"]["abbrX"]
					}
					y={relTaxSet[key]["lblObj"]["y"]}
					handleClick={hc}
					handleMouseOver={() => {
						handleHover(key);
					}}
					handleMouseOut={() => {
						handleHover("");
					}}
				/>,
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
				{...shapes}
				{...labelFrames}
				{...labels}
			</svg>
		);
	}, [signature]);
};

export default Plot;
