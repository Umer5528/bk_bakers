import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import settingsService from "../../services/settingsService";
import { whatsappLink } from "../../utils/friendly";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const CustomCake = () => {
  useDocumentTitle("Custom Cake Order");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    settingsService
      .get()
      .then(({ settings }) => {
        const number = settings?.whatsapp?.trim();
        if (!number) {
          throw new Error("The baker's WhatsApp number is not configured.");
        }

        const url = `${whatsappLink(number)}?text=${encodeURIComponent(
          "Hi! I'd like to ask about ordering a custom cake."
        )}`;
        if (active) {
          setWhatsappUrl(url);
          window.location.assign(url);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "We couldn't connect to the baker's WhatsApp. Please try again later."
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
        <MessageCircle aria-hidden="true" className="h-8 w-8" />
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold text-berry-500">
        Custom Cake Orders
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mauve-500">
        {error || "Taking you to WhatsApp to discuss your custom cake with the baker..."}
      </p>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          className="btn-primary mt-6 bg-[#25D366] hover:bg-[#1fb95a]"
        >
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
          Continue to WhatsApp
        </a>
      )}
    </div>
  );
};

export default CustomCake;
