import type { Meta, StoryObj } from "@storybook/react";
import { JsonRenderer } from "./App";
import type { JsonContent } from "./schema";

const meta = {
  title: "Views/Json",
  component: JsonRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof JsonRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const APIResponse: Story = {
  args: {
    data: {
      type: "json",
      version: "1.0",
      title: "API Response",
      data: {
        status: 200,
        data: {
          users: [
            { id: 1, name: "Alice Johnson", email: "alice@example.com", active: true },
            { id: 2, name: "Bob Smith", email: "bob@example.com", active: false },
            { id: 3, name: "Carol White", email: "carol@example.com", active: true },
          ],
          pagination: { page: 1, perPage: 25, total: 3 },
        },
        meta: { requestId: "req_abc123", duration: 45 },
      },
      expandDepth: 2,
      searchable: true,
    } satisfies JsonContent,
  },
};

export const DeepNested: Story = {
  args: {
    data: {
      type: "json",
      version: "1.0",
      title: "Configuration",
      data: {
        server: {
          host: "0.0.0.0",
          port: 8080,
          ssl: {
            enabled: true,
            cert: "/etc/ssl/cert.pem",
            key: "/etc/ssl/key.pem",
          },
        },
        database: {
          primary: { host: "db-1.internal", port: 5432, pool: { min: 5, max: 20 } },
          replica: { host: "db-2.internal", port: 5432, pool: { min: 2, max: 10 } },
        },
        features: {
          darkMode: true,
          betaFeatures: false,
          maxUploadSize: null,
          allowedOrigins: ["https://app.example.com", "https://staging.example.com"],
        },
      },
      expandDepth: 1,
    } satisfies JsonContent,
  },
};

export const MixedTypes: Story = {
  args: {
    data: {
      type: "json",
      version: "1.0",
      data: {
        string: "Hello, World!",
        number: 42,
        float: 3.14159,
        boolean: true,
        null_value: null,
        array: [1, "two", false, null, { nested: true }],
        empty_object: {},
        empty_array: [],
      },
      expandDepth: 3,
    } satisfies JsonContent,
  },
};
