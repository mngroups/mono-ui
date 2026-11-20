"use client";

import { DataNotAvailable } from "../data-not-available/data-not-available.js";

interface EmptyDataComponentProps {
  /** Where a click on the illustration navigates to. Default: `/`. */
  backUrl?: string;
}

/**
 * Thin wrapper over {@link DataNotAvailable} that keeps the legacy behaviour:
 * the `/empty-image.png` illustration from the app's public folder, no
 * description, and a click on the image that navigates to `backUrl`.
 * `DataTable` and `MobileCardList` render it when there are no rows.
 */
const EmptyDataComponent = ({ backUrl = "/" }: EmptyDataComponentProps) => {
  return (
    <DataNotAvailable
      image="/empty-image.png"
      imageSize={130}
      description={null}
      onImageClick={backUrl ? () => (window.location.href = backUrl) : undefined}
    />
  );
};

export default EmptyDataComponent;
