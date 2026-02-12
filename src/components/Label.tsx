type LabelProps = {
	content: string;
	fontSize?: string | number;
	lineHeight?: string | number;
	transform?: string;
	x?: number | string;
	y?: number | string;
	handleClick?: React.MouseEventHandler<SVGTextElement>;
	handleMouseOver?: React.MouseEventHandler<SVGTextElement>;
	handleMouseOut?: React.MouseEventHandler<SVGTextElement>;
	handlePlotRightClick?: React.MouseEventHandler<SVGTextElement>;
};

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
}: LabelProps) => {
	return (
		<text
			className="taxSun-label"
			style={{
				fill: "#800080",
				fontFamily: "calibri",
				fontSize,
				lineHeight,
				margin: 0,
				padding: 0,
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
};

export default Label;
