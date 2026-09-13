import { NextRequest, NextResponse } from "next/server";
import { searchCandidatos } from "@/lib/candidatos";
import { ordenarPorRelevancia, registrarSelecao } from "@/lib/popularidade";

const MAX_RESULTADOS = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const q = searchParams.get("q") ?? "";

  if (!uf) {
    return NextResponse.json({ error: "Parâmetro uf é obrigatório" }, { status: 400 });
  }

  const candidatos = await searchCandidatos(uf, q);
  const ordenados = await ordenarPorRelevancia(uf, candidatos);
  return NextResponse.json({ candidatos: ordenados.slice(0, MAX_RESULTADOS) });
}

export async function POST(request: NextRequest) {
  const { uf, sq } = await request.json();
  if (!uf || !sq) {
    return NextResponse.json({ error: "Parâmetros uf e sq são obrigatórios" }, { status: 400 });
  }
  await registrarSelecao(uf, sq);
  return NextResponse.json({ ok: true });
}
