import { round } from "../radialGeometry";

/**
 * "Marry" (merge) low-abundance leaf taxa into combined taxa, to reduce clutter in the plot.
 *
 * Behavior (only when `view` is "marriedTaxaI" or "marriedTaxaII"):
 * 1) Compute each leaf taxon's percentage of the total (`totCount / sumCount`).
 * 2) If a leaf is below a fixed threshold (2%), it becomes a "bachelor" candidate.
 * 3) For each bachelor, walk upward in its lineage until a parent taxon reaches the threshold;
 *    use that parent + rank as a grouping key ("<rank> in <parent>").
 * 4) Group bachelors by that key => "marriage groups".
 * 5) In "marriedTaxaII", further split groups into subgroups so each subgroup stays under the threshold.
 * 6) For each resulting group with > 1 member, create a merged ("married") taxon:
 *    - name: "A & B & C"
 *    - rank: group's rank
 *    - counts/hits: aggregated
 *    - lineage: cut back to the parent, then append the married node
 *    - delete redundant lineage nodes from relTaxSet that are no longer referenced
 *
 * Notes / assumptions:
 * - `croppedLns` is an array of lineage paths, each path is an array of [rank, name] pairs.
 * - `relTaxSet` contains `totCount` for taxa keys formatted as "<name> <rank>".
 * - This function returns a *new* croppedLns and relTaxSet when marrying; otherwise returns inputs.
 *
 * @param croppedLns - Cropped lineage paths in [rank, name] format.
 * @param lyr - Current root layer key (e.g., "<name(s)> <rank>") used to get the subtree total count.
 * @param relTaxSet - Reduced taxon lookup map keyed by "<name> <rank>".
 * @param view - Controls whether marrying is applied ("marriedTaxaI" / "marriedTaxaII") or not.
 *
 * @returns A tuple:
 *  - If marrying applied: [newCroppedLns, newRelTaxSet]
 *  - Otherwise: [croppedLns, relTaxSet]
 */
export const marry = (
	croppedLns: string[][][],
	lyr: string,
	relTaxSet: any,
	view: string,
) => {
	// --- Only apply marrying in the dedicated views. ---
	if (view === "marriedTaxaI" || view === "marriedTaxaII") {
		// --- Configuration: below this percentage, taxa are considered "small" and eligible to merge. ---
		const threshold = 0.02;

		// --- Total count of the current subtree; used to compute leaf percentages. ---
		// Safety: if lyr is missing or sumCount is 0, we cannot compute percentages.
		if (!relTaxSet?.[lyr]) return [croppedLns, relTaxSet];
		const sumCount = relTaxSet[lyr]["totCount"];
		if (!sumCount || sumCount <= 0) return [croppedLns, relTaxSet];

		// --- 1) Collect "bachelor" taxa: low-percentage leaves + metadata + indices where they occur. ---
		let bachelorTaxa: any = {};
		for (let i = 0; i < croppedLns.length; i++) {
			const ln = croppedLns[i];

			// Leaf key: "<name> <rank>"
			const lst = ln[ln.length - 1][1] + " " + ln[ln.length - 1][0];

			// Safety: if a leaf is missing in relTaxSet, skip it.
			if (!relTaxSet?.[lst]) continue;

			const lstPerc = relTaxSet[lst]["totCount"] / sumCount;

			// Only consider leaves below the threshold for marrying.
			if (lstPerc < threshold) {
				// --- Walk upward to find the nearest parent that is >= threshold. ---
				// That parent becomes the "anchor" for grouping.
				let parent: string | undefined;
				let bachelorName: string | undefined;
				let bachelorRank: string | undefined;

				for (let j = ln.length - 2; j >= 0; j--) {
					parent = ln[j][1] + " " + ln[j][0];
					bachelorName = ln[j + 1][1];
					bachelorRank = ln[j + 1][0];

					// Safety: if parent missing, keep walking.
					if (!relTaxSet?.[parent]) continue;

					if (relTaxSet[parent]["totCount"] / sumCount >= threshold) {
						break;
					}
				}

				// If we couldn't establish the needed info, skip.
				if (!parent || !bachelorName || !bachelorRank) continue;

				const bachelor = bachelorName + " " + bachelorRank;

				// --- Create or update bachelor entry. ---
				if (!(bachelor in bachelorTaxa)) {
					// Safety: if bachelor node missing, skip.
					if (!relTaxSet?.[bachelor]) continue;

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

		// --- 2) Build marriage groups by "<rank> in <parent>". ---
		// Each group gathers bachelors that should be merged under the same parent at the same rank.
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

		// --- 3) marriedTaxaII: further split each group into multiple subgroups (if needed). ---
		// Goal: avoid having one huge merged node by partitioning members into chunks under the threshold.
		if (view === "marriedTaxaII") {
			for (const key of Object.keys(marriageGroups)) {
				const group = marriageGroups[key];

				if (group.members.length > 1) {
					// Sort by descending percentage to distribute weights more evenly.
					group.members.sort((a: any, b: any) => b.perc - a.perc);

					// Mix halves: take from the top half and bottom half alternately (zig-zag pairing).
					const fstArrHalf = group.members.slice(
						0,
						Math.ceil(group.members.length / 2),
					);
					const sndArrHalf = group.members
						.slice(Math.ceil(group.members.length / 2))
						.toReversed();

					let mixedArr: any[] = [fstArrHalf[0], sndArrHalf[0]];
					let p1 = 1;
					while (p1 < fstArrHalf.length) {
						if (p1 < sndArrHalf.length) {
							mixedArr = mixedArr.concat([fstArrHalf[p1], sndArrHalf[p1]]);
						} else {
							mixedArr = mixedArr.concat([fstArrHalf[p1]]);
						}
						p1++;
					}

					// Partition mixedArr into newGroups where each group's sum(perc) stays ~ under threshold.
					let newGroups: object[][] = [];
					let newGroup: object[] = [];
					let sum = 0;

					for (let el of mixedArr as any[]) {
						if (sum < threshold) {
							newGroup = newGroup.concat([el]);
							sum += (el as any).perc;
						} else {
							newGroups = newGroups.concat([newGroup]);
							newGroup = [];
							sum = 0;
							newGroup = newGroup.concat([el]);
							sum += (el as any).perc;
						}
					}
					newGroups = newGroups.concat([newGroup]);

					// Replace the original group with the newly created subgroups.
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

		// --- 4) Create new cropped lineages and reduced taxSet with merged ("married") taxa. ---
		// Prefer structuredClone if available; fall back to JSON copy.
		const newCroppedLns: string[][][] =
			typeof structuredClone === "function"
				? structuredClone(croppedLns)
				: JSON.parse(JSON.stringify(croppedLns));

		const newRelTaxSet =
			typeof structuredClone === "function"
				? structuredClone(relTaxSet)
				: JSON.parse(JSON.stringify(relTaxSet));

		// --- For each marriage group, merge members and rewrite one representative lineage. ---
		for (let key in marriageGroups) {
			const group = marriageGroups[key];
			const groupMembers: any[] = group.members;

			// Collect all lineage indices where these members appear.
			const groupIndices = groupMembers.reduce(
				(acc, member) => acc.concat(member.indices),
				[] as number[],
			);

			// Only marry if there are at least 2 occurrences to combine.
			if (groupIndices.length > 1) {
				// --- Compute merged taxon fields (name/rank/count/hits). ---
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

				// Choose one lineage index to keep as the representative; delete the others.
				const groupNewIndex = groupIndices[0];
				const deletableIndices = groupIndices.slice(1);

				// --- Delete redundant lineages and prune relTaxSet nodes above the shared parent. ---
				for (let i of deletableIndices) {
					for (let j = croppedLns[i].length - 1; j >= 0; j--) {
						const nodeKey = croppedLns[i][j][1] + " " + croppedLns[i][j][0];

						if (nodeKey !== group.parent) {
							delete newRelTaxSet[nodeKey];
						} else {
							break;
						}
					}
					delete (newCroppedLns as any)[i];
				}

				// --- For the chosen representative lineage: prune nodes above the parent and append married node. ---
				const chosenLn = croppedLns[groupNewIndex];

				for (let j = chosenLn.length - 1; j >= 0; j--) {
					const nodeKey = chosenLn[j][1] + " " + chosenLn[j][0];

					if (nodeKey !== group.parent) {
						delete newRelTaxSet[nodeKey];
						newCroppedLns[groupNewIndex] = newCroppedLns[groupNewIndex]
							.slice(0, j)
							.concat(newCroppedLns[groupNewIndex].slice(j + 1));
					} else {
						break;
					}
				}

				// --- Add the new merged taxon entry to relTaxSet. ---
				newRelTaxSet[marriedName + " " + marriedRank] = {
					name: marriedName,
					rank: marriedRank,
					unaCount: marriedCount,
					totCount: marriedCount,
					married: true,
					geneNames: marriedGeneNames,
					fastaHeaders: marriedHeaders,
				};

				// --- Append merged node to the chosen lineage path. ---
				newCroppedLns[groupNewIndex] = newCroppedLns[groupNewIndex].concat([
					[marriedRank, marriedName],
				]);
			}
		}

		// --- Remove deleted lineages (we used `delete`, which leaves holes). ---
		const filteredCropped = newCroppedLns.filter((ln) => !!ln);

		return [filteredCropped, newRelTaxSet];
	}

	// --- If not in a married view, return inputs unchanged. ---
	return [croppedLns, relTaxSet];
};
