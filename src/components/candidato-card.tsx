import type { Candidato } from "@/lib/candidatos";

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function CandidatoCard({
  candidato,
  destaque = false,
}: {
  candidato: Candidato;
  destaque?: boolean;
}) {
  return (
    <div
      className={`group relative flex flex-col justify-between border p-5 transition-transform hover:-translate-y-0.5 ${
        destaque ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center border font-heading text-sm ${
            destaque ? "border-paper/40 text-paper" : "border-ink/20 text-ink"
          }`}
        >
          {initials(candidato.nomeUrna)}
        </div>
        <span
          className={`font-heading text-xs uppercase tracking-widest ${
            destaque ? "text-paper/60" : "text-ink-muted"
          }`}
        >
          nº {candidato.numero}
        </span>
      </div>

      <div className="mt-6">
        <p className="font-heading text-xl leading-tight">{candidato.nomeUrna}</p>
        <p className={`mt-1 text-sm ${destaque ? "text-paper/70" : "text-ink-muted"}`}>
          {candidato.nome}
        </p>
      </div>

      <div
        className={`mt-5 flex items-center justify-between border-t pt-3 text-xs uppercase tracking-wide ${
          destaque ? "border-paper/20 text-paper/70" : "border-line text-ink-muted"
        }`}
      >
        <span>{candidato.partidoSigla}</span>
        <span>{candidato.cargo === "federal" ? "Dep. Federal" : "Dep. Estadual"}</span>
      </div>
    </div>
  );
}
