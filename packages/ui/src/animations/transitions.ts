import type { Transition } from "framer-motion";

/** Snappy spring — buttons, toggles, small interactive elements */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

/** Quick ease-out — fade-ins, slide-ups, enter animations */
export const easeOut: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

/** Smooth ease-in-out — tab switches, expand/collapse, symmetric moves */
export const easeInOut: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};
