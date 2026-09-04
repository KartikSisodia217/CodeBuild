const STEPS = [
  {
    number: "01",
    title: "Upload your data",
    description:
      "Drop in receipts, invoices, bank statements, or CSVs. Any format. Any volume. No manual prep required.",
  },
  {
    number: "02",
    title: "Agents collaborate",
    description:
      "Your AI Finance Department gets to work — classifying, reconciling, and analyzing in the Glass Box.",
  },
  {
    number: "03",
    title: "Get financial clarity",
    description:
      "Instant reports, plain-English answers to any question, and a complete picture of your financial health.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-4">
            The Process
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
            How it works
          </h2>
        </div>

        {/* Steps — separated by 1px bg-white/5 dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.09] rounded-2xl overflow-hidden">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-[#080808]/[0.8] p-10 hover:bg-black/[0.45] transition-colors duration-300 group"
            >
              <span className="text-5xl font-semibold text-zinc-800 group-hover:text-zinc-700 transition-colors duration-300 block mb-8">
                {step.number}
              </span>
              <h3 className="text-base font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
