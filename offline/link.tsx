import React from "react";
import { toHashHref } from "./routes";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  legacyBehavior?: boolean;
  passHref?: boolean;
};

/**
 * Minimal replacement for next/link inside the single-file build.
 * Every internal route becomes a hash route, so the file works from file://.
 */
export default function Link({
  href,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  shallow: _shallow,
  legacyBehavior: _legacyBehavior,
  passHref: _passHref,
  children,
  ...rest
}: LinkProps) {
  return (
    <a href={toHashHref(href)} {...rest}>
      {children}
    </a>
  );
}
