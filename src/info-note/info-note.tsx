import { cn } from "@mono/utils";
import { X } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert.js";
import { PlainButton } from "../ui/plain-button.js";

export type InfoNoteType = "info" | "success" | "warning" | "error";

export interface InfoNoteProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Semantic colour of the note. */
  type?: InfoNoteType;
  /** Optional bold first line. */
  title?: ReactNode;
  /** The note's message. */
  description: ReactNode;
  /** Show a close button (calls `onClose`). */
  closeable?: boolean;
  /** Called when the close button is clicked; the caller hides the note. */
  onClose?: () => void;
}

/**
 * Tinted guidance box on top of the shadcn `Alert`, without a leading status
 * icon. Rendered as a note — these boxes are guidance, not alerts.
 */
export function InfoNote({
  type = "info",
  title,
  description,
  closeable,
  onClose,
  className,
  ...props
}: InfoNoteProps) {
  return (
    <Alert
      role="note"
      variant={type}
      {...props}
      className={cn("grid-cols-[1fr]", closeable && "pr-10", className)}
    >
      {title && <AlertTitle className="col-start-1">{title}</AlertTitle>}
      <AlertDescription className="col-start-1 text-current/90">{description}</AlertDescription>
      {closeable && (
        <PlainButton
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X size={16} />
        </PlainButton>
      )}
    </Alert>
  );
}
