import { useCallback } from "react";
import { useView, Fallback, useViewEvents } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Separator,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn, listContainer, listItem } from "@chuk/view-ui/animations";
import type { DetailContent, DetailField, DetailAction } from "./schema";

export function DetailView() {
  const { data, content, callTool, isConnected } =
    useView<DetailContent>("detail", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <DetailRenderer data={data} onCallTool={callTool} />;
}

export interface DetailRendererProps {
  data: DetailContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function DetailRenderer({ data, onCallTool }: DetailRendererProps) {
  const { emitAction } = useViewEvents();
  const { title, subtitle, image, fields, actions, sections } = data;

  const handleAction = useCallback(
    async (action: DetailAction) => {
      emitAction(action.tool, action.args ?? {});
      if (onCallTool) {
        await onCallTool(action.tool, action.args ?? {});
      }
    },
    [onCallTool, emitAction]
  );

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[700px] mx-auto p-6"
      >
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              {image && (
                <img
                  src={image.url}
                  alt={image.alt ?? title}
                  className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold leading-tight">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Primary Fields */}
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {fields.map((field, i) => (
                <motion.div key={i} variants={listItem}>
                  <FieldRow field={field} />
                </motion.div>
              ))}
            </motion.div>

            {/* Sections */}
            {sections && sections.length > 0 && sections.map((section, si) => (
              <div key={si} className="mt-6">
                <Separator className="mb-4" />
                <h2 className="text-base font-semibold mb-3">{section.title}</h2>
                <motion.div
                  variants={listContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {section.fields.map((field, fi) => (
                    <motion.div key={fi} variants={listItem}>
                      <FieldRow field={field} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}

            {/* Actions */}
            {actions && actions.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="flex gap-2 flex-wrap">
                  {actions.map((action, i) => (
                    <Button
                      key={i}
                      variant={i === 0 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAction(action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function FieldRow({ field }: { field: DetailField }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm text-muted-foreground min-w-[120px] flex-shrink-0">
        {field.label}
      </span>
      <span className="text-sm">
        <FieldValue field={field} />
      </span>
    </div>
  );
}

function FieldValue({ field }: { field: DetailField }) {
  switch (field.type) {
    case "link":
      return (
        <a
          href={field.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {field.value}
        </a>
      );
    case "email":
      return (
        <a
          href={`mailto:${field.value}`}
          className="text-primary hover:underline"
        >
          {field.value}
        </a>
      );
    case "badge":
      return <Badge variant="secondary">{field.value}</Badge>;
    case "date":
      return <span>{field.value}</span>;
    default:
      return <span>{field.value}</span>;
  }
}
