const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl3 border border-dashed border-berry-500/15 bg-blush-50/50 px-6 py-14 text-center">
    {icon && <div className="text-4xl">{icon}</div>}
    <h3 className="font-display text-xl font-semibold text-berry-500">{title}</h3>
    {description && <p className="max-w-sm text-sm text-mauve-500">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
