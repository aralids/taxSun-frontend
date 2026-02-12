import { round } from "../radialGeometry";

export const marry = (
	croppedLns: string[][][],
	lyr: string,
	relTaxSet: any,
	view: string,
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
						geneNames: relTaxSet[bachelor]["geneNames"],
						fastaHeaders: relTaxSet[bachelor]["fastaHeaders"],
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
						Math.ceil(group.members.length / 2),
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
				[],
			);
			if (groupIndices.length > 1) {
				const marriedName = groupMembers
					.map((member) => member.name)
					.join(" & ");
				const marriedRank = group.rank;
				const marriedCount = groupMembers.reduce(
					(acc, member) => acc + member.count,
					0,
				);
				const marriedGeneNames = groupMembers.reduce(
					(acc, member) => acc.concat(member.geneNames),
					[],
				);
				const marriedHeaders = groupMembers.reduce(
					(acc, member) => acc.concat(member.fastaHeaders),
					[],
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
					geneNames: marriedGeneNames,
					fastaHeaders: marriedHeaders,
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
