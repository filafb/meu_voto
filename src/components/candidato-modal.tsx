"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoFoto } from "./candidato-foto";
import { CargoTag } from "./cargo-tag";

function capitalizar(s: string | null) {
  if (!s) return null;
  return s
    .toLowerCase()
    .split(" ")
    .map((p) => (p.length > 2 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export function CandidatoModal({
  candidato,
  onClose,
}: {
  candidato: Candidato;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const naturalidade = [candidato.municipioNascimento, candidato.ufNascimento]
    .filter(Boolean)
    .join(" / ");

  const detalhes: Array<[string, string | null]> = [
    ["Idade", candidato.idade ? `${candidato.idade} anos` : null],
    ["Naturalidade", naturalidade || null],
    ["Gênero", capitalizar(candidato.genero)],
    ["Cor/raça", capitalizar(candidato.corRaca)],
    ["Estado civil", capitalizar(candidato.estadoCivil)],
    ["Escolaridade", capitalizar(candidato.grauInstrucao)],
    ["Ocupação", capitalizar(candidato.ocupacao)],
    [
      "Concorre à reeleição",
      candidato.reeleicao === null ? "Ainda não informado pelo TSE" : candidato.reeleicao ? "Sim" : "Não",
    ],
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-ink bg-paper p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${candidato.nomeUrna}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <CandidatoFoto candidato={candidato} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-2xl leading-tight">{candidato.nomeUrna}</h2>
                <CargoTag cargo={candidato.cargo} />
                {candidato.reeleicao && (
                  <span className="border border-ink/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    Reeleição
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-muted">{candidato.nome}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {candidato.partidoNome} ({candidato.partidoSigla}) · nº {candidato.numero}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 border border-line px-2 py-1 text-sm text-ink-muted hover:border-ink hover:text-ink"
          >
            ✕
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
          {detalhes
            .filter(([, valor]) => valor)
            .map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt className="text-xs uppercase tracking-widest text-ink-muted">{rotulo}</dt>
                <dd className="mt-0.5 text-sm">{valor}</dd>
              </div>
            ))}
        </dl>

        {candidato.federacaoNome && (
          <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">
            Federação: {candidato.federacaoNome} ({candidato.federacaoComposicao})
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
