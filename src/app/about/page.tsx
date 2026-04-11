import PageShell from "@/components/PageShell";

const CALENDLY_URL = "https://calendly.com/nate-goodgtm/30min";

export default function AboutPage() {
  return (
    <PageShell>
      <div className="space-y-12">
        <div className="space-y-6">
          <h2 className="text-[11px] font-normal tracking-[0.25em] uppercase text-white/50">
            What We Do
          </h2>
          <p className="text-[15px] font-light leading-relaxed text-white/80">
            GoodGTM builds go-to-market infrastructure for startups. We help
            teams find, reach, and convert their best customers &mdash; at 1/4
            the cost of traditional infrastructure.
          </p>
          <p className="text-[14px] font-light leading-relaxed text-white/60">
            Your AEs just need to show up and rizz.
          </p>
        </div>

        <div className="flex gap-6 pt-2">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 border border-white/20 text-[11px] font-normal tracking-[0.2em] uppercase text-white/80 transition-all duration-200 hover:border-[#fa76ff]/50 hover:text-[#fa76ff] hover:bg-[#fa76ff]/5"
          >
            Book a Call
          </a>
        </div>
      </div>
    </PageShell>
  );
}
