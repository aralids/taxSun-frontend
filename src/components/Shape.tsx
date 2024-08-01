import { useMemo } from "react";

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
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
			></path>
		);
	}, [signature]);
};

export default Shape;
