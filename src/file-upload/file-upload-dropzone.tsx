"use client";

import { MultiFileDropzone } from "./multi-file-dropzone.js";
import { SingleFileDropzone } from "./single-file-dropzone.js";
import type { MultiFileDropzoneProps, SingleFileDropzoneProps } from "./types.js";

export type FileUploadDropzoneProps = SingleFileDropzoneProps | MultiFileDropzoneProps;

/**
 * Controlled file picker: `multiple` holds `File[]`, otherwise one `File | null`.
 * Pass `useUploadQueue().items` as `uploads` to show per-file progress.
 */
export function FileUploadDropzone(props: FileUploadDropzoneProps) {
  return props.multiple ? <MultiFileDropzone {...props} /> : <SingleFileDropzone {...props} />;
}
