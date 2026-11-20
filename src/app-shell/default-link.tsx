import type { AppShellLinkProps } from "./types.js";

/** Plain anchor used when no `linkComponent` is passed. */
export function DefaultLink(props: AppShellLinkProps) {
  return <a {...props} />;
}
