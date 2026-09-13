"use client";

import { useEffect, useRef, useState } from "react";
import type { Candidato, Cargo } from "@/lib/candidatos";

type Props = {
  uf: string;
  cargo: Cargo;
  label: string;
  value: Candidato | null;
  onChange: (candidato: Candidato | null) => void;
};

export function CandidatoPicker({ uf, cargo, label, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidato[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery("");
    setResults([]);
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uf, cargo]);

  useEffect(() => {
    if (value) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/candidatos?uf=${uf}&cargo=${cargo}&q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data) => setResults(data.candidatos ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, uf, cargo, value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      <label className="text-xs font-medium uppercase tracking-widest text-ink-muted">
        {label}
      </label>

      {value ? (
        <div className="flex items-center justify-between border border-ink bg-card px-4 py-3">
          <div>
            <p className="font-heading text-lg leading-none">{value.nomeUrna}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {value.partidoSigla} · nº {value.numero}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs uppercase tracking-wide text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            trocar
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Digite o nome do candidato..."
          className="border border-line bg-card px-4 py-3 font-body text-base outline-none focus:border-ink"
        />
      )}

      {open && !value && query.trim().length >= 2 && (
        <div className="absolute top-full z-10 mt-1 max-h-72 w-full overflow-auto border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
          {loading && <p className="px-4 py-3 text-sm text-ink-muted">buscando…</p>}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-muted">nenhum candidato encontrado</p>
          )}
          {results.map((c) => (
            <button
              key={c.sq}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between border-b border-line px-4 py-2.5 text-left last:border-none hover:bg-paper"
            >
              <span>
                <span className="font-medium">{c.nomeUrna}</span>{" "}
                <span className="text-sm text-ink-muted">({c.nome})</span>
              </span>
              <span className="shrink-0 pl-2 text-xs text-ink-muted">
                {c.partidoSigla} nº{c.numero}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
