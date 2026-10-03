import ApiError from "../utils/ApiError.js";

// Server-side, authoritative price calculation. The frontend price shown
// while a customer is picking options is only ever a preview — this is
// the function whose output actually gets charged and snapshotted onto
// an order (Module 3/4 will call this again at checkout time).
//
// selections shape:
// {
//   weightOptionId: "<id>",
//   shapeOptionId, flavorOptionId, fillingOptionId, // optional
//   extraOptionGroups: [{ groupId, optionIds: ["<id>", ...] }]
// }
export const calculateProductPrice = (product, selections = {}) => {
  const { breakdown, unitTotal } = buildPriceSnapshot(product, selections);
  return { breakdown, productTotal: unitTotal };
};

// Like calculateProductPrice, but also returns a structured snapshot of
// exactly what was selected (labels + individual price components) —
// this is what gets frozen onto an Order so it survives later price or
// catalog changes untouched. Used by the order-creation flow (Module 4).
export const buildPriceSnapshot = (product, selections = {}) => {
  const breakdown = [];

  const weight = product.weightOptions.id(selections.weightOptionId);
  if (!weight || !weight.isActive) {
    throw new ApiError(400, "Please select a valid weight/size option");
  }
  breakdown.push({ label: weight.label, amount: weight.price });
  let total = weight.price;

  const snapshot = {
    weight: { label: weight.label, price: weight.price },
    shape: null,
    flavor: null,
    filling: null,
    extras: [],
  };

  const applyOptional = (list, id, groupLabel, snapshotKey) => {
    if (!id) return;
    const opt = list.id(id);
    if (!opt || !opt.isActive) {
      throw new ApiError(400, `Selected ${groupLabel} option is no longer available`);
    }
    if (opt.priceModifier) {
      breakdown.push({ label: opt.label, amount: opt.priceModifier });
    }
    total += opt.priceModifier || 0;
    snapshot[snapshotKey] = { label: opt.label, priceModifier: opt.priceModifier || 0 };
  };

  applyOptional(product.shapeOptions, selections.shapeOptionId, "shape", "shape");
  applyOptional(product.flavorOptions, selections.flavorOptionId, "flavor", "flavor");
  applyOptional(product.fillingOptions, selections.fillingOptionId, "filling", "filling");

  for (const group of product.extraOptionGroups) {
    const selection = (selections.extraOptionGroups || []).find(
      (g) => String(g.groupId) === String(group._id)
    );

    if (group.required && (!selection || !selection.optionIds?.length)) {
      throw new ApiError(400, `Please make a selection for "${group.name}"`);
    }
    if (!selection) continue;

    if (group.selectionType === "single" && selection.optionIds.length > 1) {
      throw new ApiError(400, `Only one option can be selected for "${group.name}"`);
    }

    for (const optionId of selection.optionIds) {
      const opt = group.options.id(optionId);
      if (!opt || !opt.isActive) {
        throw new ApiError(400, `An option selected in "${group.name}" is no longer available`);
      }
      if (opt.priceModifier) {
        breakdown.push({ label: `${group.name}: ${opt.label}`, amount: opt.priceModifier });
      }
      total += opt.priceModifier || 0;
      snapshot.extras.push({
        groupName: group.name,
        label: opt.label,
        priceModifier: opt.priceModifier || 0,
      });
    }
  }

  return {
    breakdown,
    unitTotal: Math.max(0, Math.round(total)),
    selectedOptions: snapshot,
  };
};

export default calculateProductPrice;
