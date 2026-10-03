import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, Eye, EyeOff } from "lucide-react";
import adminService from "../../services/adminService";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";

const TABS = [
  { key: "pending", label: "Waiting for you", match: (r) => r.status === "pending" },
  { key: "shown", label: "On my website", match: (r) => r.status === "approved" },
  { key: "hidden", label: "Not shown", match: (r) => r.status === "rejected" || r.status === "hidden" },
];

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const load = () => {
    setLoading(true);
    adminService.getAllReviews().then(({ reviews: list }) => setReviews(list)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setStatus = async (id, status, message) => {
    try {
      await adminService.moderateReview(id, status);
      toast.success(message);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const current = TABS.find((t) => t.key === tab);
  const list = reviews.filter(current.match);

  return (
    <div>
      <p className="text-[15px] text-mauve-500">
        Customers can review an order after it's finished. Nothing appears on your website until you say so.
      </p>

      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const n = reviews.filter(t.match).length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`touch-target shrink-0 rounded-full border px-4 text-sm font-medium ${
                tab === t.key ? "border-rose-500 bg-rose-500 text-white" : "border-berry-500/12 bg-white text-berry-600"
              }`}>
              {t.label} {n > 0 && <span className={tab === t.key ? "opacity-90" : "text-rose-600"}>({n})</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : list.length === 0 ? (
          <EmptyState icon="⭐" title="No reviews here"
            description={tab === "pending" ? "When a customer leaves a review, it will wait here for you to read it." : "Nothing in this list yet."} />
        ) : (
          list.map((r) => (
            <div key={r._id} className="card-flat p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-berry-600">{r.customer?.name}</p>
                  <p className="text-sm text-mauve-500">about {r.product?.name}</p>
                </div>
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < r.rating ? "fill-peach-300 text-peach-300" : "text-cream-200"}`} />
                  ))}
                </div>
              </div>
              {r.comment ? <p className="mt-3 text-[15px] text-berry-600">“{r.comment}”</p> : <p className="mt-3 text-sm italic text-mauve-400">No written comment — just stars.</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <button onClick={() => setStatus(r._id, "approved", "Review is now on your website")} className="btn-primary touch-target !px-5 !py-2 text-sm">
                    <Eye className="h-4 w-4" /> Show on my website
                  </button>
                )}
                {r.status === "pending" && (
                  <button onClick={() => setStatus(r._id, "rejected", "Review won't be shown")} className="btn-secondary touch-target !px-5 !py-2 text-sm">
                    <EyeOff className="h-4 w-4" /> Don't show
                  </button>
                )}
                {r.status === "approved" && (
                  <button onClick={() => setStatus(r._id, "hidden", "Review hidden from your website")} className="btn-secondary touch-target !px-5 !py-2 text-sm">
                    <EyeOff className="h-4 w-4" /> Hide from my website
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
