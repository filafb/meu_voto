"use client";

import { useEffect, useState } from "react";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoCard } from "./candidato-card";
import { PartidoBadge } from "./partido-badge";
import { FederacaoModal } from "./federacao-modal";

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
  const [modalAberto, setModalAberto] = useState(false);

  // Abre o modal automaticamente assim que o resultado chega (logo após "Confirmar").
  useEffect(() => {
    setModalAberto(true);
  }, [candidato.sq]);

  const ehFederacao = grupo.tipo === "federacao";
  const partidosDaFederacao = ehFederacao
    ? (grupo.composicao ?? "").split("/").map((s) => s.trim()).filter(Boolean)
    : [];
  const outrosCount = membros.filter((m) => m.sq !== candidato.sq).length;

  return (
    <section className="border border-line bg-paper">
      <header className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
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

        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="shrink-0 border border-ink bg-ink px-6 py-3 font-heading text-sm uppercase tracking-widest text-paper hover:opacity-90"
        >
          Ver {outrosCount > 0 ? `${outrosCount} candidatas/os` : "candidata/o"}
        </button>
      </header>

      <div className="border-t border-line p-6">
        <CandidatoCard candidato={candidato} destaque />
      </div>

      {modalAberto && (
        <FederacaoModal
          candidato={candidato}
          grupo={grupo}
          membros={membros}
          onClose={() => setModalAberto(false)}
        />
      )}
    </section>
  );
}
