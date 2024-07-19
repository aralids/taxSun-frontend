import { useMemo } from "react";

import Shape from "./Shape.tsx";
import Label from "./Label.tsx";

interface Props {
	ancestors?: any;
	handleHover?: any;
	lyr?: string;
	relTaxSet?: any;
	plotHandleClick?: any;
	plotRef?: any;
}

const Plot = ({
	ancestors,
	handleHover,
	lyr,
	relTaxSet,
	plotHandleClick,
	plotRef,
}: Props) => {
	const signature = JSON.stringify(relTaxSet);
	return useMemo(() => {
		let shapes: any[] = [];
		let labels: any[] = [];
		for (const key in relTaxSet) {
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
				/>,
			]);
			labels = labels.concat([
				<Label
					content={relTaxSet[key]["lblObj"]["optLabel"]}
					fontSize="2vmin"
					fontWeight={"normal"}
					lineHeight="2vmin"
					transform={relTaxSet[key]["lblObj"]["transform"]}
					x={relTaxSet[key]["lblObj"]["x"]}
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
				{...labels}
			</svg>
		);
	}, [signature]);
};

export default Plot;
