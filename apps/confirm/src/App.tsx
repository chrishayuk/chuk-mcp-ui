import { useCallback } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, Button, Badge, Separator, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { slideUp } from "@chuk/view-ui/animations";
import type { ConfirmContent } from "./schema";

export function ConfirmView() {
  const { data, callTool, sendMessage } =
    useView<ConfirmContent>("confirm", "1.0");

  if (!data) return null;

  return <ConfirmRenderer data={data} onCallTool={callTool} onSendMessage={sendMessage} />;
}

export interface ConfirmRendererProps {
  data: ConfirmContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
  onSendMessage?: (params: {
    role: string;
    content: Array<{ type: string; text: string }>;
  }) => Promise<void>;
}

const SEVERITY_STYLES: Record<string, { border: string; badge: string; badgeLabel: string }> = {
  info: {
    border: "border-l-4 border-l-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    badgeLabel: "Info",
  },
  warning: {
    border: "border-l-4 border-l-amber-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    badgeLabel: "Warning",
  },
  danger: {
    border: "border-l-4 border-l-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    badgeLabel: "Danger",
  },
};

export function ConfirmRenderer({ data, onCallTool, onSendMessage }: ConfirmRendererProps) {
  const {
    title,
    message,
    severity = "info",
    details,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmTool,
    confirmArgs,
    cancelTool,
    cancelArgs,
  } = data;

  const styles = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.info;

  const handleConfirm = useCallback(async () => {
    if (onCallTool && confirmTool) {
      await onCallTool(confirmTool, confirmArgs ?? {});
    }
    if (onSendMessage) {
      await onSendMessage({
        role: "user",
        content: [{ type: "text", text: `User confirmed: "${title}"` }],
      });
    }
  }, [onCallTool, confirmTool, confirmArgs, onSendMessage, title]);

  const handleCancel = useCallback(async () => {
    if (onCallTool && cancelTool) {
      await onCallTool(cancelTool, cancelArgs ?? {});
    }
    if (onSendMessage) {
      await onSendMessage({
        role: "user",
        content: [{ type: "text", text: `User cancelled: "${title}"` }],
      });
    }
  }, [onCallTool, cancelTool, cancelArgs, onSendMessage, title]);

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[480px]"
      >
        <Card className={cn(styles.border)}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Badge className={cn("flex-shrink-0", styles.badge)}>
                {styles.badgeLabel}
              </Badge>
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>

            {/* Details */}
            {details && details.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {details.map((detail, i) => (
                    <div key={i} className="flex items-baseline gap-2 text-sm">
                      <span className="text-muted-foreground min-w-[100px] flex-shrink-0">
                        {detail.label}
                      </span>
                      <span className="font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={severity === "danger" ? "destructive" : "default"}
                size="sm"
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
