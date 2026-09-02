import { useSyncExternalStore } from "react";

const noop = () => () => {};
/**
 * useIsClient
 *
 * Returns `false` during SSR / server-side rendering and `true` once the
 * component has mounted on the client. Uses `useSyncExternalStore` (React 18)
 * which explicitly accepts a `getServerSnapshot` callback, making it the
 * canonical way to handle SSR/client divergence without triggering the
 * "setState inside effect" lint rule.
 *
 * Usage:
 *   const isClient = useIsClient();
 *   const displayName = isClient ? user?.name ?? "Guest" : "Guest";
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}
