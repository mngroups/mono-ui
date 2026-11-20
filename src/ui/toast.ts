import { type ExternalToast, toast as sonnerToast } from "sonner";

type ToastMessage = Parameters<typeof sonnerToast>[0];

// Every toast gets a dismiss "Ok" action so it can be closed from the toast
// itself. A caller can still override it by passing its own `action`.
const withOk = (data?: ExternalToast): ExternalToast => ({
  action: { label: "Ok", onClick: () => {} },
  ...data,
});

// Drop-in replacement for sonner's `toast`. Import from here (not "sonner") so
// every toast in the app is styled + gets the "Ok" action consistently. The
// pass-through of `sonnerToast` keeps `dismiss`/`promise`/`loading`/`custom`/etc.
// Typed as sonner's own `toast` so the declaration build can name it.
/**
 * Sonner's `toast` with the house defaults: every toast gets an "Ok" action that dismisses it.
 * Needs a mounted `<Toaster />`.
 */
export const toast: typeof sonnerToast = Object.assign(
  (message: ToastMessage, data?: ExternalToast) => sonnerToast(message, withOk(data)),
  sonnerToast,
  {
    success: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.success(message, withOk(data)),
    error: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.error(message, withOk(data)),
    info: (message: ToastMessage, data?: ExternalToast) => sonnerToast.info(message, withOk(data)),
    warning: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.warning(message, withOk(data)),
    message: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.message(message, withOk(data)),
  }
);
