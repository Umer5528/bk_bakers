import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Cake as CakeIcon,
  FolderTree,
  Sparkles,
  Star,
  Image,
  Users,
  CreditCard,
  Clock,
  CalendarX,
  Settings,
  LogOut,
  MoreHorizontal,
  X,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import adminService from "../services/adminService";
import BrandLogo from "../components/common/BrandLogo";

// Plain-language names, grouped by what the owner is trying to do.
const groups = [
  {
    title: "Every day",
    items: [
      { label: "Home", to: "/admin", icon: Home },
      { label: "Orders", to: "/admin/orders", icon: ShoppingBag, badgeKey: "pendingPaymentVerification" },
      { label: "Custom Cake Requests", to: "/admin/custom-requests", icon: Sparkles, badgeKey: "pendingCustomRequests" },
    ],
  },
  {
    title: "What you sell",
    items: [
      { label: "Cakes & Items", to: "/admin/products", icon: CakeIcon },
      { label: "Menu Sections", to: "/admin/categories", icon: FolderTree },
      { label: "Photo Gallery", to: "/admin/gallery", icon: Image },
    ],
  },
  {
    title: "Your customers",
    items: [
      { label: "Customers", to: "/admin/customers", icon: Users },
      { label: "Reviews", to: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Shop setup",
    items: [
      { label: "How Customers Pay", to: "/admin/payment-accounts", icon: CreditCard },
      { label: "Delivery & Pickup Times", to: "/admin/time-slots", icon: Clock },
      { label: "Days Off", to: "/admin/availability", icon: CalendarX },
      { label: "Shop Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

const allLinks = groups.flatMap((g) => g.items);

const linkClass = (collapsed) => ({ isActive }) =>
  `touch-target relative flex items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors ${
    collapsed ? "justify-center" : ""
  } ${isActive ? "bg-blush-100 text-berry-500" : "text-mauve-500 hover:bg-blush-50 hover:text-berry-500"}`;

const NavGroups = ({ badges, collapsed, onNavigate }) => (
  <nav className="space-y-5">
    {groups.map((group) => (
      <div key={group.title}>
        {!collapsed && (
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-mauve-400">
            {group.title}
          </p>
        )}
        <div className="space-y-0.5">
          {group.items.map(({ label, to, icon: Icon, badgeKey }) => {
            const count = badgeKey ? badges[badgeKey] : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                className={linkClass(collapsed)}
              >
                <Icon className="h-[19px] w-[19px] shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
                {count > 0 &&
                  (collapsed ? (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                  ) : (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {count}
                    </span>
                  ))}
              </NavLink>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
);

const useAdminPageTitle = () => {
  const { pathname } = useLocation();
  const match = allLinks.find((l) => l.to === pathname);
  if (match) return match.label;
  if (pathname.startsWith("/admin/orders/")) return "Order Details";
  return "Admin";
};

// The four things she'll use most, always one tap away on a phone.
const tabs = [
  { label: "Home", to: "/admin", icon: Home, end: true },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag, badgeKey: "pendingPaymentVerification" },
  { label: "Cakes", to: "/admin/products", icon: CakeIcon },
];

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState({});
  const pageTitle = useAdminPageTitle();
  const { pathname } = useLocation();

  useEffect(() => setMoreOpen(false), [pathname]);

  useEffect(() => {
    const poll = () => {
      adminService
        .getStats()
        .then(({ stats }) =>
          setBadges({
            pendingPaymentVerification: stats.pendingPaymentVerification,
            pendingCustomRequests: stats.pendingCustomRequests,
          })
        )
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-cream-200">
      {/* ---------- Desktop sidebar ---------- */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-berry-500/8 bg-white py-5 transition-all duration-200 md:flex ${
          collapsed ? "w-[76px] px-2.5" : "w-64 px-4"
        }`}
      >
        <div className={`mb-5 flex items-center gap-2.5 ${collapsed ? "justify-center" : "px-2"}`}>
          <BrandLogo size={collapsed ? 34 : 40} />
          {!collapsed && <span className="font-display text-lg font-semibold leading-tight text-berry-500">My Bakery</span>}
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5">
          <NavGroups badges={badges} collapsed={collapsed} />
        </div>

        <div className="mt-3 border-t border-berry-500/8 pt-3">
          <Link
            to="/"
            target="_blank"
            title={collapsed ? "View my website" : undefined}
            className={`touch-target flex items-center gap-2 rounded-xl px-3 text-sm font-medium text-mauve-500 hover:bg-blush-50 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <ExternalLink className="h-4 w-4" /> {!collapsed && "View my website"}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="touch-target flex w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-mauve-400 hover:bg-blush-50"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Make menu smaller</>}
          </button>
          {!collapsed && (
            <p className="mt-2 truncate px-3 text-xs text-mauve-400">
              Signed in as {user?.name}
              {user?.role === "superadmin" && " (Developer)"}
            </p>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={`touch-target mt-1 flex w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-mauve-500 hover:bg-blush-50 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4" /> {!collapsed && "Log out"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ---------- Mobile top bar ---------- */}
        <header className="pt-safe sticky top-0 z-30 flex items-center justify-between border-b border-berry-500/8 bg-white px-4 py-3 md:hidden">
          <h1 className="font-display text-xl font-semibold text-berry-500">{pageTitle}</h1>
          <BrandLogo size={32} />
        </header>

        {/* ---------- Desktop title bar ---------- */}
        <div className="hidden border-b border-berry-500/8 bg-white px-6 py-4 md:block lg:px-8">
          <h1 className="font-display text-2xl font-semibold text-berry-500">{pageTitle}</h1>
        </div>

        <main className="p-4 pb-28 sm:p-6 md:pb-10 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* ---------- Mobile bottom bar ---------- */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-berry-500/8 bg-white md:hidden" aria-label="Main">
        <div className="mx-auto flex max-w-md">
          {tabs.map(({ label, to, icon: Icon, end, badgeKey }) => {
            const count = badgeKey ? badges[badgeKey] : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                    isActive ? "text-rose-600" : "text-mauve-400"
                  }`
                }
              >
                <Icon className="h-6 w-6" />
                {label}
                {count > 0 && (
                  <span className="absolute right-[26%] top-1.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold leading-4 text-white">
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-mauve-400"
          >
            <MoreHorizontal className="h-6 w-6" />
            More
            {badges.pendingCustomRequests > 0 && (
              <span className="absolute right-[30%] top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
            )}
          </button>
        </div>
      </nav>

      {/* ---------- Mobile "More" sheet ---------- */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-berry-800/50" onClick={() => setMoreOpen(false)} />
          <div className="pb-safe absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl3 bg-white p-5 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-berry-500">Everything</h2>
              <button onClick={() => setMoreOpen(false)} className="btn-icon touch-target" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavGroups badges={badges} collapsed={false} onNavigate={() => setMoreOpen(false)} />
            <div className="mt-5 space-y-1 border-t border-berry-500/8 pt-3">
              <Link
                to="/"
                target="_blank"
                className="touch-target flex items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-mauve-500"
              >
                <ExternalLink className="h-[19px] w-[19px]" /> View my website
              </Link>
              <button
                onClick={handleLogout}
                className="touch-target flex w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-mauve-500"
              >
                <LogOut className="h-[19px] w-[19px]" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
