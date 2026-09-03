import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden px-10 md:px-20 py-20 text-center"
          style={{
            background:
              "#0c0c0c31",
          }}
        >


          <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-5">
            Get started
          </p>
          <h2 className="text-4xl md:text-[56px] font-semibold tracking-tight text-white leading-tight mb-5 max-w-lg mx-auto">
            Ready to meet your AI Finance Department?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Upload your first document and watch your agents get to work.
            Free to start.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-200 text-black text-sm font-semibold hover:bg-white active:scale-[0.98] transition-all duration-150"
          >
            Start for free
            <span className="text-zinc-400">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
