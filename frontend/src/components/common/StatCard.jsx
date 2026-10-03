const StatCard = ({ label, value, icon: Icon, accent = "text-berry-500" }) => (
  <div className="card-flat p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-wide text-mauve-400">{label}</p>
      {Icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-100">
          <Icon className="h-4 w-4 text-rose-500" />
        </span>
      )}
    </div>
    <p className={`mt-2 font-display text-3xl font-semibold ${accent}`}>{value}</p>
  </div>
);

export default StatCard;
