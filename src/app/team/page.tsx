import PageShell from "@/components/PageShell";

const team = [
  { name: "Nate Johnson", role: "CEO & Founder" },
  { name: "Sarah Chen", role: "CTO" },
  { name: "Marcus Rivera", role: "Head of Growth" },
  { name: "Aisha Patel", role: "Head of Product" },
];

export default function TeamPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <h2 className="text-[11px] font-light tracking-[0.2em] uppercase text-white/40">
          Team
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {team.map((member) => (
            <div key={member.name} className="space-y-3">
              {/* Dithered avatar placeholder */}
              <div className="w-20 h-20 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-[20px] font-light text-white/20">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <h3 className="text-[13px] font-medium tracking-wide text-white/90">
                  {member.name}
                </h3>
                <p className="text-[11px] font-light text-white/40 mt-0.5">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
