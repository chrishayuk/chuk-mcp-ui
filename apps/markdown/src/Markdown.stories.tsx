import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownRenderer } from "./App";
import type { MarkdownContent } from "./schema";

const meta = {
  title: "Views/Markdown",
  component: MarkdownRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof MarkdownRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    data: {
      type: "markdown",
      version: "1.0",
      title: "Getting Started",
      content: `# Welcome to the Project

This is an introduction to our documentation. Here you will find everything you need to get started.

## Overview

The platform provides a **powerful** set of tools for building *interactive* applications. It combines modern technologies with an intuitive interface.

### Key Features

This section covers the most important features of the platform. Each feature is designed to improve your workflow and productivity.

## Next Steps

Read on to learn more about configuration, deployment, and best practices. We recommend starting with the installation guide below.`,
    } satisfies MarkdownContent,
  },
};

export const RichContent: Story = {
  args: {
    data: {
      type: "markdown",
      version: "1.0",
      title: "Rich Content Demo",
      content: `# Rich Content

## Unordered List

- First item
- Second item
  - Nested item A
  - Nested item B
- Third item

## Ordered List

1. Step one
2. Step two
3. Step three

## Table

| Feature       | Status    | Priority |
|---------------|-----------|----------|
| Authentication| Complete  | High     |
| Dashboard     | In Progress| Medium  |
| API Docs      | Planned   | Low      |
| Notifications | Complete  | High     |

## Blockquote

> "The best way to predict the future is to invent it."
> -- Alan Kay

## Links

Visit the [project homepage](https://example.com) for more information.

Check out the [documentation](https://docs.example.com) for detailed guides.

## Image

![Placeholder image](https://via.placeholder.com/400x200?text=Sample+Image)

---

*End of rich content demo.*`,
    } satisfies MarkdownContent,
  },
};

export const CodeBlocks: Story = {
  args: {
    data: {
      type: "markdown",
      version: "1.0",
      title: "Code Examples",
      content: `# Code Examples

## Inline Code

Use the \`console.log()\` function to print output. You can also reference variables like \`myVariable\` or modules like \`@chuk/view-shared\`.

## JavaScript

\`\`\`javascript
function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

const result = greet("World");
\`\`\`

## TypeScript

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error(\`HTTP error: \${response.status}\`);
  }
  return response.json();
}
\`\`\`

## Python

\`\`\`python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print(fibonacci(10))
\`\`\`

## JSON

\`\`\`json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
\`\`\``,
    } satisfies MarkdownContent,
  },
};
