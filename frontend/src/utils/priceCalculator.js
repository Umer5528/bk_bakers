// Client-side mirror of the backend's calculateProductPrice, used only
// for instant visual feedback as the customer picks options. The actual
// order total is always recalculated and locked in on the server
// (see productService.calculatePrice / Module 3-4 checkout) — this never
// gets trusted for the real charge.
export const calculateLocalPrice = (product, selections = {}) => {
  if (!product) return { total: 0, breakdown: [] };

  const breakdown = [];
  let total = 0;

  const weight = product.weightOptions.find(
    (w) => w._id === selections.weightOptionId
  );
  if (weight) {
    breakdown.push({ label: weight.label, amount: weight.price });
    total += weight.price;
  }

  const addOptional = (list, id) => {
    const opt = (list || []).find((o) => o._id === id);
    if (opt) {
      if (opt.priceModifier) breakdown.push({ label: opt.label, amount: opt.priceModifier });
      total += opt.priceModifier || 0;
    }
  };

  addOptional(product.shapeOptions, selections.shapeOptionId);
  addOptional(product.flavorOptions, selections.flavorOptionId);
  addOptional(product.fillingOptions, selections.fillingOptionId);

  for (const group of product.extraOptionGroups || []) {
    const sel = (selections.extraOptionGroups || []).find(
      (g) => g.groupId === group._id
    );
    if (!sel) continue;
    for (const optionId of sel.optionIds) {
      const opt = group.options.find((o) => o._id === optionId);
      if (opt) {
        if (opt.priceModifier) {
          breakdown.push({ label: `${group.name}: ${opt.label}`, amount: opt.priceModifier });
        }
        total += opt.priceModifier || 0;
      }
    }
  }

  return { total: Math.max(0, Math.round(total)), breakdown };
};

export const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
