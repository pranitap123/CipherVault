export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function fileKind(mime: string): string {
  if (mime.startsWith("image/")) return "Image";
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("text/")) return "Text";
  if (mime.includes("markdown")) return "Markdown";
  return "File";
}
