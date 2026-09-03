
const FOOTER_LINKS = [
  { label: "About Us", href: "/about-us" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="logo.png" alt="Logo" height={30} width={30} />
          <span className="text-[15px] font-semibold tracking-tight text-white leading-none">
            LedgerAI
          </span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-zinc-700">
          © {new Date().getFullYear()} LedgerAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
