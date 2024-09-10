import { useMemo } from "react";

const Label = ({
	content,
	fontSize,
	lineHeight,
	transform,
	x,
	y,
	handleClick,
	handleMouseOver,
	handleMouseOut,
	handlePlotRightClick,
}: any) => {
	return useMemo(() => {
		return (
			<text
				className="taxSun-label"
				style={{
					fill: "#800080",
					fontFamily: "calibri",
					fontSize: fontSize,
					lineHeight: lineHeight,
					margin: 0,
					padding: 0,
					position: "fixed",
					cursor: "pointer",
				}}
				transform={transform}
				x={x}
				y={y}
				onClick={handleClick}
				onContextMenu={handlePlotRightClick}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
			>
				{content}
			</text>
		);
	}, [content, x, y, transform]);
};

export default Label;
