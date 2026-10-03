// The two fulfillment-specific status sequences (spec section 48). A
// pickup order must never enter "out_for_delivery" and a delivery order
// must never enter "ready_for_pickup"/"picked_up" — the UI only ever
// shows the relevant statuses, and the backend enforces the same rule.
export const DELIVERY_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
];

export const PICKUP_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "picked_up",
  "completed",
];

export const getFlowFor = (fulfillmentType) =>
  fulfillmentType === "delivery" ? DELIVERY_FLOW : PICKUP_FLOW;
