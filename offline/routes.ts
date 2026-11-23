export interface OfflineRoute {
  segment: string;
  slug?: string;
  params: URLSearchParams;
  path: string;
}

export function parseHash(hash: string): OfflineRoute {
  const raw = hash.replace(/^#/, "").replace(/^\//, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const params = new URLSearchParams(queryPart);
  let segment = segments[0] ?? "home";
  if (segment === "account" || segment === "login" || segment === "register") segment = "profile";

  return {
    segment,
    slug: segments[1],
    params,
    path: `/${segments.join("/")}`,
  };
}

/** Maps a Next-style path to the hash route used by the offline build. */
export function toHashHref(href: string): string {
  if (!href) return "#/";
  if (href.startsWith("#")) return href;
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;

  const [pathPart, queryPart] = href.split("?");
  let path = pathPart;

  if (path === "/") path = "/";
  else if (path === "/distros") path = "/catalog";
  else if (path.startsWith("/distros/")) path = `/distro/${path.slice("/distros/".length)}`;
  else if (path.startsWith("/guides/")) path = `/guide/${path.slice("/guides/".length)}`;
  else if (path.startsWith("/install/")) path = `/install/${path.slice("/install/".length)}`;
  else if (path === "/login" || path === "/register" || path === "/account") path = "/profile";

  const query = queryPart ? `?${queryPart}` : "";
  return `#${path === "/" ? "/" : path}${query}`;
}

export function currentHash(): string {
  return window.location.hash || "#/";
}

export function navigateHref(href: string) {
  const target = toHashHref(href);
  if (target.startsWith("#")) {
    window.location.hash = target;
  } else {
    window.location.href = target;
  }
}
