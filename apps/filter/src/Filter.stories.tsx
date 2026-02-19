import type { Meta, StoryObj } from "@storybook/react";
import { FilterRenderer } from "./App";
import type { FilterContent } from "./schema";

const meta = {
  title: "Views/Filter",
  component: FilterRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "400px" }}><Story /></div>],
} satisfies Meta<typeof FilterRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchFilters: Story = {
  args: {
    data: {
      type: "filter",
      version: "1.0",
      title: "Search Filters",
      layout: "horizontal",
      submitMode: "instant",
      filters: [
        {
          id: "query",
          label: "Search",
          type: "text",
          placeholder: "Search by name...",
        },
        {
          id: "category",
          label: "Category",
          type: "select",
          placeholder: "All categories",
          options: [
            { value: "electronics", label: "Electronics", count: 142 },
            { value: "clothing", label: "Clothing", count: 89 },
            { value: "books", label: "Books", count: 214 },
            { value: "home", label: "Home & Garden", count: 67 },
          ],
        },
        {
          id: "in-stock",
          label: "In Stock Only",
          type: "toggle",
          defaultValue: false,
        },
      ],
    } satisfies FilterContent,
  },
};

export const ProductFilters: Story = {
  args: {
    data: {
      type: "filter",
      version: "1.0",
      title: "Product Filters",
      layout: "wrap",
      submitMode: "instant",
      filters: [
        {
          id: "brand",
          label: "Brand",
          type: "multi-select",
          options: [
            { value: "apple", label: "Apple", count: 45 },
            { value: "samsung", label: "Samsung", count: 38 },
            { value: "sony", label: "Sony", count: 22 },
            { value: "lg", label: "LG", count: 15 },
          ],
          defaultValue: [],
        },
        {
          id: "price",
          label: "Price Range",
          type: "number-range",
          min: 0,
          max: 2000,
          defaultValue: { from: 0, to: 2000 },
        },
        {
          id: "rating",
          label: "Minimum Rating",
          type: "number-range",
          placeholder: "Min",
        },
      ],
    } satisfies FilterContent,
  },
};

export const DateFilters: Story = {
  args: {
    data: {
      type: "filter",
      version: "1.0",
      title: "Date & Status Filters",
      layout: "vertical",
      submitMode: "instant",
      filters: [
        {
          id: "date-range",
          label: "Date Range",
          type: "date-range",
          defaultValue: { from: "2025-01-01", to: "2025-12-31" },
        },
        {
          id: "status",
          label: "Status",
          type: "checkbox-group",
          options: [
            { value: "active", label: "Active", count: 12 },
            { value: "pending", label: "Pending", count: 5 },
            { value: "archived", label: "Archived", count: 34 },
            { value: "draft", label: "Draft", count: 8 },
          ],
          defaultValue: ["active"],
        },
      ],
    } satisfies FilterContent,
  },
};

export const ButtonSubmit: Story = {
  args: {
    data: {
      type: "filter",
      version: "1.0",
      title: "Deferred Filters",
      layout: "horizontal",
      submitMode: "button",
      resetLabel: "Clear All",
      filters: [
        {
          id: "keyword",
          label: "Keyword",
          type: "text",
          placeholder: "Enter keyword...",
        },
        {
          id: "region",
          label: "Region",
          type: "select",
          placeholder: "All regions",
          options: [
            { value: "us", label: "United States" },
            { value: "eu", label: "Europe" },
            { value: "asia", label: "Asia Pacific" },
            { value: "latam", label: "Latin America" },
          ],
        },
        {
          id: "active-only",
          label: "Active Only",
          type: "toggle",
          defaultValue: true,
        },
        {
          id: "priority",
          label: "Priority",
          type: "checkbox-group",
          options: [
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ],
          defaultValue: ["high", "medium"],
        },
      ],
    } satisfies FilterContent,
  },
};
