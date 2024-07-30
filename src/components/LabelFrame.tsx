interface Props {
	display?: string;
	x?: any;
	transform?: string;
	handleMouseOver?: any;
	handleMouseOut?: any;
	y?: any;
	width?: any;
	height?: any;
}

const LabelFrame = ({
	display,
	x,
	transform,
	handleMouseOver,
	handleMouseOut,
	y,
	width,
	height,
}: Props) => {
	return (
		<rect
			x={x}
			y={y}
			style={{
				display: display,
				height: height,
				fill: "white",
				stroke: "#800080",
				strokeWidth: "0.3vmin",
				width: width,
			}}
			transform={transform}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		></rect>
	);
};

export default LabelFrame;
