import { Clock3, Sparkles } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";

function Maintenance() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-100 px-5 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-peach-200/50 blur-3xl"
      />

      <section className="relative w-full max-w-xl rounded-[2rem] border border-berry-500/10 bg-white/90 px-7 py-12 text-center shadow-card backdrop-blur-sm sm:px-14 sm:py-16">
        <div className="mb-8 flex justify-center">
          <BrandLogo size={72} />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-berry-500">
          <Clock3 aria-hidden="true" size={15} />
          <span>Website Deleted</span>
        </div>

        <div className="mb-3 flex items-center justify-center gap-2 text-rose-600">
          <Sparkles aria-hidden="true" size={18} />
          <span className="text-sm font-medium">Contact the Developer</span>
          <Sparkles aria-hidden="true" size={18} />
        </div>

        <h1 className="mb-4 text-4xl leading-tight text-berry-500 sm:text-5xl">
          JazakAllah
        </h1>

        <div className="mx-auto mt-9 h-px w-16 bg-rose-300" />
        <p className="mt-5 text-xs font-medium tracking-wide text-berry-400">
          BK_BAKERS <span aria-hidden="true">&middot;</span> Artistry You Can
          Taste
        </p>
      </section>
    </main>
  );
}

export default Maintenance;
