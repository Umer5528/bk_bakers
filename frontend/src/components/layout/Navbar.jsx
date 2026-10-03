import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, User, LogOut, ChevronDown, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../common/BrandLogo";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Custom Cakes", to: "/custom-cake" },
  { label: "My Orders", to: "/my-orders" },
];

// A premium blush/rose capsule linking straight into the Admin Panel.
// This is a navigation convenience only — real authorization is (and
// must stay) enforced by AdminRoute on the frontend and the backend's
// authorize("admin") middleware on every admin API call.
const AdminPanelCapsule = ({ onClick, className = "" }) => (
  <Link
    to="/admin"
    onClick={onClick}
    className={`touch-target flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-card ${className}`}
  >
    <LayoutDashboard className="h-4 w-4" />
    Admin Panel
  </Link>
);

// The desktop header carries the full brand presence; on mobile it
// collapses to a compact top bar with a hamburger menu for navigation,
// account actions, and (for admins) the Admin Panel capsule — the
// bottom tab bar (MobileTabBar) covers the four most common taps, this
// menu covers everything else, including account/logout.
const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation so it never lingers over the
  // next page or blocks scrolling.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    setAccountOpen(false);
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
    setSearchValue("");
  };

  return (
    <header className="sticky top-0 z-40 pt-safe border-b border-berry-500/8 bg-cream-100/90 backdrop-blur-md">
      {/* --- Mobile top bar --- */}
      <div className="flex items-center justify-between px-4 py-3.5 md:hidden">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="btn-icon touch-target -ml-2"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to="/" aria-label="Bk_Bakers home">
          <BrandLogo size={36} />
        </Link>
        <button
          onClick={() => setSearchOpen((s) => !s)}
          className="btn-icon touch-target -mr-2"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-berry-500/8 px-4 py-3 md:hidden">
          <input
            autoFocus
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search cakes, treats..."
            className="input-field"
          />
        </form>
      )}

      {/* --- Mobile hamburger menu --- */}
      {menuOpen && (
        <div className="border-t border-berry-500/8 bg-white px-4 py-4 md:hidden">
          {isAdmin && (
            <AdminPanelCapsule onClick={() => setMenuOpen(false)} className="mb-3 w-full justify-center" />
          )}

          <nav className="space-y-0.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `touch-target flex items-center rounded-xl px-3 text-[15px] font-medium ${
                    isActive ? "bg-blush-100 text-rose-600" : "text-berry-600 hover:bg-blush-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 border-t border-berry-500/8 pt-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="touch-target flex items-center gap-2.5 rounded-xl px-3 text-[15px] font-medium text-berry-600 hover:bg-blush-50"
                >
                  <User className="h-[18px] w-[18px]" /> My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="touch-target flex w-full items-center gap-2.5 rounded-xl px-3 text-[15px] font-medium text-mauve-500 hover:bg-blush-50"
                >
                  <LogOut className="h-[18px] w-[18px]" /> Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-2.5 px-1 pt-1">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary touch-target flex-1 justify-center">
                  Log In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary touch-target flex-1 justify-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Desktop header --- */}
      <nav className="mx-auto hidden max-w-content items-center gap-8 px-6 py-4 lg:px-10 md:flex">
        <Link to="/" className="flex items-center gap-3" aria-label="Bk_Bakers home">
          <BrandLogo size={52} />
          <span className="hidden text-[10px] font-medium tracking-[0.1em] text-mauve-400 lg:block">
            ARTISTRY
            <br />
            YOU CAN TASTE
          </span>
        </Link>

        <div className="flex flex-1 items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[14.5px] font-medium text-berry-600/80 transition-colors hover:text-rose-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative w-56">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-400" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-full border border-berry-500/10 bg-white py-2 pl-9 pr-3 text-sm
              placeholder:text-mauve-400 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
          />
        </form>

        {isAdmin && <AdminPanelCapsule />}

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium text-berry-600 hover:bg-blush-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-300 text-xs font-semibold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </span>
              {user?.name?.split(" ")[0]}
              <ChevronDown className="h-3.5 w-3.5 text-mauve-400" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-berry-500/8 bg-white py-1.5 shadow-card">
                <Link
                  to="/profile"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-berry-600 hover:bg-blush-50"
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-berry-600 hover:bg-blush-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn-ghost">
              Log In
            </Link>
            <Link to="/register" className="btn-primary !px-5 !py-2.5 text-[13.5px]">
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
