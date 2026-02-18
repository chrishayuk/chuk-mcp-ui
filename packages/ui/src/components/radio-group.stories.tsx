import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeOptions: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-three" id="option-three" />
        <Label htmlFor="option-three">Option Three</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one" disabled>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-one" id="disabled-one" />
        <Label htmlFor="disabled-one">Option One</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-two" id="disabled-two" />
        <Label htmlFor="disabled-two">Option Two</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-three" id="disabled-three" />
        <Label htmlFor="disabled-three">Option Three</Label>
      </div>
    </RadioGroup>
  ),
};
