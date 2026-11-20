"use client";

import type React from "react";

interface LinkPreviewProps {
  /** Absolute URL; its domain gives the favicon and site name. */
  href: string;
  /** Link text; used as the title unless it is the URL itself or not a string. */
  children: React.ReactNode;
}

/**
 * Extracts a human-readable title from a URL path.
 * e.g. "/news/bukit-asam-ptba-fokus-garap-pasar-domestik" -> "Bukit Asam Ptba Fokus Garap Pasar Domestik"
 */
function titleFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    // Get the last meaningful segment of the path
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "";
    // Remove file extensions, numeric IDs, and query artifacts
    const cleaned = lastSegment
      .replace(/\.\w+$/, "") // remove .html, .php, etc.
      .replace(/[-_]/g, " ") // replace separators with spaces
      .replace(/\b\d{5,}\b/g, "") // remove long numeric IDs
      .trim();
    if (cleaned.length < 3) return "";
    // Capitalize first letter of each word
    return cleaned
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

/**
 * Card for a source link: favicon, site name, a title and the URL. Without a usable link text the
 * title is built from the URL's last path segment, or falls back to the domain. Opens in a new tab.
 */
export function LinkPreview({ href, children }: LinkPreviewProps) {
  // Parse domain for the icon and site name
  let domain = "";
  try {
    domain = new URL(href).hostname.replace("www.", "");
  } catch {
    domain = href;
  }

  const siteName = domain.charAt(0).toUpperCase() + domain.slice(1).split(".")[0];
  const urlTitle = titleFromUrl(href);
  const displayTitle =
    (typeof children === "string" && children !== href ? children : "") || urlTitle || domain;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full max-w-sm flex-col overflow-hidden rounded-[20px] border border-transparent p-3 transition-all duration-300 hover:border-neutral-200 hover:bg-neutral-100 hover:shadow-md md:max-w-full dark:hover:border-white/10 dark:hover:bg-black/90 dark:hover:shadow-2xl dark:hover:backdrop-blur-[20px] dark:hover:backdrop-saturate-180"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-white/20">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt=""
            className="h-3 w-3"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <span className="text-[11px] font-medium text-foreground/60 transition-colors group-hover:text-muted-foreground">
          {siteName}
        </span>
      </div>

      <div className="mt-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-neutral-900 dark:group-hover:text-white">
          {displayTitle}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-stone-400">
          {href}
        </p>
      </div>
    </a>
  );
}
