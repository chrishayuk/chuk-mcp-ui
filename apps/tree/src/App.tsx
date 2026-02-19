import { useState, useMemo, useCallback, useEffect } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import {
  Button,
  Input,
  Checkbox,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, collapseExpand } from "@chuk/view-ui/animations";
import type { TreeContent, TreeNode, TreeBadge } from "./schema";

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                               */
/* ------------------------------------------------------------------ */

export function TreeView() {
  const { data, content, callTool, isConnected } =
    useView<TreeContent>("tree", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <TreeRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface TreeRendererProps {
  data: TreeContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function TreeRenderer({ data, onCallTool }: TreeRendererProps) {
  const {
    title,
    roots,
    selection = "none",
    searchable = false,
    expandDepth = 0,
    loadChildrenTool,
  } = data;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Auto-expand nodes up to expandDepth on mount
  useEffect(() => {
    if (expandDepth <= 0) return;
    const ids = new Set<string>();
    function collect(nodes: TreeNode[], depth: number) {
      if (depth >= expandDepth) return;
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          ids.add(node.id);
          collect(node.children, depth + 1);
        }
      }
    }
    collect(roots, 0);
    setExpandedIds(ids);
  }, [roots, expandDepth]);

  // Search: find matching node ids and their ancestor ids
  const { matchIds, ancestorIds } = useMemo(() => {
    if (!searchTerm.trim()) {
      return { matchIds: new Set<string>(), ancestorIds: new Set<string>() };
    }
    const lower = searchTerm.toLowerCase();
    const matches = new Set<string>();
    const ancestors = new Set<string>();

    function walk(nodes: TreeNode[], path: string[]) {
      for (const node of nodes) {
        const isMatch = node.label.toLowerCase().includes(lower);
        if (isMatch) {
          matches.add(node.id);
          for (const pid of path) ancestors.add(pid);
        }
        if (node.children) {
          walk(node.children, [...path, node.id]);
        }
      }
    }
    walk(roots, []);
    return { matchIds: matches, ancestorIds: ancestors };
  }, [roots, searchTerm]);

  // When searching, auto-expand ancestors of matches
  const effectiveExpandedIds = useMemo(() => {
    if (!searchTerm.trim()) return expandedIds;
    return new Set([...expandedIds, ...ancestorIds]);
  }, [expandedIds, ancestorIds, searchTerm]);

  const toggleExpand = useCallback(
    async (node: TreeNode) => {
      const isExpanded = effectiveExpandedIds.has(node.id);

      if (!isExpanded && node.hasChildren && !node.children) {
        // Lazy load children
        if (loadChildrenTool && onCallTool) {
          setLoadingIds((prev) => new Set([...prev, node.id]));
          try {
            await onCallTool(loadChildrenTool, { nodeId: node.id });
          } finally {
            setLoadingIds((prev) => {
              const next = new Set(prev);
              next.delete(node.id);
              return next;
            });
          }
        }
      }

      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (isExpanded) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    },
    [effectiveExpandedIds, loadChildrenTool, onCallTool],
  );

  const handleSelect = useCallback(
    (node: TreeNode) => {
      if (node.disabled) return;
      if (selection === "none") return;

      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (selection === "single") {
          if (next.has(node.id)) {
            next.clear();
          } else {
            next.clear();
            next.add(node.id);
          }
        } else {
          // multi
          if (next.has(node.id)) {
            next.delete(node.id);
          } else {
            next.add(node.id);
          }
        }
        return next;
      });
    },
    [selection],
  );

  // Filter nodes when searching
  function shouldShow(node: TreeNode): boolean {
    if (!searchTerm.trim()) return true;
    if (matchIds.has(node.id)) return true;
    if (ancestorIds.has(node.id)) return true;
    return false;
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Toolbar */}
      {(title || searchable) && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2 flex-shrink-0"
        >
          {title && (
            <h2 className="m-0 text-base font-semibold">{title}</h2>
          )}
          {searchable && (
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
              aria-label="Search tree"
            />
          )}
        </motion.div>
      )}

      {/* Tree area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-1" role="tree">
          {roots.map((node) =>
            shouldShow(node) ? (
              <TreeNodeRow
                key={node.id}
                node={node}
                depth={0}
                expandedIds={effectiveExpandedIds}
                selectedIds={selectedIds}
                loadingIds={loadingIds}
                selection={selection}
                searchTerm={searchTerm}
                matchIds={matchIds}
                ancestorIds={ancestorIds}
                onToggleExpand={toggleExpand}
                onSelect={handleSelect}
              />
            ) : null,
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {selection === "multi" && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-t flex-shrink-0">
          {selectedCount} selected
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TreeNodeRow (recursive)                                           */
/* ------------------------------------------------------------------ */

interface TreeNodeRowProps {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  loadingIds: Set<string>;
  selection: "none" | "single" | "multi";
  searchTerm: string;
  matchIds: Set<string>;
  ancestorIds: Set<string>;
  onToggleExpand: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
}

function TreeNodeRow({
  node,
  depth,
  expandedIds,
  selectedIds,
  loadingIds,
  selection,
  searchTerm,
  matchIds,
  ancestorIds,
  onToggleExpand,
  onSelect,
}: TreeNodeRowProps) {
  const isExpandable =
    (node.children && node.children.length > 0) || node.hasChildren;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedIds.has(node.id);
  const isLoading = loadingIds.has(node.id);
  const isLeaf = !isExpandable;

  // Determine icon
  const icon =
    node.icon ?? (isLeaf ? "\uD83D\uDCC4" : isExpanded ? "\uD83D\uDCC2" : "\uD83D\uDCC1");

  function shouldShowChild(child: TreeNode): boolean {
    if (!searchTerm.trim()) return true;
    if (matchIds.has(child.id)) return true;
    if (ancestorIds.has(child.id)) return true;
    return false;
  }

  return (
    <div role="treeitem" aria-expanded={isExpandable ? isExpanded : undefined}>
      {/* Node row */}
      <div
        className={cn(
          "h-8 flex items-center cursor-pointer select-none transition-colors",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10",
          node.disabled && "opacity-50 cursor-not-allowed",
        )}
        style={{ paddingLeft: depth * 16 }}
        onClick={() => {
          if (selection !== "none") {
            onSelect(node);
          }
        }}
      >
        {/* Indent guides */}
        {Array.from({ length: depth }, (_, i) => (
          <div
            key={i}
            className="border-l border-border/30 h-full absolute"
            style={{ left: i * 16 + 8 }}
          />
        ))}

        {/* Expand chevron */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {isExpandable ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 min-w-0 min-h-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node);
              }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={cn(
                  "transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
              >
                <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Checkbox (multi-select) */}
        {selection === "multi" && (
          <Checkbox
            checked={isSelected}
            disabled={node.disabled}
            onCheckedChange={() => onSelect(node)}
            onClick={(e) => e.stopPropagation()}
            className="mx-1 flex-shrink-0"
            aria-label={`Select ${node.label}`}
          />
        )}

        {/* Icon */}
        <span className="text-sm mr-1.5 flex-shrink-0 leading-none">
          {icon}
        </span>

        {/* Label */}
        <span className="text-sm flex-1 truncate">{node.label}</span>

        {/* Badge */}
        {node.badge && (
          <NodeBadge badge={node.badge} />
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={collapseExpand}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            {isLoading ? (
              <div
                className="h-8 flex items-center text-xs text-muted-foreground"
                style={{ paddingLeft: (depth + 1) * 16 + 20 }}
              >
                <LoadingSpinner />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              node.children?.map((child) =>
                shouldShowChild(child) ? (
                  <TreeNodeRow
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    expandedIds={expandedIds}
                    selectedIds={selectedIds}
                    loadingIds={loadingIds}
                    selection={selection}
                    searchTerm={searchTerm}
                    matchIds={matchIds}
                    ancestorIds={ancestorIds}
                    onToggleExpand={onToggleExpand}
                    onSelect={onSelect}
                  />
                ) : null,
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge                                                             */
/* ------------------------------------------------------------------ */

function NodeBadge({ badge }: { badge: TreeBadge }) {
  return (
    <span
      className="text-[10px] leading-none px-1.5 py-0.5 rounded-full font-medium mr-2 flex-shrink-0"
      style={{
        backgroundColor: badge.color ? `${badge.color}20` : undefined,
        color: badge.color ?? undefined,
      }}
    >
      {badge.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading spinner                                                   */
/* ------------------------------------------------------------------ */

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-3 w-3 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
