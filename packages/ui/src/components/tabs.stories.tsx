import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab-1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab-1">Account</TabsTrigger>
        <TabsTrigger value="tab-2">Password</TabsTrigger>
        <TabsTrigger value="tab-3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        <p>Manage your account settings and preferences here.</p>
      </TabsContent>
      <TabsContent value="tab-2">
        <p>Change your password and security settings.</p>
      </TabsContent>
      <TabsContent value="tab-3">
        <p>Configure application settings and notifications.</p>
      </TabsContent>
    </Tabs>
  ),
};
