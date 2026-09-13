"use client";

import { useState } from "react";

export function TermoExplicado({
  termo,
  explicacao,
}: {
  termo: string;
  explicacao: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <span
      className="relative inline-block cursor-help border-b border-dotted border-ink/50"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
      tabIndex={0}
    >
      {termo}
      {aberto && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 border border-ink bg-ink px-3 py-2 text-left text-xs font-normal normal-case tracking-normal text-paper shadow-[3px_3px_0_0_var(--line)]"
        >
          {explicacao}
        </span>
      )}
    </span>
  );
}
