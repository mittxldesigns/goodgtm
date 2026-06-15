const services = [
  "TAM Enrichment",
  "Automated Outbound",
  "Custom Signal Monitoring",
  "& everything else",
];

// Content-only block — rendered inside the "Services" black popup (SectionModal).
export default function ServicesSection() {
  return (
    <div className="space-y-8 md:space-y-10">
      <div className="space-y-4">
        <h2 className="text-[11px] font-normal tracking-[0.25em] uppercase text-white/50">
          Services
        </h2>
        <p className="text-[15px] font-light leading-relaxed text-white/80 max-w-md">
          Go-to-market infrastructure that scales with you.
        </p>
      </div>

      <div className="space-y-0">
        {services.map((title, i) => (
          <div key={title} className="border-t border-white/10 py-4 md:py-5 group">
            <div className="flex items-baseline gap-4">
              <span className="text-[11px] font-light text-[#fa76ff]/40 tabular-nums">
                0{i + 1}
              </span>
              <h3 className="text-[14px] font-medium tracking-wide text-white/90 group-hover:text-[#fa76ff] transition-colors duration-200">
                {title}
              </h3>
            </div>
          </div>
        ))}
        <div className="border-t border-white/10" />
      </div>
    </div>
  );
}
