import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, MapPin, Clock } from "lucide-react";
import settingsService from "../../services/settingsService";
import BrandLogo from "../common/BrandLogo";

// Contact/pickup details are never hardcoded — they come straight from
// the BusinessSettings the admin manages in Settings, the same source
// Checkout reads from. If settings haven't loaded yet, the relevant
// lines simply don't render rather than showing a fabricated business
// fact.
const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingsService
      .get()
      .then(({ settings: s }) => setSettings(s))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-24 border-t border-berry-500/8 bg-white">
      <div className="mx-auto max-w-content px-6 py-16 lg:px-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo size={64} />
            <p className="mt-2 text-xs font-medium tracking-[0.08em] text-rose-500">
              {(settings?.slogan || "Artistry You Can Taste").toUpperCase()}
            </p>
            {settings?.aboutText && (
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-mauve-500">
                {settings.aboutText}
              </p>
            )}
            {(settings?.socialLinks?.instagram || settings?.socialLinks?.facebook) && (
              <div className="mt-5 flex gap-3">
                {settings.socialLinks.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-icon border border-berry-500/10" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {settings.socialLinks.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="btn-icon border border-berry-500/10" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-berry-500">Shop</h4>
            <ul className="space-y-2.5 text-sm text-mauve-500">
              <li><Link to="/shop" className="hover:text-rose-600">All Products</Link></li>
              <li><Link to="/custom-cake" className="hover:text-rose-600">Custom Cakes</Link></li>
              <li><Link to="/my-orders" className="hover:text-rose-600">Track an Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-berry-500">Account</h4>
            <ul className="space-y-2.5 text-sm text-mauve-500">
              <li><Link to="/login" className="hover:text-rose-600">Log In</Link></li>
              <li><Link to="/register" className="hover:text-rose-600">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-rose-600">My Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-berry-500">Visit &amp; Contact</h4>
            <ul className="space-y-3 text-sm text-mauve-500">
              {settings?.pickup?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  {settings.pickup.address}
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-rose-400" />
                  {settings.phone}
                </li>
              )}
              {settings?.pickup?.hours && (
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-rose-400" />
                  {settings.pickup.hours}
                </li>
              )}
              {!settings && (
                <li className="text-mauve-400">Contact details will appear here soon.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-berry-500/8 pt-6 text-xs text-mauve-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {settings?.businessName || "Bk_Bakers"}. All rights reserved.</p>
          <p>Made fresh, always.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
