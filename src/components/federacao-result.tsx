"use client";

import { useMemo, useState } from "react";
import type { Candidato, DeputadoAtual } from "@/lib/candidatos";
import { CandidatoCard } from "./candidato-card";
import { PartidoBadge } from "./partido-badge";
import { AtuaisDeputados } from "./atuais-deputados";

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
  atuais,
}: {
  candidato: Candidato;
  grupo: Grupo;
  membros: Candidato[];
  atuais: DeputadoAtual[];
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
  const partidosDaFederacao = ehFederacao
    ? (grupo.composicao ?? "").split("/").map((s) => s.trim()).filter(Boolean)
    : [];

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
              ? "Federação partidária"
              : `Partido sem federação — mostrando as/os demais candidatas/os do próprio partido (${grupo.sigla}) em ${candidato.uf}.`}
          </p>
          {partidosDaFederacao.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {partidosDaFederacao.map((sigla) => (
                <PartidoBadge key={sigla} sigla={sigla} />
              ))}
            </div>
          )}
        </div>
        <p className="font-heading text-sm text-ink-muted">
          {membros.length > 0 ? `${membros.length} candidatas/os` : ""}
        </p>
      </header>

      <div className="p-6">
        <CandidatoCard candidato={candidato} destaque />
      </div>

      <AtuaisDeputados atuais={atuais} ehFederacao={ehFederacao} />

      <div className="p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h3 className="font-heading text-sm uppercase tracking-widest text-ink-muted">
            {ehFederacao ? "Demais candidatas/os da federação" : "Demais candidatas/os do partido"}{" "}
            em {candidato.uf}
          </h3>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="filtrar por nome ou partido"
            className="w-full border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-ink sm:w-64"
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
