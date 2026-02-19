import type { Meta, StoryObj } from "@storybook/react";
import { DiffRenderer } from "./App";
import type { DiffContent } from "./schema";

const meta = {
  title: "Views/Diff",
  component: DiffRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof DiffRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleUnified: Story = {
  args: {
    data: {
      type: "diff",
      version: "1.0",
      title: "Update greeting function",
      language: "typescript",
      mode: "unified",
      fileA: "src/greet.ts",
      fileB: "src/greet.ts",
      hunks: [
        {
          headerA: "@@ -1,7 +1,9 @@",
          lines: [
            { type: "context", content: "import { User } from './types';", lineA: 1, lineB: 1 },
            { type: "context", content: "", lineA: 2, lineB: 2 },
            { type: "remove", content: "export function greet(name: string) {", lineA: 3 },
            { type: "remove", content: "  return `Hello, ${name}`;", lineA: 4 },
            { type: "add", content: "export function greet(user: User) {", lineB: 3 },
            { type: "add", content: "  const { name, title } = user;", lineB: 4 },
            { type: "add", content: "  return `Hello, ${title} ${name}`;", lineB: 5 },
            { type: "context", content: "}", lineA: 5, lineB: 6 },
            { type: "context", content: "", lineA: 6, lineB: 7 },
            { type: "context", content: "export default greet;", lineA: 7, lineB: 8 },
          ],
        },
      ],
    } satisfies DiffContent,
  },
};

export const SplitMode: Story = {
  args: {
    data: {
      type: "diff",
      version: "1.0",
      title: "Update greeting function",
      language: "typescript",
      mode: "split",
      fileA: "src/greet.ts",
      fileB: "src/greet.ts",
      hunks: [
        {
          headerA: "@@ -1,7 +1,9 @@",
          lines: [
            { type: "context", content: "import { User } from './types';", lineA: 1, lineB: 1 },
            { type: "context", content: "", lineA: 2, lineB: 2 },
            { type: "remove", content: "export function greet(name: string) {", lineA: 3 },
            { type: "remove", content: "  return `Hello, ${name}`;", lineA: 4 },
            { type: "add", content: "export function greet(user: User) {", lineB: 3 },
            { type: "add", content: "  const { name, title } = user;", lineB: 4 },
            { type: "add", content: "  return `Hello, ${title} ${name}`;", lineB: 5 },
            { type: "context", content: "}", lineA: 5, lineB: 6 },
            { type: "context", content: "", lineA: 6, lineB: 7 },
            { type: "context", content: "export default greet;", lineA: 7, lineB: 8 },
          ],
        },
      ],
    } satisfies DiffContent,
  },
};

export const MultiHunk: Story = {
  args: {
    data: {
      type: "diff",
      version: "1.0",
      title: "Refactor authentication module",
      language: "python",
      fileA: "auth.py",
      fileB: "auth.py",
      hunks: [
        {
          headerA: "@@ -10,6 +10,8 @@",
          lines: [
            { type: "context", content: "import hashlib", lineA: 10, lineB: 10 },
            { type: "context", content: "import secrets", lineA: 11, lineB: 11 },
            { type: "add", content: "import logging", lineB: 12 },
            { type: "add", content: "", lineB: 13 },
            { type: "context", content: "", lineA: 12, lineB: 14 },
            { type: "context", content: "class AuthManager:", lineA: 13, lineB: 15 },
          ],
        },
        {
          headerA: "@@ -45,8 +47,10 @@",
          lines: [
            { type: "context", content: "    def verify_token(self, token: str) -> bool:", lineA: 45, lineB: 47 },
            { type: "remove", content: "        return token in self._tokens", lineA: 46 },
            { type: "add", content: "        if token not in self._tokens:", lineB: 48 },
            { type: "add", content: "            logging.warning('Invalid token attempt')", lineB: 49 },
            { type: "add", content: "            return False", lineB: 50 },
            { type: "add", content: "        return True", lineB: 51 },
            { type: "context", content: "", lineA: 47, lineB: 52 },
            { type: "context", content: "    def revoke_token(self, token: str) -> None:", lineA: 48, lineB: 53 },
          ],
        },
        {
          headerA: "@@ -82,4 +86,7 @@",
          lines: [
            { type: "context", content: "    def cleanup_expired(self) -> int:", lineA: 82, lineB: 86 },
            { type: "context", content: "        count = len(self._expired)", lineA: 83, lineB: 87 },
            { type: "remove", content: "        self._expired.clear()", lineA: 84 },
            { type: "add", content: "        for token in self._expired:", lineB: 88 },
            { type: "add", content: "            logging.info(f'Cleaning up token: {token[:8]}...')", lineB: 89 },
            { type: "add", content: "        self._expired.clear()", lineB: 90 },
            { type: "context", content: "        return count", lineA: 85, lineB: 91 },
          ],
        },
      ],
    } satisfies DiffContent,
  },
};

export const LargeChange: Story = {
  args: {
    data: {
      type: "diff",
      version: "1.0",
      title: "Replace configuration parser",
      language: "javascript",
      fileA: "config/parser.js",
      fileB: "config/parser.js",
      hunks: [
        {
          headerA: "@@ -1,30 +1,35 @@",
          lines: [
            { type: "remove", content: "const fs = require('fs');", lineA: 1 },
            { type: "remove", content: "const path = require('path');", lineA: 2 },
            { type: "remove", content: "const yaml = require('js-yaml');", lineA: 3 },
            { type: "remove", content: "", lineA: 4 },
            { type: "remove", content: "function loadConfig(filePath) {", lineA: 5 },
            { type: "remove", content: "  const ext = path.extname(filePath);", lineA: 6 },
            { type: "remove", content: "  const raw = fs.readFileSync(filePath, 'utf8');", lineA: 7 },
            { type: "remove", content: "  if (ext === '.yaml' || ext === '.yml') {", lineA: 8 },
            { type: "remove", content: "    return yaml.load(raw);", lineA: 9 },
            { type: "remove", content: "  }", lineA: 10 },
            { type: "remove", content: "  return JSON.parse(raw);", lineA: 11 },
            { type: "remove", content: "}", lineA: 12 },
            { type: "remove", content: "", lineA: 13 },
            { type: "remove", content: "function validateConfig(config) {", lineA: 14 },
            { type: "remove", content: "  if (!config.name) throw new Error('name required');", lineA: 15 },
            { type: "remove", content: "  if (!config.version) throw new Error('version required');", lineA: 16 },
            { type: "remove", content: "  return config;", lineA: 17 },
            { type: "remove", content: "}", lineA: 18 },
            { type: "add", content: "import { readFileSync } from 'node:fs';", lineB: 1 },
            { type: "add", content: "import { extname } from 'node:path';", lineB: 2 },
            { type: "add", content: "import { parse as parseYaml } from 'yaml';", lineB: 3 },
            { type: "add", content: "import { z } from 'zod';", lineB: 4 },
            { type: "add", content: "", lineB: 5 },
            { type: "add", content: "const configSchema = z.object({", lineB: 6 },
            { type: "add", content: "  name: z.string().min(1),", lineB: 7 },
            { type: "add", content: "  version: z.string().regex(/^\\d+\\.\\d+\\.\\d+$/),", lineB: 8 },
            { type: "add", content: "  port: z.number().int().positive().default(3000),", lineB: 9 },
            { type: "add", content: "  debug: z.boolean().default(false),", lineB: 10 },
            { type: "add", content: "  database: z.object({", lineB: 11 },
            { type: "add", content: "    host: z.string(),", lineB: 12 },
            { type: "add", content: "    port: z.number().int().positive(),", lineB: 13 },
            { type: "add", content: "    name: z.string(),", lineB: 14 },
            { type: "add", content: "  }).optional(),", lineB: 15 },
            { type: "add", content: "});", lineB: 16 },
            { type: "add", content: "", lineB: 17 },
            { type: "add", content: "export function loadConfig(filePath) {", lineB: 18 },
            { type: "add", content: "  const ext = extname(filePath);", lineB: 19 },
            { type: "add", content: "  const raw = readFileSync(filePath, 'utf8');", lineB: 20 },
            { type: "add", content: "  const data = ext === '.yaml' || ext === '.yml'", lineB: 21 },
            { type: "add", content: "    ? parseYaml(raw)", lineB: 22 },
            { type: "add", content: "    : JSON.parse(raw);", lineB: 23 },
            { type: "add", content: "  return configSchema.parse(data);", lineB: 24 },
            { type: "add", content: "}", lineB: 25 },
            { type: "context", content: "", lineA: 19, lineB: 26 },
            { type: "remove", content: "module.exports = { loadConfig, validateConfig };", lineA: 20 },
            { type: "add", content: "export { configSchema };", lineB: 27 },
          ],
        },
      ],
    } satisfies DiffContent,
  },
};
