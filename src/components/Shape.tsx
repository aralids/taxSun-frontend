import { useMemo } from "react";

interface Props {
	path?: string;
	color?: string;
	handleClick?: any;
	handleMouseOver?: any;
	handleMouseOut?: any;
	handlePlotRightClick?: any;
}

const Shape = ({
	path,
	color,
	handleClick,
	handleMouseOver,
	handleMouseOut,
	handlePlotRightClick,
}: Props) => {
	const signature = path;
	return useMemo(() => {
		return (
			<path
				className="taxSun-shape"
				d={path}
				style={{
					stroke: "#800080",
					cursor: "pointer",
				}}
				fill={color}
				onClick={handleClick}
				onContextMenu={handlePlotRightClick}
				onMouseEnter={handleMouseOver}
				onMouseLeave={handleMouseOut}
			></path>
		);
	}, [signature]);
};

export default Shape;
