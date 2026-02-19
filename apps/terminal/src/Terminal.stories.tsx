import type { Meta, StoryObj } from "@storybook/react";
import { TerminalRenderer } from "./App";
import type { TerminalContent } from "./schema";

const meta = {
  title: "Views/Terminal",
  component: TerminalRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof TerminalRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicOutput: Story = {
  args: {
    data: {
      type: "terminal",
      version: "1.0",
      title: "Build Output",
      lines: [
        { text: "$ npm run build", timestamp: "10:30:00" },
        { text: "" },
        { text: "> project@1.0.0 build" },
        { text: "> vite build" },
        { text: "" },
        { text: "\x1b[36mvite\x1b[0m v6.0.0 building for production..." },
        { text: "\x1b[32m\u2713\x1b[0m 128 modules transformed." },
        { text: "\x1b[32m\u2713\x1b[0m built in 1.24s" },
        { text: "" },
        { text: "dist/index.html          \x1b[2m0.45 kB\x1b[0m \x1b[36m\u2502\x1b[0m gzip: 0.30 kB" },
        { text: "dist/assets/index.js     \x1b[1m\x1b[33m142.50 kB\x1b[0m \x1b[36m\u2502\x1b[0m gzip: 45.20 kB" },
        { text: "dist/assets/index.css    \x1b[2m8.30 kB\x1b[0m \x1b[36m\u2502\x1b[0m gzip: 2.10 kB" },
      ],
      theme: "dark",
      fontSize: "sm",
    } satisfies TerminalContent,
  },
};

export const AnsiColors: Story = {
  args: {
    data: {
      type: "terminal",
      version: "1.0",
      title: "ANSI Color Demo",
      lines: [
        { text: "\x1b[30mBlack\x1b[0m \x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[33mYellow\x1b[0m" },
        { text: "\x1b[34mBlue\x1b[0m \x1b[35mPurple\x1b[0m \x1b[36mCyan\x1b[0m \x1b[37mWhite\x1b[0m" },
        { text: "" },
        { text: "\x1b[90mBright Black\x1b[0m \x1b[91mBright Red\x1b[0m \x1b[92mBright Green\x1b[0m \x1b[93mBright Yellow\x1b[0m" },
        { text: "\x1b[94mBright Blue\x1b[0m \x1b[95mBright Purple\x1b[0m \x1b[96mBright Cyan\x1b[0m \x1b[97mBright White\x1b[0m" },
        { text: "" },
        { text: "\x1b[1mBold text\x1b[0m \x1b[2mDim text\x1b[0m \x1b[3mItalic text\x1b[0m \x1b[4mUnderlined text\x1b[0m" },
        { text: "\x1b[1;31mBold Red\x1b[0m \x1b[1;32mBold Green\x1b[0m \x1b[4;34mUnderline Blue\x1b[0m" },
        { text: "" },
        { text: "\x1b[41m Red BG \x1b[0m \x1b[42m Green BG \x1b[0m \x1b[43m Yellow BG \x1b[0m \x1b[44m Blue BG \x1b[0m" },
      ],
      theme: "dark",
      fontSize: "md",
    } satisfies TerminalContent,
  },
};

export const GreenTheme: Story = {
  args: {
    data: {
      type: "terminal",
      version: "1.0",
      title: "System Monitor",
      lines: [
        { text: "=== SYSTEM STATUS ===" },
        { text: "" },
        { text: "CPU:    [||||||||||||||||||||          ] 67%", timestamp: "10:30:01" },
        { text: "Memory: [||||||||||||||                ] 48%", timestamp: "10:30:01" },
        { text: "Disk:   [||||||||||||||||||||||||      ] 82%", timestamp: "10:30:01" },
        { text: "Net:    [||||||                        ] 23%", timestamp: "10:30:01" },
        { text: "" },
        { text: "Uptime: 14 days, 7 hours, 23 minutes" },
        { text: "Load:   0.45  0.62  0.71" },
        { text: "" },
        { text: "Active connections: 142" },
        { text: "Processes: 287" },
      ],
      theme: "green",
      fontSize: "sm",
      showLineNumbers: true,
    } satisfies TerminalContent,
  },
};

export const AmberTheme: Story = {
  args: {
    data: {
      type: "terminal",
      version: "1.0",
      title: "Retro Terminal",
      lines: [
        { text: "LOGIN: admin" },
        { text: "PASSWORD: ********" },
        { text: "" },
        { text: "Welcome to MAINFRAME v3.2.1" },
        { text: "Last login: Mon Jan 15 08:42:33 2024" },
        { text: "" },
        { text: "admin@mainframe:~$ ls -la" },
        { text: "total 48" },
        { text: "drwxr-xr-x  6 admin admin 4096 Jan 15 08:42 ." },
        { text: "drwxr-xr-x  3 root  root  4096 Jan 10 12:00 .." },
        { text: "-rw-------  1 admin admin  220 Jan 10 12:00 .bash_logout" },
        { text: "-rw-r--r--  1 admin admin 3526 Jan 10 12:00 .bashrc" },
        { text: "drwxr-xr-x  2 admin admin 4096 Jan 15 08:42 data" },
        { text: "drwxr-xr-x  2 admin admin 4096 Jan 14 16:30 logs" },
        { text: "" },
        { text: "admin@mainframe:~$ _" },
      ],
      theme: "amber",
      fontSize: "sm",
    } satisfies TerminalContent,
  },
};

export const LightTheme: Story = {
  args: {
    data: {
      type: "terminal",
      version: "1.0",
      title: "Test Results",
      lines: [
        { text: "$ npx vitest run" },
        { text: "" },
        { text: " \x1b[32m\u2713\x1b[0m src/utils.test.ts (5 tests) \x1b[2m12ms\x1b[0m" },
        { text: " \x1b[32m\u2713\x1b[0m src/parser.test.ts (8 tests) \x1b[2m34ms\x1b[0m" },
        { text: " \x1b[31m\u2717\x1b[0m src/api.test.ts (3 tests) \x1b[2m156ms\x1b[0m" },
        { text: "" },
        { text: "   \x1b[31m\u2717 should handle timeout\x1b[0m" },
        { text: "     \x1b[31mExpected: 200\x1b[0m" },
        { text: "     \x1b[32mReceived: 408\x1b[0m" },
        { text: "" },
        { text: " Tests:  \x1b[31m1 failed\x1b[0m, \x1b[32m15 passed\x1b[0m, 16 total" },
        { text: " Time:   0.202s" },
      ],
      theme: "light",
      fontSize: "sm",
      showLineNumbers: true,
    } satisfies TerminalContent,
  },
};

export const WithScrollback: Story = {
  args: {
    data: {
      type: "terminal",
      version: "1.0",
      title: "Server Logs (scrollback=20)",
      lines: Array.from({ length: 50 }, (_, i) => ({
        text: `[${String(i + 1).padStart(3, "0")}] ${i % 5 === 0 ? "\x1b[33mWARN\x1b[0m" : "\x1b[32mINFO\x1b[0m"} Request processed in ${Math.floor(Math.random() * 200)}ms`,
        timestamp: `10:${String(30 + Math.floor(i / 2)).padStart(2, "0")}:${String((i % 2) * 30).padStart(2, "0")}`,
      })),
      scrollback: 20,
      theme: "dark",
      fontSize: "xs",
      showLineNumbers: true,
    } satisfies TerminalContent,
  },
};
