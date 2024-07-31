import { useMemo } from "react";

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
	const signature = path;
	return useMemo(() => {
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
	}, [signature]);
};

export default Shape;
