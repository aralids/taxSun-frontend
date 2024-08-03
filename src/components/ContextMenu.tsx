interface Props {
	coords: any;
	faaName: String;
	handleCopyClick: any;
	target: any;
}

const ContextMenu = ({ coords, faaName, handleCopyClick, target }: Props) => {
	if (coords.length === 0) {
		return <></>;
	} else {
		const stl = {
			border: "1px solid grey",
			borderRadius: "3px",
			backgroundColor: "#F0F0F0",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontFamily: "Arial",
			fontSize: "1.8vh",
			padding: "1px 6px 1px 6px",
			margin: "0",
			width: "18vw",
			cursor: "pointer",
			minHeight: "27.6px",
		};
		let newTop;
		let faaButtons: any = faaName
			? [
					<button style={stl}>Copy unspecified sequences</button>,
					<button style={stl}>Copy all sequences</button>,
			  ]
			: [];
		if (coords[1] <= window.innerHeight / 2) {
			newTop = coords[1];
		} else if (faaName) {
			newTop = coords[1] - 4 * 27.6;
		} else {
			newTop = coords[1] - 2 * 27.6;
		}
		return (
			<div
				style={{
					position: "fixed",
					top: newTop,
					left: coords[0],
					display: "flex",
					flexDirection: "column",
					zIndex: 200,
				}}
			>
				<button style={stl} onClick={() => handleCopyClick(target, true)}>
					Copy unspecified sequences
				</button>
				<button style={stl} onClick={() => handleCopyClick(target, false)}>
					Copy all sequences
				</button>
				{...faaButtons}
			</div>
		);
	}
};

export default ContextMenu;
