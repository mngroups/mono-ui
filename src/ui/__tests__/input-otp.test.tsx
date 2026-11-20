import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OTPInputContext } from "input-otp";
import { beforeAll, describe, expect, it } from "vitest";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../input-otp.js";

beforeAll(() => {
  // input-otp probes for password-manager badges; jsdom has no layout API.
  if (!document.elementFromPoint) document.elementFromPoint = () => null;
});

describe("InputOTP", () => {
  it("shows typed characters and the active slot's caret", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputOTP maxLength={4} aria-label="Kode OTP" containerClassName="otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Kode OTP" });
    await user.click(input);
    await user.keyboard("12");
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[0]).toHaveTextContent("1");
    expect(slots[1]).toHaveTextContent("2");
    expect(slots[2]).toHaveAttribute("data-active", "true");
    expect(slots[2]?.querySelector(".animate-caret-blink")).not.toBeNull();
  });

  it("renders an empty slot without an OTP context", () => {
    const { container } = render(
      <OTPInputContext.Provider value={null as never}>
        <InputOTPSlot index={0} />
      </OTPInputContext.Provider>
    );
    const slot = container.querySelector('[data-slot="input-otp-slot"]');
    expect(slot).toBeEmptyDOMElement();
    expect(slot).not.toHaveAttribute("data-active");
  });

  it("renders an empty slot outside <InputOTP> (default context)", () => {
    const { container } = render(<InputOTPSlot index={0} />);
    expect(container.querySelector('[data-slot="input-otp-slot"]')).toBeEmptyDOMElement();
  });
});
