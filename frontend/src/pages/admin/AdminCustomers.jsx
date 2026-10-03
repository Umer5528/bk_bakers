import { useEffect, useState } from "react";
import { Search, Phone, MessageCircle } from "lucide-react";
import adminService from "../../services/adminService";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { formatPKR } from "../../utils/priceCalculator";
import { telLink, whatsappLink } from "../../utils/friendly";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      adminService.getCustomers({ search: search || undefined }).then(({ customers: list }) => setCustomers(list)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <p className="text-[15px] text-mauve-500">Everyone who has made an account on your website.</p>

      <div className="relative mt-4 max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find someone by name, phone or email" className="input-field pl-10" aria-label="Find a customer" />
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : customers.length === 0 ? (
          <EmptyState icon="👤" title={search ? "No one matches that" : "No customers yet"}
            description={search ? "Try a different name or number." : "When someone creates an account, they'll appear here."} />
        ) : (
          customers.map((c) => (
            <div key={c._id} className="card-flat flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-berry-600">{c.name}</p>
                <p className="text-sm text-mauve-500">{c.phone}{c.email ? ` · ${c.email}` : ""}</p>
                <p className="mt-1 text-sm text-mauve-500">
                  {c.totalOrders} order{c.totalOrders === 1 ? "" : "s"} · spent <strong className="text-berry-600">{formatPKR(c.totalSpent)}</strong>
                </p>
              </div>
              {(c.whatsapp || c.phone) && (
                <div className="flex gap-2">
                  <a href={telLink(c.whatsapp || c.phone)} className="btn-icon touch-target border border-berry-500/10" aria-label={`Call ${c.name}`}><Phone className="h-4 w-4" /></a>
                  <a href={whatsappLink(c.whatsapp || c.phone)} target="_blank" rel="noreferrer" className="btn-icon touch-target border border-berry-500/10" aria-label={`WhatsApp ${c.name}`}><MessageCircle className="h-4 w-4" /></a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
