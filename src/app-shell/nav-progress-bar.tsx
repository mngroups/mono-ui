/**
 * Indeterminate bar along the top edge while a navigation is pending, so a
 * click on a slow route doesn't feel dropped.
 */
export function NavProgressBar() {
  return (
    <div
      role="progressbar"
      aria-label="Memuat halaman"
      className="pointer-events-none fixed inset-x-0 top-(--safe-top) z-[6000] h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="h-full w-1/3 animate-nav-progress bg-primary" />
    </div>
  );
}
