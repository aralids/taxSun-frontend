interface Props {
	content?: string;
	fontSize?: string;
	fontWeight?: string;
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
	fontWeight,
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
			style={{
				fill: "#800080",
				fontFamily: "calibri",
				fontSize: fontSize,
				fontWeight: fontWeight,
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
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		>
			{content}
		</text>
	);
};

export default Label;
