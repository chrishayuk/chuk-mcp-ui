import type { Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  List stagger                                                      */
/* ------------------------------------------------------------------ */

export const listContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Fade in                                                           */
/* ------------------------------------------------------------------ */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/* ------------------------------------------------------------------ */
/*  Slide up                                                          */
/* ------------------------------------------------------------------ */

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Tab panel — horizontal slide with exit state                      */
/* ------------------------------------------------------------------ */

export const tabPanel: Variants = {
  enter: { opacity: 0, x: 10 },
  active: {
    opacity: 1,
    x: 0,
    transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { type: "tween", ease: "easeInOut", duration: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Pressable — hover & tap micro-interaction                         */
/* ------------------------------------------------------------------ */

export const pressable: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

/* ------------------------------------------------------------------ */
/*  Collapse / expand — accordion & fieldset height animation         */
/* ------------------------------------------------------------------ */

export const collapseExpand: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
  },
};
