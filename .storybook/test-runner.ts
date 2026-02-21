import type { TestRunnerConfig } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Wait for the view to settle after rendering
    await page.waitForTimeout(500);

    const image = await page.screenshot({
      fullPage: false,
    });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: `__snapshots__/${context.title.replace(/\//g, "-")}`,
      customSnapshotIdentifier: context.name,
      failureThreshold: 0.001,
      failureThresholdType: "percent",
    });
  },
};

export default config;
