const services = [
  {
    title: "TAM Enrichment",
    description:
      "We know more about your prospects than they know about themselves. Your AEs just need to show up and rizz.",
  },
  {
    title: "Automated Outbound",
    description:
      "Every touchpoint systemized and automated at 1/4 the cost of traditional infrastructure. Your AEs just need to show up.",
  },
  {
    title: "Custom Signal Monitoring",
    description:
      "Custom signals across your entire TAM. The moment they're ready, you're ready.",
  },
];

export default function ServicesSection() {
  return (
    <div className="relative z-30 flex min-h-[100svh] w-full items-center justify-center px-6 md:px-10 py-20">
      <div className="max-w-2xl w-full">
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
            {services.map((svc, i) => (
              <div
                key={svc.title}
                className="border-t border-white/10 py-5 md:py-6 group"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-[11px] font-light text-[#fa76ff]/40 tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-[14px] font-medium tracking-wide text-white/90 group-hover:text-[#fa76ff] transition-colors duration-200">
                      {svc.title}
                    </h3>
                    <p className="mt-2 text-[12px] font-light text-white/55 leading-relaxed max-w-md">
                      {svc.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
