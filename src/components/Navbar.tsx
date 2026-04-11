"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CALENDLY_URL = "https://calendly.com/nate-goodgtm/30min";

const links = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: CALENDLY_URL, external: true },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
      {/* Logo — links home */}
      <Link
        href="/"
        className="text-[12px] font-normal tracking-[0.3em] uppercase text-white/80 transition-colors duration-200 hover:text-white"
      >
        Good<span className="text-[#e065e8]">GTM</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = !link.external && pathname === link.href;
          const isContact = link.external;

          if (isContact) {
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-normal tracking-[0.2em] uppercase px-4 py-1.5 border border-[#e065e8]/40 text-[#e065e8]/80 transition-all duration-200 hover:bg-[#e065e8]/10 hover:border-[#e065e8]/70 hover:text-[#e065e8]"
              >
                {link.label}
              </a>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[10px] font-normal tracking-[0.2em] uppercase transition-colors duration-200 ${
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/90"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
