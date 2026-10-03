import { createContext, useContext, useState } from "react";

// Carries the in-progress single-product order (product + selected
// options + quantity) from the Product Details page into Checkout.
// This is intentionally simple, in-memory state — not persisted —
// mirroring the spec's one-product-at-a-time ordering flow rather than
// a multi-item shopping cart.
const OrderDraftContext = createContext(null);

export const OrderDraftProvider = ({ children }) => {
  const [draft, setDraft] = useState(null);
  // draft shape: { product, selections, quantity }

  const startDraft = (product, selections, quantity = 1) => {
    setDraft({ product, selections, quantity });
  };

  const updateQuantity = (quantity) => {
    setDraft((prev) => (prev ? { ...prev, quantity } : prev));
  };

  const clearDraft = () => setDraft(null);

  return (
    <OrderDraftContext.Provider value={{ draft, startDraft, updateQuantity, clearDraft }}>
      {children}
    </OrderDraftContext.Provider>
  );
};

export const useOrderDraft = () => {
  const ctx = useContext(OrderDraftContext);
  if (!ctx) throw new Error("useOrderDraft must be used within an OrderDraftProvider");
  return ctx;
};

export default OrderDraftContext;
