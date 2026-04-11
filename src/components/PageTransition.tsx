"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(0);
  const [wipe, setWipe] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on route change
    setAnimKey((k) => k + 1);
    setWipe(true);
    const t = setTimeout(() => setWipe(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <div
        key={animKey}
        style={{ animation: "pageIn 0.4s ease-out both" }}
      >
        {children}
      </div>

      {/* Magenta scan line wipe */}
      {wipe && (
        <div
          className="fixed inset-0 z-[55] pointer-events-none"
          style={{ animation: "wipeLine 0.5s cubic-bezier(0.7, 0, 0.3, 1) both" }}
        />
      )}

      <style jsx global>{`
        @keyframes pageIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes wipeLine {
          0% {
            background: linear-gradient(180deg, transparent 0%, #e065e840 0%, #e065e860 0.5%, #e065e840 1%, transparent 1%);
          }
          100% {
            background: linear-gradient(180deg, transparent 99%, #e065e840 99%, #e065e860 99.5%, #e065e840 100%, transparent 100%);
          }
        }
      `}</style>
    </>
  );
}
