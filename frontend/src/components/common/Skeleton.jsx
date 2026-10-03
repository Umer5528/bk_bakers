// Reusable shimmer skeleton block — shown anywhere content is loading
// instead of a blank page.
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl3 bg-gradient-to-r from-blush-100 via-peach-100 to-blush-100 bg-[length:200%_100%] ${className}`}
  />
);

export default Skeleton;
