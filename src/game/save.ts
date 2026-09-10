export type Save = { version: 2; highScore: number; muted: boolean; scanlines: boolean };
export const saveKey = "ms_taq_man";
export function defaultSave(): Save {
  return { version: 2, highScore: 0, muted: true, scanlines: true };
}
export function decodeSave(raw: string | null): Save {
  if (!raw || raw.length > 4096) return defaultSave();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return defaultSave();
  }
  // ASVS 1.5.2: accept only known schema fields and validated primitive values.
  if (typeof value !== "object" || value === null || !("version" in value)) return defaultSave();
  if (value.version !== 1 && value.version !== 2) return defaultSave();
  if (
    !("highScore" in value) ||
    typeof value.highScore !== "number" ||
    !Number.isSafeInteger(value.highScore) ||
    value.highScore < 0
  )
    return defaultSave();
  return {
    version: 2,
    highScore: value.highScore,
    muted: "muted" in value && typeof value.muted === "boolean" ? value.muted : true,
    scanlines:
      "scanlines" in value && typeof value.scanlines === "boolean" ? value.scanlines : true,
  };
}
export function readSave(storage: Pick<Storage, "getItem">): Save {
  let raw: string | null;
  try {
    raw = storage.getItem(saveKey);
  } catch {
    return defaultSave();
  }
  return decodeSave(raw);
}
export function writeSave(storage: Pick<Storage, "setItem">, save: Save): boolean {
  try {
    storage.setItem(saveKey, JSON.stringify(save));
  } catch {
    return false;
  }
  return true;
}
