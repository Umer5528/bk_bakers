const TimeSlotSelector = ({ slots = [], value, onChange }) => {
  if (!slots.length) {
    return <p className="text-sm text-mauve-400">No time slots for this date.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const disabled = slot.status === "full";
        return (
          <button
            key={slot.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(slot.id)}
            className={`touch-target rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all duration-150 ${
              disabled
                ? "cursor-not-allowed border-berry-500/5 bg-cream-200 text-mauve-300"
                : value === slot.id
                ? "border-rose-500 bg-rose-500 text-white shadow-soft"
                : "border-berry-500/10 bg-white text-berry-600 hover:border-rose-300"
            }`}
          >
            <span className="block">{slot.label}</span>
            <span className="mt-0.5 block text-[10px] opacity-80">
              {disabled
                ? "Fully booked"
                : slot.status === "limited"
                ? `Only ${slot.remaining} left`
                : "Available"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotSelector;
