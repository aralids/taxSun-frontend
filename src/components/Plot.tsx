import Shape from "./Shape.tsx";
import Label from "./Label.tsx";

type PlotProps = {
	ancestors: any[];
	handleHover: (key: string) => void;
	handlePlotRightClick: (event: any, target: any) => void;
	lyr: string;
	relTaxSet: any;
	paintingOrder: string[];
	plotHandleClick: (key: string) => void;
	plotRef: React.MutableRefObject<SVGSVGElement | null>;
	view: string;
	viewport: { w: number; h: number };
};

const Plot = ({
	ancestors,
	handleHover,
	handlePlotRightClick,
	lyr,
	relTaxSet,
	paintingOrder,
	plotHandleClick,
	plotRef,
	viewport,
}: PlotProps) => {
	const twoVmin = viewport.w <= viewport.h ? viewport.w / 50 : viewport.h / 50;

	const groups = paintingOrder.map((key) => {
		const hc =
			key === lyr && ancestors.length > 0
				? () => plotHandleClick(ancestors[0].ancKey)
				: () => plotHandleClick(key);

		return (
			<g className="wedge" key={key}>
				<Shape
					path={relTaxSet[key]["path"]}
					color={
						relTaxSet[key]["married"]
							? "url(#marriage-pattern-1)"
							: relTaxSet[key]["color"]
					}
					handleClick={hc}
					handleMouseOver={() => handleHover(key)}
					handleMouseOut={() => handleHover("")}
					handlePlotRightClick={(event: any) =>
						handlePlotRightClick(event, key)
					}
				/>

				<Label
					content={
						relTaxSet[key]["married"]
							? ""
							: relTaxSet[key]["lblObj"]["abbrContent"]
					}
					fontSize={twoVmin}
					lineHeight={twoVmin}
					transform={relTaxSet[key]["lblObj"]["transform"]}
					x={relTaxSet[key]["lblObj"]["abbrX"]}
					y={relTaxSet[key]["lblObj"]["y"]}
					handleClick={hc}
					handleMouseOver={() => handleHover(key)}
					handleMouseOut={() => handleHover("")}
					handlePlotRightClick={(event: any) =>
						handlePlotRightClick(event, key)
					}
				/>
			</g>
		);
	});

	return (
		<svg
			ref={plotRef}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: viewport.w,
				height: viewport.h,
				zIndex: 0,
			}}
		>
			<defs>
				<pattern
					id="marriage-pattern"
					x="0"
					y="0"
					width="35"
					height="35"
					patternUnits="userSpaceOnUse"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="#000000"
						height="30"
						width="30"
						version="1.1"
						id="Layer_1"
						viewBox="0 0 480 480"
						style={{ backgroundColor: "green" }}
					>
						{/* (unchanged huge SVG content) */}
					</svg>
				</pattern>

				<pattern
					id="marriage-pattern-1"
					x="0"
					y="0"
					width="40"
					height="40"
					patternUnits="userSpaceOnUse"
				>
					<svg
						id="patternId"
						width="100%"
						height="100%"
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<pattern
								id="a"
								patternUnits="userSpaceOnUse"
								width="40"
								height="40"
								patternTransform="scale(0.5) rotate(0)"
							>
								<rect
									x="0"
									y="0"
									width="100%"
									height="100%"
									fill="hsla(0,0%,100%,1)"
								/>
								<path
									d="M0 10v20m40-20v20M10 40h20M10 0h20m10 50c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10zM10 40c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10m30-30c-5.523 0-10-4.477-10-10s4.477-10 10-10S50-5.523 50 0s-4.477 10-10 10zM10 0c0 5.523-4.477 10-10 10S-10 5.523-10 0s4.477-10 10-10S10-5.523 10 0"
									strokeWidth="1"
									stroke="hsla(300, 100%, 25%, 1)"
									fill="none"
								/>
								<path
									d="M20-10v20m0 20v20m-30-30h20m20 0h20m-20 0c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10"
									strokeWidth="1"
									stroke="hsla(300, 100%, 25%, 1)"
									fill="none"
								/>
							</pattern>
						</defs>
						<rect
							width="800%"
							height="800%"
							transform="translate(0,0)"
							fill="url(#a)"
						/>
					</svg>
				</pattern>
			</defs>

			{groups}
		</svg>
	);
};

export default Plot;
