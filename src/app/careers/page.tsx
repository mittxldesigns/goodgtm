import PageShell from "@/components/PageShell";

const positions = [
  { title: "Founding Engineer", comp: "$200K – $350K", type: "Full-time" },
  { title: "Growth Lead", comp: "$150K – $250K", type: "Full-time" },
  { title: "Product Designer", comp: "$160K – $280K", type: "Full-time" },
  { title: "GTM Strategist", comp: "$130K – $200K", type: "Full-time" },
  { title: "Open Application", comp: "$120K – $350K", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-[11px] font-light tracking-[0.2em] uppercase text-white/40">
            Careers
          </h2>
          <p className="text-[15px] font-light leading-relaxed text-white/70 max-w-md">
            We&apos;re building a team of exceptional operators to redefine how
            companies go to market.
          </p>
        </div>

        <div className="space-y-0">
          {positions.map((pos) => (
            <a
              key={pos.title}
              href="https://calendly.com/nate-goodgtm/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border-t border-white/10 py-4 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <div>
                <h3 className="text-[13px] font-medium tracking-wide text-white/80 group-hover:text-white transition-colors duration-200">
                  {pos.title}
                </h3>
                <p className="text-[11px] font-light text-white/30 mt-0.5">
                  {pos.type}
                </p>
              </div>
              <span className="text-[11px] font-light tracking-wide text-white/30 group-hover:text-white/60 transition-colors duration-200">
                {pos.comp}
              </span>
            </a>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </PageShell>
  );
}
