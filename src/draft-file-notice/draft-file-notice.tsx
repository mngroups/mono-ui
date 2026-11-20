import { InfoNote } from "../info-note/info-note.js";

/**
 * Shown after a draft is restored into a form whose file couldn't be kept —
 * browsers don't let a page re-attach a picked file, so the user picks again.
 */
export function DraftFileNotice({
  fileNames,
}: {
  /** Names of the files that must be picked again. Renders nothing when empty. */
  fileNames: string[];
}) {
  if (fileNames.length === 0) return null;
  return (
    <InfoNote
      type="info"
      className="mb-3"
      data-testid="draft-file-notice"
      description={`Draft dipulihkan. File sebelumnya (${fileNames.join(", ")}) perlu dipilih ulang.`}
    />
  );
}
