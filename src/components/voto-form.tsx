"use client";

import { useEffect, useState } from "react";
import type { Candidato, DeputadoAtual } from "@/lib/candidatos";
import { UF_NOMES } from "@/lib/uf-nomes";
import { CandidatoPicker } from "./candidato-picker";
import { FederacaoResult, type Grupo } from "./federacao-result";

type Resultado = {
  candidato: Candidato;
  grupo: Grupo;
  membros: Candidato[];
  atuais: DeputadoAtual[];
};

const UF_STORAGE_KEY = "meu-voto:uf";

export function VotoForm({ ufs }: { ufs: string[] }) {
  const [uf, setUf] = useState("");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(UF_STORAGE_KEY);
      if (salvo && ufs.includes(salvo)) setUf(salvo);
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem estado salvo
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const podeConfirmar = uf && candidato && !loading;

  async function handleConfirmar() {
    if (!candidato) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/federacao?uf=${uf}&sq=${candidato.sq}`);
      if (!res.ok) throw new Error("Falha ao buscar federação");
      setResultado((await res.json()) as Resultado);
    } catch {
      setErro("Não foi possível carregar os dados da federação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="border border-ink bg-card p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-widest text-ink-muted">
              Estado
            </label>
            <select
              value={uf}
              onChange={(e) => {
                const novoUf = e.target.value;
                setUf(novoUf);
                setResultado(null);
                try {
                  if (novoUf) localStorage.setItem(UF_STORAGE_KEY, novoUf);
                  else localStorage.removeItem(UF_STORAGE_KEY);
                } catch {
                  // ignora se localStorage não estiver disponível
                }
              }}
              className="border border-line bg-card px-4 py-3 text-base outline-none focus:border-ink sm:max-w-sm"
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
            <CandidatoPicker
              uf={uf}
              value={candidato}
              onChange={(c) => {
                setCandidato(c);
                setResultado(null);
              }}
            />
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

      {resultado && (
        <FederacaoResult
          candidato={resultado.candidato}
          grupo={resultado.grupo}
          membros={resultado.membros}
          atuais={resultado.atuais}
        />
      )}
    </div>
  );
}
