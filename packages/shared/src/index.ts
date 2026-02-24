export { useView } from "./use-view";
export type { ViewState } from "./use-view";
export { resolveTemplates } from "./actions";
export {
  applyTheme,
  applyPreset,
  registerPreset,
  getPresetNames,
  CSS_VARS,
  LIGHT_DEFAULTS,
  DARK_DEFAULTS,
} from "./theme";
export type { ThemePreset } from "./presets";
export { BUILT_IN_PRESETS } from "./presets";
export { Fallback } from "./fallback";

// Cross-View message bus
export {
  useViewBus,
  ViewBusProvider,
  useViewBusContainer,
  BUS_VERSION,
  BUS_DISCRIMINATOR,
} from "./bus";
export type {
  ViewMessage,
  ViewMessageType,
  ViewMessageMap,
  ViewBusHandler,
  ViewBusUnsubscribe,
  ViewBusEnvelope,
  SelectMessage,
  FilterMessage,
  HighlightMessage,
  NavigateMessage,
  ExportRequestMessage,
  DragStartMessage,
  DragEndMessage,
  DropMessage,
} from "./bus";

// View hook family
export {
  useViewResize,
  useViewUndo,
  useViewStream,
  useViewSelection,
  useViewFilter,
  useViewExport,
  useViewAuth,
  useViewToast,
  useViewNavigation,
  useViewLiveData,
  useViewDrag,
  useViewEvents,
} from "./hooks";
export type {
  Breakpoint,
  ViewResizeState,
  ViewUndoState,
  ViewStreamState,
  ViewSelectionState,
  ViewFilterState,
  ViewExportState,
  ColumnDef,
  ViewAuthState,
  AuthCredentials,
  AuthStatus,
  AuthType,
  ViewToastState,
  ToastMessage,
  ToastSeverity,
  ViewNavigationState,
  NavigationEntry,
  LiveDataStatus,
  ViewLiveDataState,
  ViewDragState,
  DragItem,
  DragSourceHandle,
  DropTargetHandle,
  ViewEventsState,
  ViewEventType,
  ViewEventPayload,
} from "./hooks";
