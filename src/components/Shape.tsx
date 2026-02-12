type ShapeProps = {
	path: string;
	color: string;
	handleClick?: React.MouseEventHandler<SVGPathElement>;
	handleMouseOver?: React.MouseEventHandler<SVGPathElement>;
	handleMouseOut?: React.MouseEventHandler<SVGPathElement>;
	handlePlotRightClick?: React.MouseEventHandler<SVGPathElement>;
};

const Shape = ({
	path,
	color,
	handleClick,
	handleMouseOver,
	handleMouseOut,
	handlePlotRightClick,
}: ShapeProps) => {
	return (
		<path
			className="taxSun-shape"
			d={path}
			fill={color}
			style={{
				stroke: "#800080",
				cursor: "pointer",
			}}
			onClick={handleClick}
			onContextMenu={handlePlotRightClick}
			onMouseEnter={handleMouseOver}
			onMouseLeave={handleMouseOut}
		/>
	);
};

export default Shape;
