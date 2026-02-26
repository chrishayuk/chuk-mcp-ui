import type { Meta, StoryObj } from "@storybook/react";
import { FormRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { FormContent } from "./schema";

const meta = {
  title: "Views/Form",
  component: FormRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof FormRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Minimal: Story = {
  args: {
    data: {
      type: "form",
      version: "1.0",
      title: "Contact Us",
      schema: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", title: "Name" },
          email: { type: "string", title: "Email" },
          message: { type: "string", title: "Message" },
        },
      },
      uiSchema: {
        order: ["name", "email", "message"],
        fields: {
          name: { placeholder: "Enter your name" },
          email: { placeholder: "you@example.com" },
          message: { widget: "textarea", placeholder: "Your message..." },
        },
      },
      submitTool: "submit_form",
    } satisfies FormContent,
    onCallTool: mockCallTool,
  },
};

export const WithGroups: Story = {
  args: {
    data: {
      type: "form",
      version: "1.0",
      title: "User Profile",
      description: "Fill out your profile information below.",
      schema: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", title: "Full Name" },
          age: { type: "integer", title: "Age", minimum: 0, maximum: 150 },
          email: { type: "string", title: "Email Address" },
          color: {
            type: "string",
            title: "Favorite Color",
            enum: ["red", "blue", "green"],
            enumLabels: ["Red", "Blue", "Green"],
          },
          notifications: { type: "boolean", title: "Enable Notifications" },
        },
      },
      uiSchema: {
        groups: [
          { title: "Personal", fields: ["name", "age", "email"] },
          {
            title: "Preferences",
            fields: ["color", "notifications"],
            collapsible: true,
            collapsed: false,
          },
        ],
        fields: {
          name: { placeholder: "John Doe" },
          email: { placeholder: "john@example.com" },
          age: { widget: "number" },
          color: { widget: "radio" },
        },
      },
      submitTool: "save_profile",
      submitLabel: "Save Profile",
    } satisfies FormContent,
    onCallTool: mockCallTool,
  },
};

export const AllWidgets: Story = {
  args: {
    data: {
      type: "form",
      version: "1.0",
      title: "All Widget Types",
      description: "Demonstrates every supported widget type.",
      schema: {
        type: "object",
        properties: {
          textField: { type: "string", title: "Text" },
          textareaField: { type: "string", title: "Textarea" },
          numberField: { type: "number", title: "Number", minimum: 0, maximum: 100 },
          selectField: {
            type: "string",
            title: "Select",
            enum: ["option_a", "option_b", "option_c", "option_d", "option_e"],
            enumLabels: ["Option A", "Option B", "Option C", "Option D", "Option E"],
          },
          radioField: {
            type: "string",
            title: "Radio",
            enum: ["small", "medium", "large"],
            enumLabels: ["Small", "Medium", "Large"],
          },
          checkboxField: { type: "boolean", title: "Checkbox (agree to terms)" },
          sliderField: { type: "integer", title: "Slider", minimum: 0, maximum: 100, default: 50 },
          dateField: { type: "string", title: "Date" },
          datetimeField: { type: "string", title: "Date & Time" },
          colorField: { type: "string", title: "Color", default: "#3388ff" },
          passwordField: { type: "string", title: "Password" },
          hiddenField: { type: "string", title: "Hidden", default: "secret_value" },
        },
      },
      uiSchema: {
        order: [
          "textField",
          "textareaField",
          "numberField",
          "selectField",
          "radioField",
          "checkboxField",
          "sliderField",
          "dateField",
          "datetimeField",
          "colorField",
          "passwordField",
          "hiddenField",
        ],
        fields: {
          textField: { widget: "text", placeholder: "Plain text input", help: "This is a standard text field." },
          textareaField: { widget: "textarea", placeholder: "Multi-line text...", help: "Resizable textarea." },
          numberField: { widget: "number", placeholder: "0", help: "Accepts numeric input." },
          selectField: { widget: "select", placeholder: "Choose an option..." },
          radioField: { widget: "radio", help: "Pick one size." },
          checkboxField: { widget: "checkbox" },
          sliderField: { widget: "slider", help: "Drag to select a value between 0 and 100." },
          dateField: { widget: "date" },
          datetimeField: { widget: "datetime" },
          colorField: { widget: "color", help: "Pick a color." },
          passwordField: { widget: "password", placeholder: "Enter password" },
          hiddenField: { widget: "hidden" },
        },
      },
      submitTool: "submit_all_widgets",
      submitLabel: "Submit All",
    } satisfies FormContent,
    onCallTool: mockCallTool,
  },
};
