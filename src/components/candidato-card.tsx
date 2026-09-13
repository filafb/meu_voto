"use client";

import { useState } from "react";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoFoto } from "./candidato-foto";
import { CandidatoModal } from "./candidato-modal";

const formatoNumero = new Intl.NumberFormat("pt-BR");

export function CandidatoCard({
  candidato,
  destaque = false,
}: {
  candidato: Candidato;
  destaque?: boolean;
}) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div
      className={`group relative flex flex-col justify-between border p-5 transition-transform hover:-translate-y-0.5 ${
        destaque ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <CandidatoFoto candidato={candidato} dark={destaque} />
        <span
          className={`font-heading text-xs uppercase tracking-widest ${
            destaque ? "text-paper/60" : "text-ink-muted"
          }`}
        >
          nº {candidato.numero}
        </span>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="text-left font-heading text-xl leading-tight underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {candidato.nomeUrna}
        </button>
        <p className={`mt-1 text-sm ${destaque ? "text-paper/70" : "text-ink-muted"}`}>
          {candidato.nome}
        </p>
        {candidato.votos2022 !== null && (
          <p className={`mt-1 text-xs ${destaque ? "text-paper/60" : "text-ink-muted"}`}>
            {formatoNumero.format(candidato.votos2022)} votos em 2022
          </p>
        )}
      </div>

      <div
        className={`mt-5 flex items-center justify-between border-t pt-3 text-xs uppercase tracking-wide ${
          destaque ? "border-paper/20 text-paper/70" : "border-line text-ink-muted"
        }`}
      >
        <span>{candidato.partidoSigla}</span>
        <span>{candidato.cargo === "federal" ? "Dep./a Federal" : "Dep./a Estadual"}</span>
      </div>

      {modalAberto && (
        <CandidatoModal candidato={candidato} onClose={() => setModalAberto(false)} />
      )}
    </div>
  );
}
