import HoverInfo from "./HoverInfo";
import LayerInfo from "./LayerInfo";

const LeftSection = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				left: "2vw",
				position: "fixed",
				top: 0,
				width: "18vw",
				zIndex: 100,
			}}
		>
			<LayerInfo />
			<HoverInfo />
		</div>
	);
};

export default LeftSection;
