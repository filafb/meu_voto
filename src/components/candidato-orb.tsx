"use client";

import { useState } from "react";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoFoto } from "./candidato-foto";
import { CandidatoModal } from "./candidato-modal";

export const ORB_LARGURA = 116;
export const ORB_ALTURA = 148;

export function CandidatoOrb({ candidato }: { candidato: Candidato }) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        style={{ width: ORB_LARGURA, height: ORB_ALTURA }}
        className="flex flex-col items-center gap-1.5 border border-line bg-card p-2 text-center shadow-[2px_2px_0_0_var(--line)] transition-colors hover:border-ink"
      >
        <CandidatoFoto candidato={candidato} />
        <span className="line-clamp-2 font-heading text-xs leading-tight">
          {candidato.nomeUrna}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-ink-muted">
          {candidato.partidoSigla} · nº{candidato.numero}
        </span>
      </button>

      {modalAberto && (
        <CandidatoModal candidato={candidato} onClose={() => setModalAberto(false)} />
      )}
    </>
  );
}
