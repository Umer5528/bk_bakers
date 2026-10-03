import Order from "../models/Order.js";

// Generates a unique, human-readable order number like "ORD-2026-00125".
// Never expose Mongo ObjectIds as the customer-facing order identifier.
export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` },
  }).sort({ orderNumber: -1 });

  let nextSeq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.split("-").pop(), 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(5, "0")}`;
};

export default generateOrderNumber;
