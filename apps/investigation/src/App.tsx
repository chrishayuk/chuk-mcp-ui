import { useMemo } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Badge,
  ScrollArea,
  Separator,
  cn,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import {
  fadeIn,
  listContainer,
  listItem,
} from "@chuk/view-ui/animations";
import type {
  InvestigationContent,
  EvidenceItem,
  Connection,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function InvestigationView() {
  const { data } =
    useView<InvestigationContent>("investigation", "1.0");

  if (!data) return null;

  return <InvestigationRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface InvestigationRendererProps {
  data: InvestigationContent;
}

/* ------------------------------------------------------------------ */
/*  Evidence type icons (inline SVGs)                                  */
/* ------------------------------------------------------------------ */

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function EventIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ObjectIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function EvidenceTypeIcon({ type, className }: { type: EvidenceItem["type"]; className?: string }) {
  switch (type) {
    case "person":
      return <PersonIcon className={className} />;
    case "document":
      return <DocumentIcon className={className} />;
    case "location":
      return <LocationIcon className={className} />;
    case "event":
      return <EventIcon className={className} />;
    case "object":
      return <ObjectIcon className={className} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Evidence type colour helpers                                       */
/* ------------------------------------------------------------------ */

const TYPE_COLOR: Record<EvidenceItem["type"], string> = {
  person: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  document: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  location: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  event: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  object: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const TYPE_ICON_COLOR: Record<EvidenceItem["type"], string> = {
  person: "text-blue-600 dark:text-blue-400",
  document: "text-amber-600 dark:text-amber-400",
  location: "text-emerald-600 dark:text-emerald-400",
  event: "text-purple-600 dark:text-purple-400",
  object: "text-rose-600 dark:text-rose-400",
};

const STRENGTH_STYLE: Record<string, string> = {
  strong: "border-foreground/70 font-medium",
  medium: "border-dashed border-foreground/40",
  weak: "border-dotted border-foreground/20 text-muted-foreground",
};

/* ------------------------------------------------------------------ */
/*  Investigation Renderer                                             */
/* ------------------------------------------------------------------ */

export function InvestigationRenderer({ data }: InvestigationRendererProps) {
  const { title, evidence, connections, notes } = data;

  const evidenceMap = useMemo(() => {
    const m = new Map<string, EvidenceItem>();
    for (const item of evidence) {
      m.set(item.id, item);
    }
    return m;
  }, [evidence]);

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          {title && (
            <h2 className="text-lg font-semibold mb-1">{title}</h2>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{evidence.length} evidence items</span>
            {connections && connections.length > 0 && (
              <>
                <span className="text-border">|</span>
                <span>{connections.length} connections</span>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4">
          {/* Evidence grid */}
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {evidence.map((item) => (
              <motion.div key={item.id} variants={listItem}>
                <EvidenceCard item={item} />
              </motion.div>
            ))}
          </motion.div>

          {/* Connections */}
          {connections && connections.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Connections</h3>
              <div className="flex flex-wrap gap-2">
                {connections.map((conn, i) => (
                  <ConnectionBadge
                    key={`${conn.from}-${conn.to}-${i}`}
                    connection={conn}
                    evidenceMap={evidenceMap}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Notes</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Evidence Card                                                      */
/* ------------------------------------------------------------------ */

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <Card className={cn("border", TYPE_COLOR[item.type])}>
      <CardContent className="p-4">
        {/* Header: icon + label + type badge */}
        <div className="flex items-start gap-2.5">
          <div className={cn("flex-shrink-0 mt-0.5", TYPE_ICON_COLOR[item.type])}>
            <EvidenceTypeIcon type={item.type} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{item.label}</span>
              <Badge variant="outline" className="text-[10px] flex-shrink-0 capitalize">
                {item.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Image */}
        {item.image && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={item.image}
              alt={item.label}
              className="w-full h-24 object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="mt-2.5 space-y-1">
            {Object.entries(item.metadata).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-2">
                <span className="text-[10px] text-muted-foreground min-w-[60px] flex-shrink-0 capitalize">
                  {key}
                </span>
                <span className="text-[10px]">{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Connection Badge                                                   */
/* ------------------------------------------------------------------ */

interface ConnectionBadgeProps {
  connection: Connection;
  evidenceMap: Map<string, EvidenceItem>;
}

function ConnectionBadge({ connection, evidenceMap }: ConnectionBadgeProps) {
  const fromItem = evidenceMap.get(connection.from);
  const toItem = evidenceMap.get(connection.to);

  const fromLabel = fromItem?.label ?? connection.from;
  const toLabel = toItem?.label ?? connection.to;
  const strength = connection.strength ?? "medium";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs",
        STRENGTH_STYLE[strength]
      )}
    >
      <span className="font-medium">{fromLabel}</span>
      <span className="text-muted-foreground">
        {connection.label ? `\u2014 ${connection.label} \u2192` : "\u2192"}
      </span>
      <span className="font-medium">{toLabel}</span>
      {connection.strength && (
        <span className="text-[10px] text-muted-foreground ml-1">
          ({connection.strength})
        </span>
      )}
    </div>
  );
}
