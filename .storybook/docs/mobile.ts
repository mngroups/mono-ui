/**
 * Spread into a story whose export name starts with `Mobile` (story id `…--mobile…`):
 *
 *   export const Mobile: Story = { ...mobileStory, args: { … } };
 *
 * - Canvas view: opens on the 360px viewport.
 * - Docs page: renders in its own iframe, which preview.css narrows to 360px, so
 *   `useIsMobile()` inside the component sees a phone-sized window.
 */
export const mobileStory = {
  globals: { viewport: { value: "mobile", isRotated: false } },
  parameters: { docs: { story: { inline: false, iframeHeight: 640 } } },
} as const;
