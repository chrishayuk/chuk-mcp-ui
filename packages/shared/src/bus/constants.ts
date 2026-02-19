/** Current protocol version for the message bus wire format. */
export const BUS_VERSION = 1 as const;

/** Discriminator field value on postMessage data objects. */
export const BUS_DISCRIMINATOR = "__chuk_bus" as const;
