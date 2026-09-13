import { NextRequest, NextResponse } from "next/server";
import { searchCandidatos } from "@/lib/candidatos";
import { ordenarPorPopularidade, registrarSelecao } from "@/lib/popularidade";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const q = searchParams.get("q") ?? "";

  if (!uf) {
    return NextResponse.json({ error: "Parâmetro uf é obrigatório" }, { status: 400 });
  }

  const candidatos = await searchCandidatos(uf, q);
  const ordenados = await ordenarPorPopularidade(uf, candidatos);
  return NextResponse.json({ candidatos: ordenados });
}

export async function POST(request: NextRequest) {
  const { uf, sq } = await request.json();
  if (!uf || !sq) {
    return NextResponse.json({ error: "Parâmetros uf e sq são obrigatórios" }, { status: 400 });
  }
  await registrarSelecao(uf, sq);
  return NextResponse.json({ ok: true });
}
