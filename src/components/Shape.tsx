interface Props {
	path?: string;
	color?: string;
	handleClick?: any;
	handleMouseOver?: any;
	handleMouseOut?: any;
	strokeWidth?: string;
}

const Shape = ({
	path,
	color,
	handleClick,
	handleMouseOver,
	handleMouseOut,
	strokeWidth,
}: Props) => {
	return (
		<path
			d={path}
			style={{
				fill: color,
				stroke: "#800080",
				strokeWidth: strokeWidth,
				cursor: "pointer",
			}}
			onClick={handleClick}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		></path>
	);
};

export default Shape;
