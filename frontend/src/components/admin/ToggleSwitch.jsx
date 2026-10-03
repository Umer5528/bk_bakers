// A real on/off switch with a plain-language label — far easier than a
// tiny checkbox, and the current state is always spelled out in words.
const ToggleSwitch = ({ checked, onChange, label, description, onText = "On", offText = "Off", disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="touch-target flex w-full items-center justify-between gap-4 rounded-xl2 border border-berry-500/10 bg-white px-4 py-3 text-left transition-colors hover:border-rose-300 disabled:opacity-50"
  >
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-berry-600">{label}</span>
      {description && <span className="mt-0.5 block text-xs leading-relaxed text-mauve-500">{description}</span>}
    </span>
    <span className="flex shrink-0 items-center gap-2">
      <span className={`text-xs font-semibold ${checked ? "text-rose-600" : "text-mauve-400"}`}>
        {checked ? onText : offText}
      </span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-rose-500" : "bg-mauve-300"}`}>
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </span>
  </button>
);

export default ToggleSwitch;
