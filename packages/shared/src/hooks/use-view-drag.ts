import { useState, useCallback, useEffect, useRef } from "react";
import { useViewBus } from "../bus";
import type { ViewMessage } from "../bus";

type BusPayload = Omit<ViewMessage, "source">;

export interface DragItem {
  dragType: string;
  data: Record<string, unknown>;
}

export interface ViewDragState {
  createDragSource: (item: DragItem) => DragSourceHandle;
  createDropTarget: (options: DropTargetOptions) => DropTargetHandle;
  isDragActive: boolean;
  activeDragItem: DragItem | null;
}

export interface DragSourceHandle {
  isDragging: boolean;
  dragProps: {
    draggable: true;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

export interface DropTargetHandle {
  isOver: boolean;
  isDragActive: boolean;
  draggedItem: DragItem | null;
  dropProps: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

interface DropTargetOptions {
  accept: string[];
  onDrop: (item: DragItem) => void;
  onDragEnter?: (item: DragItem) => void;
  onDragLeave?: () => void;
}

interface UseViewDragOptions {
  panelId?: string;
}

/**
 * Cross-View drag-and-drop hook.
 *
 * Wraps `useViewBus` to send and receive `drag-start`, `drag-end`, and `drop`
 * messages. Returns factory functions (`createDragSource`, `createDropTarget`)
 * that produce event-handler props for drag sources and drop targets.
 */
export function useViewDrag(
  options: UseViewDragOptions = {}
): ViewDragState {
  const bus = useViewBus({ panelId: options.panelId });
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Refs to track per-instance mutable state without triggering re-renders
  const dragSourceRefs = useRef<Map<string, { isDragging: boolean }>>(new Map());
  const dropTargetRefs = useRef<Map<number, { enterCount: number; isOver: boolean }>>(new Map());
  const dropTargetIdCounter = useRef(0);

  // Keep a ref to the latest activeDragItem so factory-created closures see it
  const activeDragItemRef = useRef<DragItem | null>(null);
  activeDragItemRef.current = activeDragItem;

  // ── Bus subscriptions ───────────────────────────────────────────
  useEffect(() => {
    const unsubStart = bus.subscribe("drag-start", (msg) => {
      const item: DragItem = msg.item;
      setActiveDragItem(item);
      setIsDragActive(true);
    });

    const unsubEnd = bus.subscribe("drag-end", () => {
      setActiveDragItem(null);
      setIsDragActive(false);
    });

    const unsubDrop = bus.subscribe("drop", () => {
      setActiveDragItem(null);
      setIsDragActive(false);
    });

    return () => {
      unsubStart();
      unsubEnd();
      unsubDrop();
    };
  }, [bus]);

  // ── createDragSource ────────────────────────────────────────────
  const createDragSource = useCallback(
    (item: DragItem): DragSourceHandle => {
      const key = `${item.dragType}:${JSON.stringify(item.data)}`;
      if (!dragSourceRefs.current.has(key)) {
        dragSourceRefs.current.set(key, { isDragging: false });
      }
      const ref = dragSourceRefs.current.get(key)!;

      return {
        isDragging: ref.isDragging,
        dragProps: {
          draggable: true as const,
          onDragStart: (e: React.DragEvent) => {
            ref.isDragging = true;
            e.dataTransfer.setData(
              "application/x-chuk-drag",
              JSON.stringify(item)
            );
            bus.send({ type: "drag-start", item } as BusPayload);
            setActiveDragItem(item);
            setIsDragActive(true);
          },
          onDragEnd: (_e: React.DragEvent) => {
            ref.isDragging = false;
            bus.send({ type: "drag-end" } as BusPayload);
            setActiveDragItem(null);
            setIsDragActive(false);
          },
        },
      };
    },
    [bus]
  );

  // ── createDropTarget ────────────────────────────────────────────
  const createDropTarget = useCallback(
    (opts: DropTargetOptions): DropTargetHandle => {
      const id = dropTargetIdCounter.current++;
      if (!dropTargetRefs.current.has(id)) {
        dropTargetRefs.current.set(id, { enterCount: 0, isOver: false });
      }
      const ref = dropTargetRefs.current.get(id)!;

      const currentItem = activeDragItemRef.current;
      const isAccepted =
        currentItem !== null && opts.accept.includes(currentItem.dragType);

      return {
        isOver: ref.isOver,
        isDragActive: isAccepted,
        draggedItem: isAccepted ? currentItem : null,
        dropProps: {
          onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
          },
          onDragEnter: (e: React.DragEvent) => {
            e.preventDefault();
            ref.enterCount++;
            ref.isOver = true;
            const item = activeDragItemRef.current;
            if (item && opts.accept.includes(item.dragType) && opts.onDragEnter) {
              opts.onDragEnter(item);
            }
          },
          onDragLeave: (_e: React.DragEvent) => {
            ref.enterCount--;
            if (ref.enterCount <= 0) {
              ref.enterCount = 0;
              ref.isOver = false;
              if (opts.onDragLeave) {
                opts.onDragLeave();
              }
            }
          },
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            ref.enterCount = 0;
            ref.isOver = false;
            const item = activeDragItemRef.current;
            if (item && opts.accept.includes(item.dragType)) {
              opts.onDrop(item);
              bus.send({
                type: "drop",
                item,
                targetPanelId: bus.panelId ?? "unknown",
              } as BusPayload);
            }
            setActiveDragItem(null);
            setIsDragActive(false);
          },
        },
      };
    },
    [bus]
  );

  return { createDragSource, createDropTarget, isDragActive, activeDragItem };
}
