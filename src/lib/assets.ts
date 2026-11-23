type AssetMap = Record<string, string>;

declare global {
  // The standalone build injects data URIs here before the app starts.
  // eslint-disable-next-line no-var
  var __DH_ASSETS__: AssetMap | undefined;
}

export function asset(path: string | null | undefined): string {
  if (!path) return "";
  const map = typeof globalThis !== "undefined" ? globalThis.__DH_ASSETS__ : undefined;
  return map?.[path] ?? path;
}
