const statusStyles = {
  available: "border-berry-500/10 bg-white hover:border-rose-300 text-berry-600",
  limited: "border-peach-200 bg-peach-100 hover:border-peach-300 text-berry-600",
  full: "border-berry-500/5 bg-cream-200 text-mauve-300 cursor-not-allowed",
  closed: "border-berry-500/5 bg-cream-200 text-mauve-300 cursor-not-allowed",
};

const statusDot = {
  available: "bg-green-500",
  limited: "bg-amber-400",
  full: "bg-red-400",
  closed: "bg-mauve-300",
};

// Renders the availability engine's day-by-day output as a horizontally
// scrollable date strip. Only days marked "available" or "limited" are
// selectable — a day that can't actually be fulfilled is never offered.
const DateSelector = ({ days = [], value, onChange }) => {
  if (!days.length) {
    return (
      <p className="text-sm text-mauve-400">
        No available dates right now — please check back soon.
      </p>
    );
  }

  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const disabled = day.status === "full" || day.status === "closed";
        const date = new Date(day.date);
        return (
          <button
            key={day.date}
            type="button"
            disabled={disabled}
            onClick={() => onChange(day.date)}
            className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl2 border-2 py-3 text-xs font-medium transition-all duration-150 ${
              value === day.date ? "border-rose-500 bg-blush-50 shadow-soft" : statusStyles[day.status]
            }`}
            title={day.reason || day.status}
          >
            <span className="text-[10px] uppercase tracking-wide text-mauve-400">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span className="font-display text-lg font-semibold">{date.getDate()}</span>
            <span className="text-[10px] text-mauve-400">
              {date.toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${statusDot[day.status]}`} />
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;
