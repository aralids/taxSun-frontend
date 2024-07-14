interface Props {
	path?: string;
	color?: string;
	handleClick?: any;
}

const Shape = ({ path, color, handleClick }: Props) => {
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
		></path>
	);
};

export default Shape;
