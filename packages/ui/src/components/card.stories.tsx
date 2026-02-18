import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "./button";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: 350 }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description with additional context.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is the main body of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card style={{ width: 350 }}>
      <CardContent className="pt-6">
        <p>This card only has content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};
