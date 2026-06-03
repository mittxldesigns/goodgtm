"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Logo — top left */}
      <Link
        href="/"
        className="fixed top-0 left-0 z-50 px-8 py-6 text-[12px] font-normal tracking-[0.3em] uppercase text-white/80 transition-colors duration-200 hover:text-white"
      >
        Good<span className="text-[#e065e8]">GTM</span>
      </Link>

      {/* Nav links — bottom left */}
      <nav className="fixed bottom-0 left-0 z-50 flex items-center gap-5 px-8 pb-8">
        {links.map((link) => {
          const isActive = pathname === link.href;
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
      </nav>
    </>
  );
}
