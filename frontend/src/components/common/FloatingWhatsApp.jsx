import { useEffect, useState } from "react";
import settingsService from "../../services/settingsService";
import { whatsappLink } from "../../utils/friendly";

// Sits above BOTH the mobile bottom tab bar and the extra sticky action
// bar that Checkout/Product Details add on top of it, on every page —
// rather than special-case the offset per page, it just always clears
// the tallest possible stack so it can never cover a checkout button.
const FloatingWhatsApp = () => {
  const [number, setNumber] = useState(null);

  useEffect(() => {
    settingsService
      .get()
      .then(({ settings }) => setNumber(settings?.whatsapp?.trim() || null))
      .catch(() => {});
  }, []);

  if (!number) return null;

  return (
    <a
      href={whatsappLink(number)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lift transition-transform duration-150 hover:scale-105 active:scale-95 bottom-[148px] lg:bottom-6 lg:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.01 3C9.38 3 4 8.36 4 14.98c0 2.2.59 4.26 1.6 6.04L4 29l8.2-2.15a12.9 12.9 0 0 0 3.81.58h.01c6.63 0 12-5.36 12-11.98C28.02 8.36 22.65 3 16.01 3Zm0 21.8a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-4.87 1.28 1.3-4.74-.24-.39a9.78 9.78 0 0 1-1.5-5.21c0-5.42 4.42-9.82 9.87-9.82 2.63 0 5.11 1.03 6.97 2.89a9.73 9.73 0 0 1 2.89 6.94c0 5.42-4.43 9.83-9.87 9.83Zm5.4-7.35c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
};

export default FloatingWhatsApp;
