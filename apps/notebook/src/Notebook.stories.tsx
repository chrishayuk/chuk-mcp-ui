import type { Meta, StoryObj } from "@storybook/react";
import { NotebookRenderer } from "./App";
import type { NotebookContent } from "./schema";

const meta = {
  title: "Views/Notebook",
  component: NotebookRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "800px" }}><Story /></div>],
} satisfies Meta<typeof NotebookRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DataAnalysis: Story = {
  args: {
    data: {
      type: "notebook",
      version: "1.0",
      title: "Sales Analysis Q4 2024",
      cells: [
        {
          cellType: "markdown",
          source: "# Sales Analysis Q4 2024\nThis notebook analyzes quarterly sales data across all regions. We compare Q3 and Q4 performance to identify growth trends.",
        },
        {
          cellType: "table",
          columns: ["Region", "Q3", "Q4", "Growth"],
          rows: [
            ["North", "$1.2M", "$1.48M", "+23%"],
            ["South", "$890K", "$845K", "-5%"],
            ["East", "$1.05M", "$1.15M", "+9.5%"],
            ["West", "$760K", "$920K", "+21%"],
          ],
          caption: "Regional sales comparison Q3 vs Q4 2024",
        },
        {
          cellType: "markdown",
          source: "## Key Findings\n- North region grew by **23%**, driven by enterprise deals\n- South region declined by 5%, primarily due to seasonal effects\n- West region showed strong recovery with **21% growth**\n- Overall revenue increased by 12% quarter-over-quarter",
        },
        {
          cellType: "counter",
          value: 1.2,
          label: "Million USD Total Revenue",
        },
        {
          cellType: "code",
          language: "python",
          source: "import pandas as pd\n\ndf = pd.read_csv('sales_q4.csv')\nsummary = df.groupby('region')['revenue'].agg(['sum', 'mean'])\nprint(summary.to_string())",
          output: "         sum      mean\nregion                   \nEast   1150000  287500.0\nNorth  1480000  370000.0\nSouth   845000  211250.0\nWest    920000  230000.0",
          collapsed: false,
        },
      ],
    } satisfies NotebookContent,
  },
};

export const TutorialNotebook: Story = {
  args: {
    data: {
      type: "notebook",
      version: "1.0",
      title: "Getting Started with React",
      cells: [
        {
          cellType: "markdown",
          source: "# Getting Started with React\nA beginner's guide to React components. This tutorial covers the fundamentals of building interactive user interfaces with React.",
        },
        {
          cellType: "code",
          language: "jsx",
          source: "function Greeting({ name }) {\n  return (\n    <div className=\"greeting\">\n      <h2>Hello, {name}!</h2>\n      <button onClick={() => alert(`Hi ${name}!`)}>\n        Click me\n      </button>\n    </div>\n  );\n}",
          collapsed: false,
        },
        {
          cellType: "markdown",
          source: "The above component renders a simple greeting with a button. Notice how we:\n\n1. Accept **props** as a function parameter\n2. Use **JSX** to describe the UI\n3. Handle events with `onClick`\n\n> React components are just JavaScript functions that return markup.",
        },
        {
          cellType: "image",
          url: "https://picsum.photos/seed/react/600/300",
          alt: "React component lifecycle diagram",
          caption: "React component rendering flow",
        },
        {
          cellType: "code",
          language: "jsx",
          source: "function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}",
          output: "Count: 0\n[Increment]",
          collapsed: false,
        },
      ],
    } satisfies NotebookContent,
  },
};

export const ResearchNotes: Story = {
  args: {
    data: {
      type: "notebook",
      version: "1.0",
      title: "Archaeological Survey: Site B7",
      cells: [
        {
          cellType: "markdown",
          source: "# Archaeological Survey: Site B7\n## Overview\nPreliminary findings from the 2024 season. Site B7 is located on the eastern slope of the ridge, approximately 2km from the river crossing. Initial survey work began in June 2024.",
        },
        {
          cellType: "image",
          url: "https://picsum.photos/seed/archaeology/600/400",
          alt: "Aerial view of archaeological site B7",
          caption: "Aerial view of Site B7 showing excavation trenches",
        },
        {
          cellType: "table",
          columns: ["Trench", "Depth (m)", "Period", "Notable Finds"],
          rows: [
            ["T1", "1.2", "Medieval", "Pottery sherds, iron nails"],
            ["T2", "0.8", "Post-medieval", "Clay pipe fragments"],
            ["T3", "2.1", "Roman", "Coin hoard (12 denarii)"],
            ["T4", "1.5", "Medieval", "Building foundations"],
            ["T5", "0.6", "Modern", "Victorian refuse pit"],
          ],
          caption: "Summary of trench findings by period",
          collapsed: false,
        },
        {
          cellType: "markdown",
          source: "## Analysis\nThe stratigraphic sequence in **Trench 3** is particularly significant, revealing continuous occupation from the late Roman period through the medieval era. The coin hoard discovered at 2.1m depth has been preliminarily dated to the 3rd century CE.\n\n### Next Steps\n- Complete C14 dating of organic samples\n- Extend Trench 3 to trace the Roman building footprint\n- Commission specialist pottery analysis",
          collapsed: true,
        },
        {
          cellType: "counter",
          value: 47,
          label: "Artifacts Catalogued",
        },
      ],
    } satisfies NotebookContent,
  },
};
