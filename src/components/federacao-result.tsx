"use client";

import { useMemo, useState } from "react";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoCard } from "./candidato-card";

export type Grupo = {
  tipo: "federacao" | "partido";
  nome: string | null;
  sigla: string | null;
  composicao: string | null;
};

export function FederacaoResult({
  candidato,
  grupo,
  membros,
}: {
  candidato: Candidato;
  grupo: Grupo;
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

  const ehFederacao = grupo.tipo === "federacao";

  return (
    <section className="border border-line bg-paper">
      <header className="flex flex-col gap-4 border-b border-line p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            {candidato.cargo === "federal" ? "Deputada/o Federal" : "Deputada/o Estadual"} ·{" "}
            {candidato.uf}
          </p>
          <h2 className="mt-1 font-heading text-2xl">{grupo.nome}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {ehFederacao
              ? `Federação partidária · composição: ${grupo.composicao}`
              : `Partido sem federação — mostrando as/os demais candidatas/os do próprio partido (${grupo.sigla}) em ${candidato.uf}.`}
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

        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-heading text-sm uppercase tracking-widest text-ink-muted">
            {ehFederacao ? "Demais candidatas/os da federação" : "Demais candidatas/os do partido"}{" "}
            em {candidato.uf}
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
      </div>
    </section>
  );
}
