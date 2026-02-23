import { useCallback, useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeIn,
  listContainer,
  listItem,
  collapseExpand,
  pressable,
} from "@chuk/view-ui/animations";
import type { StepperContent, Step } from "./schema";

/* ------------------------------------------------------------------ */
/*  View (connected)                                                   */
/* ------------------------------------------------------------------ */

export function StepperView() {
  const { data, callTool } =
    useView<StepperContent>("stepper", "1.0");

  if (!data) return null;

  return <StepperRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface StepperRendererProps {
  data: StepperContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}

function SkipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="12" x2="12" y2="4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Step circle                                                        */
/* ------------------------------------------------------------------ */

const CIRCLE_SIZE = "w-8 h-8"; // 32px

function StepCircle({
  step,
  index,
  interactive,
  onClick,
}: {
  step: Step;
  index: number;
  interactive: boolean;
  onClick?: () => void;
}) {
  const status = step.status ?? "pending";

  const circleClasses = cn(
    CIRCLE_SIZE,
    "rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors",
    status === "completed" &&
      "bg-emerald-500 text-white dark:bg-emerald-600",
    status === "error" &&
      "bg-red-500 text-white dark:bg-red-600",
    status === "active" &&
      "bg-primary text-primary-foreground",
    status === "skipped" &&
      "bg-muted text-muted-foreground",
    status === "pending" &&
      "border-2 border-border bg-background text-muted-foreground"
  );

  const inner = (() => {
    if (status === "completed") return <CheckIcon className="w-4 h-4" />;
    if (status === "error") return <XIcon className="w-4 h-4" />;
    if (status === "skipped") return <SkipIcon className="w-4 h-4" />;
    return <span>{index + 1}</span>;
  })();

  if (interactive) {
    return (
      <motion.button
        variants={pressable}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        className={cn(circleClasses, "cursor-pointer")}
        onClick={onClick}
        aria-label={`Go to step ${index + 1}: ${step.label}`}
        type="button"
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <div className={circleClasses} aria-hidden="true">
      {inner}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal stepper                                                 */
/* ------------------------------------------------------------------ */

function HorizontalStepper({
  steps,
  activeStep,
  interactive,
  onStepClick,
}: {
  steps: Step[];
  activeStep: number;
  interactive: boolean;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-start w-full" role="list">
      {steps.map((step, i) => (
        <div
          key={step.id}
          className="flex-1 flex flex-col items-center"
          role="listitem"
          aria-current={i === activeStep ? "step" : undefined}
        >
          {/* Circle row */}
          <div className="flex items-center w-full">
            {/* Left connector */}
            {i > 0 && (
              <div
                className={cn(
                  "flex-1 border-t-2",
                  (steps[i - 1]?.status === "completed" || steps[i - 1]?.status === "active")
                    ? "border-emerald-500 dark:border-emerald-600"
                    : "border-border"
                )}
              />
            )}
            {i === 0 && <div className="flex-1" />}

            <StepCircle
              step={step}
              index={i}
              interactive={interactive}
              onClick={() => onStepClick(i)}
            />

            {/* Right connector */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 border-t-2",
                  (step.status === "completed")
                    ? "border-emerald-500 dark:border-emerald-600"
                    : "border-border"
                )}
              />
            )}
            {i === steps.length - 1 && <div className="flex-1" />}
          </div>

          {/* Label */}
          <div className="mt-2 text-center px-1">
            <p
              className={cn(
                "text-xs font-medium",
                step.status === "active"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vertical stepper                                                   */
/* ------------------------------------------------------------------ */

function VerticalStepper({
  steps,
  activeStep,
  interactive,
  onStepClick,
}: {
  steps: Step[];
  activeStep: number;
  interactive: boolean;
  onStepClick: (index: number) => void;
}) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
      role="list"
    >
      {steps.map((step, i) => (
        <motion.div
          key={step.id}
          variants={listItem}
          className="flex"
          role="listitem"
          aria-current={i === activeStep ? "step" : undefined}
        >
          {/* Left column: circle + connector */}
          <div className="flex flex-col items-center mr-4">
            <StepCircle
              step={step}
              index={i}
              interactive={interactive}
              onClick={() => onStepClick(i)}
            />
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 w-0 border-l-2 min-h-[32px] my-1",
                  step.status === "completed"
                    ? "border-emerald-500 dark:border-emerald-600"
                    : "border-border"
                )}
              />
            )}
          </div>

          {/* Right column: label + description */}
          <div className="pb-6 pt-1 min-w-0 flex-1">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "active"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main renderer                                                      */
/* ------------------------------------------------------------------ */

export function StepperRenderer({ data, onCallTool }: StepperRendererProps) {
  const {
    title,
    steps,
    activeStep,
    orientation = "horizontal",
    allowNavigation = false,
    stepTool,
  } = data;

  const interactive = allowNavigation && !!stepTool;

  const handleStepClick = useCallback(
    async (index: number) => {
      if (onCallTool && stepTool && allowNavigation) {
        await onCallTool(stepTool, {
          stepId: steps[index].id,
          stepIndex: index,
        });
      }
    },
    [onCallTool, stepTool, allowNavigation, steps]
  );

  const activeStepData = useMemo(
    () => steps[activeStep],
    [steps, activeStep]
  );

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[700px] w-full mx-auto p-6 flex flex-col flex-1 min-h-0"
      >
        <Card className="flex flex-col flex-1 min-h-0">
          <CardContent className="p-6 flex flex-col flex-1 min-h-0">
            {/* Title */}
            {title && (
              <h2 className="text-lg font-semibold mb-4">{title}</h2>
            )}

            {/* Step indicator */}
            {orientation === "horizontal" ? (
              <HorizontalStepper
                steps={steps}
                activeStep={activeStep}
                interactive={interactive}
                onStepClick={handleStepClick}
              />
            ) : (
              <VerticalStepper
                steps={steps}
                activeStep={activeStep}
                interactive={interactive}
                onStepClick={handleStepClick}
              />
            )}

            {/* Active step detail */}
            <AnimatePresence mode="wait">
              {activeStepData?.detail && (
                <motion.div
                  key={activeStepData.id}
                  variants={collapseExpand}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="mt-4 rounded-md bg-muted p-4"
                >
                  <p className="text-sm font-medium mb-1">
                    {activeStepData.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeStepData.detail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
