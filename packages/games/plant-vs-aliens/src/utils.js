let internalId = 0;

export function uid(prefix = "id") {
  internalId += 1;
  return `${prefix}-${internalId}`;
}

export function pickByWeight(distribution) {
  const entries = Object.entries(distribution);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total === 0) return entries[0]?.[0];
  const target = Math.random() * total;
  let acc = 0;
  for (const [key, weight] of entries) {
    acc += weight;
    if (target <= acc) return key;
  }
  return entries[entries.length - 1]?.[0];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
