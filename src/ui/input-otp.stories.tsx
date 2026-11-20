import type { Meta, StoryObj } from "@storybook/react-vite";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { type ComponentProps, useState } from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp.js";

type InputOTPArgs = ComponentProps<typeof InputOTP>;

/** Story args minus `render` / `children`, so each story can pass its own slots as children. */
function baseProps(args: InputOTPArgs): Omit<InputOTPArgs, "render" | "children"> {
  const { render: _render, children: _children, ...rest } = args;
  return rest;
}

const meta = {
  title: "Components/InputOTP",
  component: InputOTP,
  parameters: {
    docs: {
      importPath:
        'import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@mono/ui";',
    },
  },
  args: {
    maxLength: 6,
    "aria-label": "Kode verifikasi",
    disabled: false,
    // The slots are rendered by `render` below.
    children: null,
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <InputOTP {...baseProps(args)}>
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Split the slots into groups with `InputOTPSeparator`. */
export const WithSeparator: Story = {
  render: (args) => (
    <InputOTP {...baseProps(args)}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

/** `pattern` limits the characters, here digits only via `REGEXP_ONLY_DIGITS` from `input-otp`. */
export const DigitsOnly: Story = {
  args: { maxLength: 4, pattern: REGEXP_ONLY_DIGITS },
  render: (args) => (
    <InputOTP {...baseProps(args)}>
      <InputOTPGroup>
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

/** Controlled with `value` + `onChange`; `onComplete` fires once every slot is filled. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("");
    const [done, setDone] = useState(false);
    return (
      <div className="grid gap-3">
        <InputOTP
          {...baseProps(args)}
          value={value}
          onChange={(next) => {
            setValue(next);
            setDone(false);
          }}
          onComplete={() => setDone(true)}
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="text-sm text-muted-foreground">
          {done ? `Kode ${value} dikirim untuk verifikasi.` : "Masukkan kode dari SMS."}
        </p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "123" },
};
