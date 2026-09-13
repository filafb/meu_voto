import type { DeputadoAtual } from "@/lib/candidatos";

const formatoNumero = new Intl.NumberFormat("pt-BR");

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

export function AtuaisDeputados({
  atuais,
  ehFederacao,
}: {
  atuais: DeputadoAtual[];
  ehFederacao: boolean;
}) {
  if (atuais.length === 0) return null;

  return (
    <div className="border-y-2 border-ink bg-card p-6">
      <h3 className="font-heading text-lg">
        Quem {ehFederacao ? "os partidos da federação" : "esse partido"} já{" "}
        {ehFederacao ? "elegeram" : "elegeu"}
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Estas/es são as/os deputadas/os atuais (eleitas/os em 2022) por{" "}
        {ehFederacao ? "esses partidos" : "esse partido"}, no mesmo cargo e estado — vale conferir
        se você concorda com o mandato delas/es antes de votar em alguém{" "}
        {ehFederacao ? "da mesma federação" : "do mesmo partido"}.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {atuais.map((d) => (
          <div key={d.sq} className="flex items-center gap-3 border border-ink/20 bg-paper p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/20 font-heading text-xs">
              {iniciais(d.nomeUrna)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm leading-tight">{d.nomeUrna}</p>
              <p className="text-xs text-ink-muted">
                {d.partidoSigla}
                {d.votos2022 !== null && ` · ${formatoNumero.format(d.votos2022)} votos em 2022`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
