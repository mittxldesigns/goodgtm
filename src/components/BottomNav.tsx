"use client";

import Link from "next/link";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-between px-10 pb-8">
      {/* Navigation Links */}
      <nav className="flex items-center gap-3 text-[12px] font-normal tracking-[0.18em] uppercase">
        <Link
          href="/about"
          className="text-white/80 transition-colors duration-200 hover:text-[#fa76ff]"
          style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
        >
          About
        </Link>
        <span className="text-white/30 mx-0.5">&middot;</span>
        <Link
          href="/services"
          className="text-white/80 transition-colors duration-200 hover:text-[#fa76ff]"
          style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
        >
          Services
        </Link>
        <span className="text-white/30 mx-0.5">&middot;</span>
        <a
          href="mailto:nate@goodgtm.com"
          className="text-white/80 transition-colors duration-200 hover:text-[#fa76ff]"
          style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
        >
          Contact
        </a>
      </nav>

      {/* Location */}
      <span
        className="text-[11px] font-light tracking-[0.18em] uppercase text-white/60"
        style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
      >
        Florida
      </span>
    </div>
  );
}
