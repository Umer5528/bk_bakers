import { Check } from "lucide-react";
import { formatPKR } from "../../utils/priceCalculator";

// Generic pill/chip selector used for weight, shape, flavor, filling, and
// any admin-defined extra option group (size, spice level, toppings...).
// Works for both single-select and multi-select groups.
const OptionSelector = ({
  label,
  options,
  selectionType = "single",
  selectedIds,
  onChange,
  required = false,
  showPriceAsBase = false,
}) => {
  const activeOptions = options.filter((o) => o.isActive !== false);
  if (!activeOptions.length) return null;

  const isSelected = (id) =>
    selectionType === "single" ? selectedIds === id : selectedIds?.includes(id);

  const toggle = (id) => {
    if (selectionType === "single") {
      onChange(id);
    } else {
      const set = new Set(selectedIds || []);
      set.has(id) ? set.delete(id) : set.add(id);
      onChange(Array.from(set));
    }
  };

  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-berry-600">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {activeOptions.map((opt) => {
          const selected = isSelected(opt._id);
          return (
            <button
              key={opt._id}
              type="button"
              onClick={() => toggle(opt._id)}
              className={`touch-target flex items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all duration-150 ${
                selected
                  ? "border-rose-500 bg-rose-500 text-white shadow-soft"
                  : "border-berry-500/12 bg-white text-berry-600 hover:border-rose-300"
              }`}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
              {opt.label}
              {showPriceAsBase && opt.price !== undefined && (
                <span className="opacity-80">— {formatPKR(opt.price)}</span>
              )}
              {!showPriceAsBase && opt.priceModifier > 0 && (
                <span className="opacity-80">+{formatPKR(opt.priceModifier)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionSelector;
