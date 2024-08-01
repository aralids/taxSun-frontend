interface Props {
	content?: string;
	fontSize?: string;
	lineHeight?: string;
	transform?: string;
	x?: any;
	y?: any;
	handleClick?: any;
	handleMouseOver?: any;
	handleMouseOut?: any;
}

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
}: Props) => {
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
			onMouseEnter={handleMouseOver}
			onMouseLeave={handleMouseOut}
		>
			{content}
		</text>
	);
};

export default Label;
