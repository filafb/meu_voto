"use client";

import { useState } from "react";
import type { Candidato } from "@/lib/candidatos";

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function CandidatoFoto({
  candidato,
  size = "sm",
  dark = false,
}: {
  candidato: Candidato;
  size?: "sm" | "lg";
  dark?: boolean;
}) {
  const [erro, setErro] = useState(false);

  const classeBase =
    size === "lg"
      ? "h-24 w-24 text-2xl"
      : "h-11 w-11 text-sm";

  if (erro) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center border font-heading ${classeBase} ${
          dark ? "border-paper/40 text-paper" : "border-ink/20 text-ink"
        }`}
      >
        {initials(candidato.nomeUrna)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/fotos/${candidato.sq}.jpg`}
      alt={candidato.nomeUrna}
      onError={() => setErro(true)}
      className={`shrink-0 border object-cover ${classeBase} ${
        dark ? "border-paper/40" : "border-ink/20"
      }`}
    />
  );
}
