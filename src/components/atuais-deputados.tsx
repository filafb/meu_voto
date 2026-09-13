import type { DeputadoAtual } from "@/lib/candidatos";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

export function AtuaisDeputados({ atuais }: { atuais: DeputadoAtual[] }) {
  if (atuais.length === 0) return null;

  return (
    <div className="border-t border-line p-6">
      <h3 className="font-heading text-sm uppercase tracking-widest text-ink-muted">
        Quem os partidos da federação já elegeram
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Estas/es são as/os deputadas/os atuais (eleitas/os em 2022) pelos partidos da federação,
        no mesmo cargo e estado — vale conferir se você concorda com o mandato delas/es antes de
        votar em alguém da mesma federação.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {atuais.map((d) => (
          <div
            key={d.sq}
            className="flex items-center gap-3 border border-line bg-card p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/20 font-heading text-xs">
              {iniciais(d.nomeUrna)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm leading-tight">{d.nomeUrna}</p>
              <p className="text-xs text-ink-muted">{d.partidoSigla}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
