export default function AboutSection() {
  return (
    <div className="relative z-30 flex min-h-[100svh] w-full items-center justify-center px-6 md:px-10 py-20">
      <div className="max-w-2xl w-full">
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
            At full capacity &mdash; but DM on{" "}
            <a
              href="https://www.linkedin.com/in/nate-pratt-70078831b/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fa76ff] underline underline-offset-4 decoration-[#fa76ff]/40 hover:decoration-[#fa76ff] transition-colors duration-200"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
