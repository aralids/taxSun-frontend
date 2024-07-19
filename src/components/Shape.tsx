interface Props {
	path?: string;
	color?: string;
	handleClick?: any;
	handleMouseOver?: any;
	handleMouseOut?: any;
}

const Shape = ({
	path,
	color,
	handleClick,
	handleMouseOver,
	handleMouseOut,
}: Props) => {
	return (
		<path
			d={path}
			style={{
				fill: color,
				stroke: "#800080",
				strokeWidth: "0.2vmin",
				cursor: "pointer",
			}}
			onClick={handleClick}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		></path>
	);
};

export default Shape;
