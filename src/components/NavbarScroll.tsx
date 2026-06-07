"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "About", id: "about" },
  { label: "Services", id: "services" },
];

function goToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Section isn't on this page — send the visitor to it on the homepage.
    window.location.href = `/#${id}`;
  }
}

export default function NavbarScroll() {
  const [active, setActive] = useState("hero");

  // Scroll-spy: highlight whichever section is currently in view.
  useEffect(() => {
    const sections = ["hero", "about", "services"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Logo — top left */}
      <button
        onClick={() => goToSection("hero")}
        className="fixed top-0 left-0 z-50 px-8 py-6 text-[12px] font-normal tracking-[0.3em] uppercase text-white/80 transition-colors duration-200 hover:text-white cursor-pointer"
      >
        Good<span className="text-[#e065e8]">GTM</span>
      </button>

      {/* Nav links — bottom left */}
      <nav className="fixed bottom-0 left-0 z-50 flex items-center gap-5 px-8 pb-8">
        {links.map((link) => {
          const isActive = active === link.id;
          return (
            <button
              key={link.label}
              onClick={() => goToSection(link.id)}
              className={`text-[10px] font-normal tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer ${
                isActive ? "text-white" : "text-white/50 hover:text-white/90"
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
