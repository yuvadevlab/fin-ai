/**
 * Partitions card rows into before/after effect pairs vs plain detail rows.
 * Recognized effect keys: "Before/After", "Old/New limit", "Current/New".
 */
export function partitionRows(cardRows: [string, string][]): {
  effectRows: [string, string][];
  detailRows: [string, string][];
} {
  const effectPairs = [
    ["before", "after"],
    ["old limit", "new limit"],
    ["old balance", "new balance"],
    ["current", "new"],
    ["from", "to"],
  ];

  const rows = cardRows ?? [];
  const used = new Set<number>();
  const effectRows: [string, string][] = [];

  for (const [lowHigh, highKey] of effectPairs) {
    const lowIdx = rows.findIndex(
      ([k], i) =>
        !used.has(i) &&
        k.toLowerCase().includes(lowHigh) &&
        !k.toLowerCase().includes("account") &&
        !k.toLowerCase().includes("category"),
    );
    const highIdx = rows.findIndex(([k], i) => !used.has(i) && k.toLowerCase().includes(highKey));
    if (lowIdx !== -1 && highIdx !== -1) {
      effectRows.push(rows[lowIdx], rows[highIdx]);
      used.add(lowIdx).add(highIdx);
      break; // only one effect pair per card
    }
  }

  const detailRows = rows.filter((_, i) => !used.has(i));
  return { effectRows, detailRows };
}
