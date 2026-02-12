import Upload from "./Upload";
import ViewingModes from "./ViewingModes";
import Download from "./Download";

const RightSection = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				left: "80vw",
				position: "fixed",
				top: 0,
				width: "18vw",
				zIndex: 100,
			}}
		>
			<Upload />
			<ViewingModes />
			<Download />
		</div>
	);
};

export default RightSection;
