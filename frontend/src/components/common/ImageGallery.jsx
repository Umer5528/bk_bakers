import { useRef, useState } from "react";

// Large, swipeable photography on mobile (real horizontal swipe via
// native scroll-snap, not just a static image) with a thumbnail strip
// on larger screens where hover/click is the natural interaction.
const ImageGallery = ({ images = [], alt }) => {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef(null);

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl3 bg-gradient-to-br from-blush-100 to-peach-100 text-7xl">
        🍰
      </div>
    );
  }

  const goTo = (idx) => {
    setActive(idx);
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="scrollbar-none flex aspect-square w-full snap-x snap-mandatory overflow-x-auto rounded-xl3 bg-blush-50 sm:aspect-[4/5]"
        >
          {images.map((img, idx) => (
            <img
              key={img._id || idx}
              src={img.url}
              alt={`${alt} ${idx + 1}`}
              className="h-full w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  active === idx ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 hidden gap-2 sm:flex">
          {images.map((img, idx) => (
            <button
              key={img._id || idx}
              onClick={() => goTo(idx)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                active === idx ? "border-rose-400" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt={`${alt} ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
