import React, { useEffect } from "react";
import type { Decorator } from "@storybook/react";
import { applyTheme } from "@chuk/view-shared";

export const themeDecorator: Decorator = (Story, context) => {
  const theme = (context.globals.theme as "light" | "dark") || "light";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="font-sans text-foreground bg-background p-4">
      <Story />
    </div>
  );
};
