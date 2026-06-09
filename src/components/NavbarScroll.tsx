"use client";

function goToHero() {
  const el = document.getElementById("hero");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.href = "/#hero";
}

// Persistent brand mark, top-left. The About/Services nav and the NYC label
// used to live here too, but Nate wants those to be hero-only — they now render
// inside the hero section (page.tsx) so they scroll away with it. Only the logo
// persists across sections.
export default function NavbarScroll() {
  return (
    <button
      onClick={goToHero}
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)",
        paddingLeft: "calc(env(safe-area-inset-left) + 2rem)",
        paddingBottom: "1.5rem",
        paddingRight: "2rem",
      }}
      className="fixed top-0 left-0 z-50 text-[12px] font-normal tracking-[0.3em] uppercase text-white/80 transition-colors duration-200 hover:text-white cursor-pointer"
    >
      Good<span className="text-[#e065e8]">GTM</span>
    </button>
  );
}
