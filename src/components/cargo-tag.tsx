import type { Cargo } from "@/lib/candidatos";

export function CargoTag({ cargo, dark = false }: { cargo: Cargo; dark?: boolean }) {
  return (
    <span
      className={`shrink-0 border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        dark ? "border-paper/40 text-paper/80" : "border-ink/30 text-ink-muted"
      }`}
    >
      {cargo === "federal" ? "Federal" : "Estadual"}
    </span>
  );
}
