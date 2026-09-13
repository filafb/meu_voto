"use client";

import { useState } from "react";
import type { Candidato } from "@/lib/candidatos";
import { UF_NOMES } from "@/lib/uf-nomes";
import { CandidatoPicker } from "./candidato-picker";
import { FederacaoResult } from "./federacao-result";

type ResultadoCargo = {
  candidato: Candidato;
  federacao: {
    nr: number;
    sigla: string | null;
    nome: string | null;
    composicao: string | null;
  } | null;
  membros: Candidato[];
};

export function VotoForm({ ufs }: { ufs: string[] }) {
  const [uf, setUf] = useState("");
  const [federal, setFederal] = useState<Candidato | null>(null);
  const [estadual, setEstadual] = useState<Candidato | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoCargo[] | null>(null);

  const podeConfirmar = uf && (federal || estadual) && !loading;

  async function handleConfirmar() {
    setLoading(true);
    setErro(null);
    try {
      const selecionados = [federal, estadual].filter((c): c is Candidato => Boolean(c));
      const respostas = await Promise.all(
        selecionados.map(async (c) => {
          const res = await fetch(`/api/federacao?uf=${uf}&sq=${c.sq}`);
          if (!res.ok) throw new Error("Falha ao buscar federação");
          return (await res.json()) as ResultadoCargo;
        })
      );
      setResultados(respostas);
    } catch {
      setErro("Não foi possível carregar os dados da federação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="border border-ink bg-card p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-widest text-ink-muted">
              Estado
            </label>
            <select
              value={uf}
              onChange={(e) => {
                setUf(e.target.value);
                setResultados(null);
              }}
              className="border border-line bg-card px-4 py-3 text-base outline-none focus:border-ink"
            >
              <option value="">Selecione seu estado</option>
              {ufs.map((sigla) => (
                <option key={sigla} value={sigla}>
                  {UF_NOMES[sigla] ?? sigla} ({sigla})
                </option>
              ))}
            </select>
          </div>

          {uf && (
            <>
              <CandidatoPicker
                uf={uf}
                cargo="federal"
                label="Candidato a Deputado Federal"
                value={federal}
                onChange={(c) => {
                  setFederal(c);
                  setResultados(null);
                }}
              />
              <CandidatoPicker
                uf={uf}
                cargo="estadual"
                label="Candidato a Deputado Estadual"
                value={estadual}
                onChange={(c) => {
                  setEstadual(c);
                  setResultados(null);
                }}
              />
            </>
          )}
        </div>

        <button
          type="button"
          disabled={!podeConfirmar}
          onClick={handleConfirmar}
          className="mt-8 w-full border border-ink bg-ink py-3 font-heading text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:px-10"
        >
          {loading ? "Buscando…" : "Confirmar"}
        </button>

        {erro && <p className="mt-4 text-sm text-red-700">{erro}</p>}
      </div>

      {resultados && (
        <div className="flex flex-col gap-8">
          {resultados.map((r) => (
            <FederacaoResult
              key={r.candidato.sq}
              candidato={r.candidato}
              federacao={r.federacao}
              membros={r.membros}
            />
          ))}
        </div>
      )}
    </div>
  );
}
