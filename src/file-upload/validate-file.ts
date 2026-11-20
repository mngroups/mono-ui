export const DEFAULT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

export function parseAcceptedExts(accept: string): string[] {
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.startsWith("."));
}

export function validateFile(file: File, acceptedExts: string[], maxSizeMB: number): string | null {
  const lowerName = file.name.toLowerCase();
  if (!acceptedExts.some((ext) => lowerName.endsWith(ext))) {
    return `Format file tidak didukung. Harap upload file ${acceptedExts.join(", ")}.`;
  }
  if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
    return `Ukuran file melebihi batas maksimal ${maxSizeMB} MB.`;
  }
  return null;
}

/** `laporan.pdf` → `laporan (1).pdf`, `laporan (2).pdf`, … while the name is taken. */
export function uniqueFileName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let n = 1;
  while (taken.has(`${base} (${n})${ext}`)) n++;
  return `${base} (${n})${ext}`;
}
