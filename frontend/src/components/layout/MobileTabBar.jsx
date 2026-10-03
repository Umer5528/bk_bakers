import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, Sparkles, Receipt, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// A real bottom tab bar, not a shrunk desktop nav — this is what makes
// the storefront read as a native shopping app on a phone rather than a
// website viewed on a phone. Fixed, safe-area aware, and always shows
// exactly which section is active.
const tabs = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Shop", to: "/shop", icon: LayoutGrid },
  { label: "Custom", to: "/custom-cake", icon: Sparkles },
  { label: "Orders", to: "/my-orders", icon: Receipt },
];

const MobileTabBar = () => {
  const { isAuthenticated } = useAuth();

  const accountTab = {
    label: isAuthenticated ? "Account" : "Sign In",
    to: isAuthenticated ? "/profile" : "/login",
    icon: User,
  };

  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-berry-500/8 bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {[...tabs, accountTab].map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? "text-rose-600" : "text-mauve-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-blush-100" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileTabBar;
