"use client";

import { useMemo, useState } from "react";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoCard } from "./candidato-card";

type FederacaoInfo = {
  nr: number;
  sigla: string | null;
  nome: string | null;
  composicao: string | null;
};

export function FederacaoResult({
  candidato,
  federacao,
  membros,
}: {
  candidato: Candidato;
  federacao: FederacaoInfo | null;
  membros: Candidato[];
}) {
  const [filtro, setFiltro] = useState("");

  const filtrados = useMemo(() => {
    const outros = membros.filter((m) => m.sq !== candidato.sq);
    if (!filtro.trim()) return outros;
    const q = filtro.toLowerCase();
    return outros.filter(
      (m) => m.nomeUrna.toLowerCase().includes(q) || m.partidoSigla.toLowerCase().includes(q)
    );
  }, [membros, filtro, candidato.sq]);

  return (
    <section className="border border-line bg-paper">
      <header className="flex flex-col gap-4 border-b border-line p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            {candidato.cargo === "federal" ? "Deputada/o Federal" : "Deputada/o Estadual"} ·{" "}
            {candidato.uf}
          </p>
          <h2 className="mt-1 font-heading text-2xl">
            {federacao ? federacao.nome : "Sem federação"}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {federacao
              ? `Composição: ${federacao.composicao}`
              : `${candidato.partidoNome} (${candidato.partidoSigla}) concorre isoladamente, sem federação partidária.`}
          </p>
        </div>
        <p className="font-heading text-sm text-ink-muted">
          {membros.length > 0 ? `${membros.length} candidatas/os` : ""}
        </p>
      </header>

      <div className="p-6">
        <div className="mb-4">
          <CandidatoCard candidato={candidato} destaque />
        </div>

        {federacao && (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-heading text-sm uppercase tracking-widest text-ink-muted">
                Demais candidatas/os da federação em {candidato.uf}
              </h3>
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="filtrar por nome ou partido"
                className="border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-ink"
              />
            </div>

            {filtrados.length === 0 ? (
              <p className="text-sm text-ink-muted">Nenhuma outra candidata/o encontrada/o.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtrados.map((m) => (
                  <CandidatoCard key={m.sq} candidato={m} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
