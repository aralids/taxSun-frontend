import { useMemo } from "react";

const Shape = ({
	path,
	color,
	handleClick,
	handleMouseOver,
	handleMouseOut,
	handlePlotRightClick,
}: any) => {
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
	}, [path]);
};

export default Shape;
