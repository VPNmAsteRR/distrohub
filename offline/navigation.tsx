import { useSyncExternalStore } from "react";
import { toHashHref } from "./routes";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function hashSnapshot() {
  return window.location.hash || "#/";
}

export function useHash() {
  return useSyncExternalStore(subscribe, hashSnapshot, () => "#/");
}

const router = {
  push(href: string) {
    const target = toHashHref(href);
    if (target.startsWith("#")) window.location.hash = target;
    else window.location.href = target;
  },
  replace(href: string) {
    const target = toHashHref(href);
    if (target.startsWith("#")) {
      window.history.replaceState(null, "", target);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.replace(target);
    }
  },
  back() {
    window.history.back();
  },
  forward() {
    window.history.forward();
  },
  refresh() {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  },
  prefetch() {
    /* no-op for the offline build */
  },
};

export function useRouter() {
  return router;
}

export function usePathname() {
  const hash = useHash();
  return hash.replace(/^#/, "").split("?")[0] || "/";
}

export function useSearchParams() {
  const hash = useHash();
  return new URLSearchParams(hash.split("?")[1] ?? "");
}
