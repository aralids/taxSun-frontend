interface Props {
	coords: any;
	faaName: String;
	handleCopyClick: any;
	handleDownloadSeqClick: any;
	target: any;
}

const ContextMenu = ({
	coords,
	faaName,
	handleCopyClick,
	handleDownloadSeqClick,
	target,
}: Props) => {
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
		if (coords[1] <= window.innerHeight / 2) {
			newTop = coords[1];
		} else {
			newTop = coords[1] - 4 * 27.6;
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
				<button
					style={stl}
					onClick={() => handleCopyClick(target, false)}
					disabled={target.includes("&")}
				>
					Copy all sequences
				</button>
				<button
					style={stl}
					disabled={faaName === ""}
					onClick={() => handleDownloadSeqClick(target, true)}
				>
					Download unspecified sequences
				</button>
				<button
					style={stl}
					disabled={target.includes("&") || faaName === ""}
					onClick={() => handleDownloadSeqClick(target, false)}
				>
					Download all sequences
				</button>
			</div>
		);
	}
};

export default ContextMenu;
