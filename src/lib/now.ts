// Build-time "now". GLUG_NOW (ISO string) pins it for tests/previews; otherwise the real time.
export function buildNow(): Date {
  const pinned = process.env.GLUG_NOW;
  return pinned ? new Date(pinned) : new Date();
}
