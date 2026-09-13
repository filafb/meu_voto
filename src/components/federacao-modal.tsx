"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoCard } from "./candidato-card";
import { FederacaoGlobo } from "./federacao-globo";
import { PartidoBadge } from "./partido-badge";
import type { Grupo } from "./federacao-result";

const MAX_EXIBIDOS = 60;

export function FederacaoModal({
  candidato,
  grupo,
  membros,
  onClose,
}: {
  candidato: Candidato;
  grupo: Grupo;
  membros: Candidato[];
  onClose: () => void;
}) {
  const [filtro, setFiltro] = useState("");
  const [modoLista, setModoLista] = useState(false);

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

  const filtrados = useMemo(() => {
    const outros = membros.filter((m) => m.sq !== candidato.sq);
    if (!filtro.trim()) return outros;
    const q = filtro.toLowerCase();
    return outros.filter(
      (m) => m.nomeUrna.toLowerCase().includes(q) || m.partidoSigla.toLowerCase().includes(q)
    );
  }, [membros, filtro, candidato.sq]);

  const exibidos = filtrados.slice(0, MAX_EXIBIDOS);
  const truncado = filtrados.length > MAX_EXIBIDOS;

  const ehFederacao = grupo.tipo === "federacao";
  const partidosDaFederacao = ehFederacao
    ? (grupo.composicao ?? "").split("/").map((s) => s.trim()).filter(Boolean)
    : [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-paper"
      role="dialog"
      aria-modal="true"
      aria-label={`Candidatas/os de ${grupo.nome}`}
    >
      <header className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            {candidato.cargo === "federal" ? "Deputada/o Federal" : "Deputada/o Estadual"} ·{" "}
            {candidato.uf}
          </p>
          <h2 className="mt-1 font-heading text-2xl">{grupo.nome}</h2>
          {partidosDaFederacao.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {partidosDaFederacao.map((sigla) => (
                <PartidoBadge key={sigla} sigla={sigla} />
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="shrink-0 self-start border border-line px-3 py-1.5 text-sm text-ink-muted hover:border-ink hover:text-ink"
        >
          ✕ Fechar
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:px-6 sm:py-4">
        <p className="font-heading text-sm text-ink-muted">
          {filtrados.length} candidatas/os
        </p>
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="filtrar por nome ou partido"
          className="border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-ink"
        />
        <div className="ml-auto flex border border-line">
          <button
            type="button"
            onClick={() => setModoLista(false)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wide ${
              !modoLista ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
            }`}
          >
            Globo
          </button>
          <button
            type="button"
            onClick={() => setModoLista(true)}
            className={`border-l border-line px-3 py-1.5 text-xs uppercase tracking-wide ${
              modoLista ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 max-w-sm">
          <CandidatoCard candidato={candidato} destaque />
        </div>

        {exibidos.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma outra candidata/o encontrada/o.</p>
        ) : modoLista ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exibidos.map((m) => (
              <CandidatoCard key={m.sq} candidato={m} />
            ))}
          </div>
        ) : (
          <FederacaoGlobo membros={exibidos} />
        )}

        {truncado && (
          <p className="mt-4 text-center text-xs text-ink-muted">
            Mostrando {MAX_EXIBIDOS} de {filtrados.length} — use o filtro para refinar.
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
