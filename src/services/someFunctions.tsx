import {
	calcOptLabel,
	calculateArcEndpoints,
	cos,
	createPalette,
	getLayerWidthInPx,
	lineLength,
	midColor,
	round,
	calcHorizontalSpace,
	sin,
	tintify,
} from "./helperFunctions";
import { rankPatternFull, twoVminHeights } from "./predefinedObjects";

const calcBasicInfo = (
	eValueApplied: Boolean,
	eValue: number,
	coll: Boolean,
	lns: string[][][],
	lyr: string,
	taxSet: object,
	view: string
) => {
	let [croppedLns, relTaxSet] = crop(lns, lyr, taxSet);

	[croppedLns, relTaxSet] = eFilter(
		eValueApplied,
		eValue,
		croppedLns,
		relTaxSet
	);

	const minRankPattern = calcMinRankPattern(croppedLns, rankPatternFull);

	[croppedLns, relTaxSet] = marry(croppedLns, lyr, relTaxSet, view);

	[croppedLns, relTaxSet] = collapse(coll, croppedLns, relTaxSet);

	relTaxSet = assignDegreesLayers(
		croppedLns,
		lyr,
		minRankPattern,
		relTaxSet,
		view
	);

	const [layerWidth, cx, cy] = getLayerWidthInPx(
		0,
		0,
		window.innerWidth,
		window.innerHeight,
		minRankPattern
	);

	relTaxSet = calcSVGPaths(cx, cy, layerWidth, relTaxSet);

	relTaxSet = color(croppedLns, lyr, relTaxSet);

	relTaxSet = label(cx, cy, layerWidth, lyr, minRankPattern, relTaxSet);

	//console.log("croppedLns, relTaxSet: ", croppedLns, relTaxSet);

	//calcOptLabel(2, "Gammaproteobacteria", 50);

	return relTaxSet;
};

const crop = (lns: string[][][], lyr: string, taxSet: any) => {
	// Get croppedLns.
	const rootTaxa = lyr.split(" ").slice(0, -1).join(" ").split(" & ");
	const rootRank = lyr.split(" ").slice(-1)[0];
	const lyrIndices = rootTaxa.map(
		(item) => taxSet[item + " " + rootRank]["lnIndex"]
	);

	let croppedLns: string[][][] = [];
	for (let i = 0; i < lns.length; i++) {
		for (let j = 0; j < rootTaxa.length; j++) {
			const taxon = rootTaxa[j];
			const index = lyrIndices[j];
			const rank = rootRank;

			if (
				lns[i][index] &&
				lns[i][index][1] === taxon &&
				lns[i][index][0] === rank
			) {
				croppedLns = croppedLns.concat([lns[i].slice(index)]);
			}
		}
	}

	const relTaxSet: any = {};
	for (const ln of croppedLns) {
		for (const item of ln) {
			relTaxSet[item[1] + " " + item[0]] = {
				...taxSet[item[1] + " " + item[0]],
			};
		}
	}
	return [croppedLns, relTaxSet];
};

const collapse = (collapse: Boolean, croppedLns: string[][][], taxSet: any) => {
	let relTaxSet = {};
	let collapseSurvivors: any = {};
	let collapsePerishers: any = {};
	let collapseDel: any = {};
	for (let i = 0; i < croppedLns.length; i++) {
		for (let j = 0; j < croppedLns[i].length; j++) {
			const name = croppedLns[i][j][1] + " " + croppedLns[i][j][0];
			if (j === 0 || j === croppedLns[i].length - 1) {
				collapseSurvivors[name] = { ...taxSet[name] };
			} else if (name in collapsePerishers) {
				collapseSurvivors[name] = { ...taxSet[name] };
				delete collapseDel[name];
				delete collapsePerishers[name];
			} else if (!(name in collapseSurvivors)) {
				collapsePerishers[name] = { ...taxSet[name] };
				collapseDel[name] = [i, j];
			}
		}
	}

	if (collapse) {
		relTaxSet = { ...collapseSurvivors };
		for (const key of Object.keys(collapseDel)) {
			croppedLns[collapseDel[key][0]][collapseDel[key][1]] = [""];
		}
		for (let i = 0; i < croppedLns.length; i++) {
			croppedLns[i] = croppedLns[i].filter((item) => item[0] !== "");
		}
	} else {
		relTaxSet = { ...collapseSurvivors, ...collapsePerishers };
	}

	return [croppedLns, relTaxSet];
};

const eFilter = (
	eValueApplied: Boolean,
	eValue: number,
	croppedLns: string[][][],
	relTaxSet: any
) => {
	if (eValueApplied && eValue !== Infinity) {
		for (let i = croppedLns.length - 1; i >= 0; i--) {
			let ln = croppedLns[i];
			let lastTaxon = ln[ln.length - 1][1] + " " + ln[ln.length - 1][0];
			let oldUnaCount = relTaxSet[lastTaxon]["unaCount"];
			let goodIndices: number[] = [];
			let eVals: number[] = relTaxSet[lastTaxon]["eValues"];
			let newEValues = eVals.filter((item, index) => {
				if (item !== null && item <= eValue) {
					goodIndices = goodIndices.concat([index]);
				}
				return item !== null && item <= eValue;
			});
			newEValues.concat([]);

			relTaxSet[lastTaxon]["goodIndices"] = goodIndices;

			let newUnaCount = goodIndices.length;
			relTaxSet[lastTaxon]["unaCount"] = newUnaCount;

			let diff = oldUnaCount - newUnaCount;
			for (let txn of ln) {
				const name = txn[1] + " " + txn[0];
				relTaxSet[name]["totCount"] = relTaxSet[name]["totCount"] - diff;
				if (relTaxSet[name]["totCount"] === 0) {
					delete relTaxSet[name];
				}
			}

			if (newUnaCount === 0) {
				croppedLns = croppedLns.slice(0, i).concat(croppedLns.slice(i + 1));
			}
		}
	}

	return [croppedLns, relTaxSet];
};

const calcMinRankPattern = (croppedLns: any[][], rankPatternFull: string[]) => {
	let ranksUnique: string[] = croppedLns.reduce(
		(accumulator, ln) => accumulator.concat(ln.map((item) => item[0])),
		[]
	);
	ranksUnique = ranksUnique.filter(
		(value, index, array) => Boolean(value) && array.indexOf(value) === index
	);
	let rankPattern: string[] = rankPatternFull.filter(
		(item) => ranksUnique.indexOf(item) > -1
	);

	return rankPattern;
};

const marry = (
	croppedLns: string[][][],
	lyr: string,
	relTaxSet: any,
	view: string
) => {
	if (view === "marriedTaxaI" || view === "marriedTaxaII") {
		const threshold = 0.02;
		const sumCount = relTaxSet[lyr]["totCount"];

		let bachelorTaxa: any = {};
		for (let i = 0; i < croppedLns.length; i++) {
			const ln = croppedLns[i];
			const lst = ln[ln.length - 1][1] + " " + ln[ln.length - 1][0];
			const lstPerc = relTaxSet[lst]["totCount"] / sumCount;

			if (lstPerc < threshold) {
				let parent;
				let bachelorName;
				let bachelorRank;
				for (let j = ln.length - 2; j >= 0; j--) {
					parent = ln[j][1] + " " + ln[j][0];
					bachelorName = ln[j + 1][1];
					bachelorRank = ln[j + 1][0];
					if (relTaxSet[parent]["totCount"] / sumCount >= threshold) {
						break;
					}
				}

				let bachelor = bachelorName + " " + bachelorRank;

				if (!(bachelor in bachelorTaxa)) {
					bachelorTaxa[bachelor] = {
						indices: [i],
						name: bachelorName,
						parent: parent,
						perc: round(relTaxSet[bachelor]["totCount"] / sumCount, 5),
						rank: bachelorRank,
						count: relTaxSet[bachelor]["totCount"],
					};
				} else {
					bachelorTaxa[bachelor]["indices"] = bachelorTaxa[bachelor][
						"indices"
					].concat([i]);
				}
			}
		}

		let marriageGroups: any = {};
		for (let key in bachelorTaxa) {
			const bachelor = bachelorTaxa[key];
			const groupName = `${bachelor.rank} in ${bachelor.parent}`;
			if (!(groupName in marriageGroups)) {
				marriageGroups[groupName] = {
					members: [bachelor],
					parent: bachelor.parent,
					rank: bachelor.rank,
				};
			} else {
				marriageGroups[groupName]["members"] = marriageGroups[groupName][
					"members"
				].concat([bachelor]);
			}
		}

		//console.log("bachelorTaxa: ", bachelorTaxa);
		//console.log("marriageGroups: ", marriageGroups);

		if (view === "marriedTaxaII") {
			for (let key in marriageGroups) {
				const group = marriageGroups[key];
				let groupMembers: any[] = group.members;
				if (group.members.length > 1) {
					groupMembers.sort((a, b) => b.perc - a.perc);

					let fstArrHalf = group.members.slice(
						0,
						Math.ceil(group.members.length / 2)
					);
					let sndArrHalf = group.members
						.slice(Math.ceil(group.members.length / 2))
						.toReversed();
					let mixedArr = [fstArrHalf[0], sndArrHalf[0]];
					let p1 = 1;
					while (p1 < fstArrHalf.length) {
						if (p1 < sndArrHalf.length) {
							mixedArr = mixedArr.concat([fstArrHalf[p1], sndArrHalf[p1]]);
						} else {
							mixedArr = mixedArr.concat([fstArrHalf[p1]]);
						}
						p1++;
					}
					//console.log(mixedArr);

					let newGroups: object[][] = [];
					let newGroup: object[] = [];
					let sum = 0;
					for (let el of mixedArr) {
						if (sum < threshold) {
							newGroup = newGroup.concat([el]);
							sum += el.perc;
						} else {
							newGroups = newGroups.concat([newGroup]);
							newGroup = [];
							sum = 0;
							newGroup = newGroup.concat([el]);
							sum += el.perc;
						}
					}
					newGroups = newGroups.concat([newGroup]);
					newGroup = [];
					sum = 0;
					//console.log("newGroups: ", newGroups);
					//console.log("\n");

					for (let i = 0; i < newGroups.length; i++) {
						marriageGroups[`${key}-${i}`] = {
							members: newGroups[i],
							parent: group.parent,
							rank: group.rank,
						};
					}
					delete marriageGroups[key];
				}
			}
		}

		//console.log("marriageGroups: ", marriageGroups);

		let newCroppedLns: string[][][] = JSON.parse(JSON.stringify(croppedLns));
		let newRelTaxSet = JSON.parse(JSON.stringify(relTaxSet));
		for (let key in marriageGroups) {
			const group = marriageGroups[key];
			let groupMembers: any[] = group.members;
			const groupIndices = groupMembers.reduce(
				(acc, member) => acc.concat(member.indices),
				[]
			);
			if (groupIndices.length > 1) {
				const marriedName = groupMembers
					.map((member) => member.name)
					.join(" & ");
				const marriedRank = group.rank;
				const marriedCount = groupMembers.reduce(
					(acc, member) => acc + member.count,
					0
				);
				const groupNewIndex = groupIndices[0];
				const deletableIndices = groupIndices.slice(1);

				for (let i of deletableIndices) {
					for (let j = croppedLns[i].length - 1; j >= 0; j--) {
						if (
							croppedLns[i][j][1] + " " + croppedLns[i][j][0] !==
							group.parent
						) {
							delete newRelTaxSet[
								croppedLns[i][j][1] + " " + croppedLns[i][j][0]
							];
						} else {
							break;
						}
					}
					delete newCroppedLns[i];
				}

				const chosenLn = croppedLns[groupNewIndex];
				for (let j = chosenLn.length - 1; j >= 0; j--) {
					if (chosenLn[j][1] + " " + chosenLn[j][0] !== group.parent) {
						delete newRelTaxSet[chosenLn[j][1] + " " + chosenLn[j][0]];
						newCroppedLns[groupNewIndex] = newCroppedLns[groupNewIndex]
							.slice(0, j)
							.concat(newCroppedLns[groupNewIndex].slice(j + 1));
					} else {
						break;
					}
				}

				newRelTaxSet[marriedName + " " + marriedRank] = {
					name: marriedName,
					rank: marriedRank,
					unaCount: marriedCount,
					totCount: marriedCount,
					married: true,
				};
				newCroppedLns[groupNewIndex] = newCroppedLns[groupNewIndex].concat([
					[marriedRank, marriedName],
				]);
			}
		}

		newCroppedLns = newCroppedLns.filter((ln) => Boolean(ln));
		//console.log("married:", newCroppedLns);
		return [newCroppedLns, newRelTaxSet];
	}
	return [croppedLns, relTaxSet];
};

const assignDegreesLayers = (
	croppedLns: string[][][],
	lyr: string,
	minRankPattern: string[],
	relTaxSet: any,
	view: string
) => {
	let alignedLns: string[][] = [];
	let firstAlLayers: any = {};
	for (let i = 0; i < croppedLns.length; i++) {
		let alignedLn: any = new Array(minRankPattern.length).fill(null);
		for (let j = 0; j < croppedLns[i].length; j++) {
			let index = minRankPattern.indexOf(croppedLns[i][j][0]);
			if (index > -1) {
				alignedLn.splice(index, 1, croppedLns[i][j]);
				firstAlLayers[croppedLns[i][j][1] + " " + croppedLns[i][j][0]] = index;
			}
			if (j === 1) {
				firstAlLayers[croppedLns[i][j][1] + " " + croppedLns[i][j][0]] = 1;
			}
		}
		alignedLns.push(alignedLn);
	}

	//console.log("minRankPattern: ", minRankPattern);
	//console.log("alignedLns: ", alignedLns);
	//console.log("firstAlLayers: ", firstAlLayers);

	let layers: any = {};
	let degrees: any = {};
	let startDeg = 0;
	let sumCount =
		view === "allEqual" ? croppedLns.length : relTaxSet[lyr]["totCount"];
	for (let i = 0; i < croppedLns.length; i++) {
		let childTaxon =
			croppedLns[i][croppedLns[i].length - 1][1] +
			" " +
			croppedLns[i][croppedLns[i].length - 1][0];
		for (let j = 0; j < croppedLns[i].length; j++) {
			let currTaxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];

			// Determine first layers and degrees.
			// Every taxon starts at its firstLayerAligned UNLESS
			// its parent is the root taxon but there are missing ranks in between -
			// in which case starts at its firstLayerUnaligned, which is layer 1.
			if (!layers[currTaxon]) {
				degrees[currTaxon] = [round(startDeg, 3)];
				layers[currTaxon] = [firstAlLayers[currTaxon]];
			}

			// Determine the last layer (for the current lineage - next iteration might be for the same taxon,
			// but different lineage and a different last layer, but the first layer is the same for both).
			// If there is a rank gap between the current taxon and the next one, the current taxon fills it.
			let lastLayer: number;
			if (j === croppedLns[i].length - 1) {
				lastLayer = minRankPattern.length;
			} else {
				let nextTaxon = croppedLns[i][j + 1][1] + " " + croppedLns[i][j + 1][0];
				lastLayer = firstAlLayers[nextTaxon];
			}

			layers[currTaxon] = layers[currTaxon].concat([lastLayer]);

			const degree = round(
				view === "allEqual"
					? startDeg + 360 / sumCount
					: startDeg + (relTaxSet[childTaxon]["unaCount"] * 360) / sumCount,
				3
			);
			degrees[currTaxon] = degrees[currTaxon].concat([degree]);
		}

		startDeg += round(
			view === "allEqual"
				? 360 / sumCount
				: (relTaxSet[childTaxon]["unaCount"] * 360) / sumCount,
			3
		);
	}

	for (let taxon in relTaxSet) {
		for (let i = layers[taxon].length - 1; i >= 1; i--) {
			if (layers[taxon][i] === layers[taxon][i - 1]) {
				degrees[taxon][i - 1] = degrees[taxon][i];
				degrees[taxon].splice(i, 1);
				layers[taxon].splice(i, 1);
			}
		}
		relTaxSet[taxon]["layers"] = layers[taxon];
		relTaxSet[taxon]["degrees"] = degrees[taxon];
	}

	return relTaxSet;
};

const calcSVGPaths = (
	cx: number,
	cy: number,
	layerWidth: number,
	relTaxSet: any
) => {
	for (let key in relTaxSet) {
		let SVGPath = "";
		const layerArr = relTaxSet[key]["layers"];
		const degArr = relTaxSet[key]["degrees"];
		const startDeg = degArr[0];
		const endDeg = degArr[degArr.length - 1];
		const innRad = round(layerArr[0] * layerWidth);

		// If calculating root taxon shape - circle.
		if (layerArr[0] === 0) {
			SVGPath = `M ${cx}, ${cy} m -${layerWidth}, 0 a ${layerWidth},${layerWidth} 0 1,0 ${
				layerWidth * 2
			},0 a ${layerWidth},${layerWidth} 0 1,0 -${layerWidth * 2},0`;
		} else {
			// If the shape to be drawn completes a full circle...
			if (round(endDeg - startDeg) >= 360) {
				const innerArcPath = `M ${cx}, ${cy} m -${innRad}, 0 a ${innRad},${innRad} 0 1,0 ${
					innRad * 2
				},0 a ${innRad},${innRad} 0 1,0 -${innRad * 2},0`;
				SVGPath = innerArcPath;

				// ...and consists simply of two concentric circles.
				if (layerArr.length === 2) {
					let outerCirc = layerArr[1] * layerWidth;
					let midArcPath: string = `M ${cx}, ${cy} m -${outerCirc}, 0 a ${outerCirc},${outerCirc} 0 1,0 ${
						outerCirc * 2
					},0 a ${outerCirc},${outerCirc} 0 1,0 -${outerCirc * 2},0`;
					SVGPath = SVGPath + " " + midArcPath;
				}
				// ...and is of irregular shape.
				else {
					let midArc: any = {};
					for (let i = layerArr.length - 1; i >= 1; i--) {
						let curr = degArr[i];
						let prev = degArr[i - 1];
						let MorL = i === layerArr.length - 1 ? "M" : "L";
						midArc = calculateArcEndpoints(
							layerArr[i],
							layerWidth,
							prev,
							curr,
							cx,
							cy
						);
						let midArcPath: string = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
						if (Math.abs(curr - prev) >= 180) {
							midArcPath = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;
						}
						SVGPath = SVGPath + " " + midArcPath;
					}
					let lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${cx},${
						cy + layerArr[layerArr.length - 1] * layerWidth
					}`;
					SVGPath = SVGPath + " " + lineInnertoOuter;
				}
			}
			// If the shape doesn't complete a full circle.
			else {
				let innerArc: any = calculateArcEndpoints(
					layerArr[0],
					layerWidth,
					startDeg,
					endDeg,
					cx,
					cy
				);
				let innerArcPath: string = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innRad},${innRad} 0 0 1 ${innerArc["x2"]},${innerArc["y2"]}`;
				if (Math.abs(endDeg - startDeg) >= 180) {
					innerArcPath = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innerArc["radius"]},${innerArc["radius"]} 0 1 1 ${innerArc["x2"]},${innerArc["y2"]}`;
				}

				SVGPath = innerArcPath;
				let midArc: any = {};
				for (let i = layerArr.length - 1; i >= 0; i--) {
					let curr = degArr[i];
					let prev = i === 0 ? startDeg : degArr[i - 1];
					midArc = calculateArcEndpoints(
						layerArr[i],
						layerWidth,
						prev,
						curr,
						cx,
						cy
					);
					let midArcPath: string = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
					if (Math.abs(curr - prev) >= 180) {
						midArcPath = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;
					}
					SVGPath = SVGPath + " " + midArcPath;
				}

				let lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${innerArc["x1"]},${innerArc["y1"]}`;
				SVGPath = SVGPath + " " + lineInnertoOuter;
			}
		}
		relTaxSet[key]["path"] = SVGPath;
	}
	return relTaxSet;
};

const color = (croppedLns: string[][][], lyr: string, relTaxSet: any) => {
	const palette = createPalette(8);
	let colors: any = {};
	let hueColored: string[] = [];
	let colorIndex = 0;
	relTaxSet[lyr]["color"] = "#ffffff";
	for (let i = 0; i < croppedLns.length; i++) {
		if (croppedLns[i].length > 1) {
			let firstAncestor = croppedLns[i][1][1] + " " + croppedLns[i][1][0];
			if (hueColored.indexOf(firstAncestor) === -1) {
				colors[firstAncestor] = palette[colorIndex % palette.length];
				relTaxSet[firstAncestor]["color"] =
					palette[colorIndex % palette.length];
				hueColored.push(firstAncestor);
				colorIndex++;
			}

			for (let j = 2; j < croppedLns[i].length; j++) {
				let currTaxon = croppedLns[i][j][1] + " " + croppedLns[i][j][0];
				let ancestorColor = colors[firstAncestor];
				let nextColorIndex =
					(palette.indexOf(ancestorColor) + 1) % palette.length;
				let nextColor = palette[nextColorIndex];
				let selfStartDeg = relTaxSet[currTaxon]["degrees"][0];
				let ancestorStartDeg = relTaxSet[firstAncestor]["degrees"][0];
				let ancestorEndDeg =
					relTaxSet[firstAncestor]["degrees"][
						relTaxSet[firstAncestor]["degrees"].length - 1
					];
				let coef =
					(selfStartDeg - ancestorStartDeg) /
					(ancestorEndDeg - ancestorStartDeg);
				let tintFactor = (relTaxSet[currTaxon]["layers"][0] - 1) / 10;
				var hue = midColor(ancestorColor, nextColor, coef);
				var tintifiedHue = tintify(hue, tintFactor);
				colors[currTaxon] = tintifiedHue;
				relTaxSet[currTaxon]["color"] = tintifiedHue;
			}
		}
	}
	return relTaxSet;
};

const label = (
	cx: number,
	cy: number,
	layerWidth: number,
	lyr: string,
	minRankPattern: string[],
	relTaxSet: any
) => {
	const twoVmin = Math.min(window.innerWidth, window.innerHeight) / (100 / 2);
	const yOffset = twoVminHeights[twoVmin] / 4;
	const framePadding = 10;
	for (let key in relTaxSet) {
		const txn = relTaxSet[key];
		const startDeg = txn["degrees"][0];
		const endDeg = txn["degrees"][txn["degrees"].length - 1];
		const midDeg = startDeg + (endDeg - startDeg) / 2;
		const fstLabelLyr = minRankPattern.indexOf(txn.rank);
		const midLyr = fstLabelLyr + 0.333;

		const labelCx = round(midLyr * layerWidth * cos(midDeg)) + cx;
		const labelCy = round(-midLyr * layerWidth * sin(midDeg)) + cy;
		const pointOnStartBorderX = round(midLyr * layerWidth * cos(startDeg)) + cx;
		const pointOnStartBorderY =
			round(-midLyr * layerWidth * sin(startDeg)) + cy;
		const pointOnEndBorderX = round(midLyr * layerWidth * cos(endDeg)) + cx;
		const pointOnEndBorderY = round(-midLyr * layerWidth * sin(endDeg)) + cy;

		const range = txn["degrees"][txn["degrees"].length - 1] - txn["degrees"][0];
		const shapeWidth = lineLength(
			pointOnStartBorderX,
			pointOnStartBorderY,
			pointOnEndBorderX,
			pointOnEndBorderY
		);

		const perc = round((txn.totCount / relTaxSet[lyr].totCount) * 100);
		const [extContent, extWidth]: any[] = calcOptLabel(
			2,
			`${txn.name} ${perc}%`,
			Infinity
		);

		const y = labelCy + yOffset;
		const originX = labelCx;
		const originY = labelCy;

		const frameWidth = extWidth + framePadding;
		const frameY = labelCy - twoVminHeights[twoVmin] / 2;

		let angle, extX: any, abbrContent: any, abbrX, abbrWidth: any, frameX;
		if (!(shapeWidth < twoVmin && range < 180)) {
			// If the wedge touches the edge of the plot and is simple-shaped.
			if (txn.unaCount > 0 && txn.layers.length === 2) {
				let spaceInPx =
					0.666 * layerWidth +
					(txn.layers[1] - fstLabelLyr - 1) * layerWidth +
					4 * 15;
				if (txn.rank === "species") {
					[abbrContent, abbrWidth] = calcOptLabel(
						2,
						`${txn.name.slice(0, 1)}. ${txn.name
							.split(" ")
							.slice(1)
							.join(" ")}`,
						spaceInPx
					);
				} else {
					[abbrContent, abbrWidth] = calcOptLabel(2, txn.name, spaceInPx);
				}

				angle = midDeg <= 180 ? 270 + midDeg : 270 - midDeg;
				if (midDeg >= 180 && midDeg < 360) {
					angle = 360 - angle;
					abbrX = labelCx;
					extX = labelCx + framePadding / 2;
					frameX = labelCx;
				} else if (midDeg >= 0 && midDeg < 180) {
					abbrX = labelCx - abbrWidth;
					extX = labelCx - extWidth - framePadding / 2;
					frameX = labelCx - frameWidth;
				}
			} else {
				// If the wedge is internal, measure both vertical and horizontal available space.
				//console.log(key);
				const lstLabelLyr = Math.min.apply(Math, txn.layers.slice(1));
				const verticalSpace = (lstLabelLyr - fstLabelLyr - 0.4) * layerWidth;

				angle =
					(270 - midDeg + 360) % 360 > 180 && (270 - midDeg + 360) % 360 <= 360
						? midDeg % 360
						: (midDeg + 180) % 360;
				const hemisphere =
					(270 - midDeg + 360) % 360 > 180 && (270 - midDeg + 360) % 360 <= 360
						? "below"
						: "above";

				const horizontalSpace = calcHorizontalSpace(
					angle,
					cx,
					cy,
					endDeg,
					hemisphere,
					fstLabelLyr,
					labelCx,
					labelCy,
					layerWidth,
					lstLabelLyr,
					yOffset,
					startDeg
				);

				if (verticalSpace > horizontalSpace) {
					[abbrContent, abbrWidth] = calcOptLabel(
						2,
						txn.name,
						verticalSpace,
						true
					);

					angle = midDeg <= 180 ? 270 + midDeg : 270 - midDeg;
					if (midDeg >= 180 && midDeg < 360) {
						angle = 360 - angle;
						abbrX = labelCx;
						extX = labelCx + framePadding / 2;
						frameX = labelCx;
					} else if (midDeg >= 0 && midDeg < 180) {
						abbrX = labelCx - abbrWidth;
						extX = labelCx - extWidth - framePadding / 2;
						frameX = labelCx - frameWidth;
					}
				} else {
					[abbrContent, abbrWidth] = calcOptLabel(
						2,
						txn.name,
						horizontalSpace - 6,
						true
					);
					abbrX = labelCx - abbrWidth / 2;
					extX = labelCx - extWidth / 2;
					frameX = labelCx - frameWidth / 2;
				}
			}
		} else {
			// If the wedge is too small for any label.
			abbrContent = "";
			angle = midDeg <= 180 ? 270 + midDeg : 270 - midDeg;
			if (midDeg >= 180 && midDeg < 360) {
				angle = 360 - angle;
				abbrX = labelCx;
				extX = labelCx + framePadding / 2;
				frameX = labelCx;
			} else if (midDeg >= 0 && midDeg < 180) {
				abbrX = labelCx;
				extX = labelCx - extWidth - framePadding / 2;
				frameX = labelCx - frameWidth;
			}
		}

		//console.log("\n");

		relTaxSet[key]["lblObj"] = {
			transform: `rotate(${round(angle)} ${originX} ${originY})`,
			y: y,
			abbrX: abbrContent.length < 4 ? 0 : abbrX,
			abbrContent: abbrContent.length < 4 ? "" : abbrContent,
			extContent: extContent,
			extX: extX,
			frameX: frameX,
			frameY: frameY,
			frameWidth: frameWidth,
		};
	}

	const [extContent, extWidth]: any[] = calcOptLabel(
		2,
		relTaxSet[lyr]["name"],
		Infinity
	);

	console.log(extContent);

	const [abbrContent, abbrWidth]: any[] = calcOptLabel(
		2,
		relTaxSet[lyr]["name"],
		2 * layerWidth,
		true
	);

	const frameWidth = extWidth + framePadding;

	relTaxSet[lyr]["lblObj"] = {
		transform: ``,
		y: cy + yOffset,
		extContent: relTaxSet[lyr]["name"],
		extX: cx - extWidth / 2,
		abbrContent: abbrContent.length < 4 ? "" : abbrContent,
		abbrX: abbrContent.length < 4 ? 0 : cx - abbrWidth / 2,
		frameX: cx - frameWidth / 2,
		frameY: cy - twoVminHeights[twoVmin] / 2,
		frameWidth: frameWidth,
	};

	return relTaxSet;
};

const getAncestors = (
	lns: string[][][],
	lyr: string,
	relTaxSet: any,
	shortcutsHandleClick: any,
	taxSet: any
) => {
	let ancestors: any[] = [];
	for (const ln of lns) {
		if (ln[relTaxSet[lyr]["lnIndex"]]) {
			const name =
				ln[relTaxSet[lyr]["lnIndex"]][1] +
				" " +
				ln[relTaxSet[lyr]["lnIndex"]][0];
			if (name === lyr) {
				for (let j = 0; j < relTaxSet[lyr]["lnIndex"]; j++) {
					let currName = ln[j][1] + " " + ln[j][0];
					let currTxn = taxSet[currName];
					ancestors = [
						{
							ancKey: currName,
							ancName: currTxn.name,
							ancPerc: round(
								(relTaxSet[lyr].totCount * 100) / currTxn.totCount,
								2
							),
							ancHandleClick: () => shortcutsHandleClick(currName),
						},
					].concat(ancestors);
				}
				break;
			}
		}
	}
	return ancestors;
};

export { calcBasicInfo, getAncestors };
