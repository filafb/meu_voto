import { NextRequest, NextResponse } from "next/server";
import { getCandidato, searchCandidatos } from "@/lib/candidatos";
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

function ipDoCliente(request: NextRequest): string {
  // NextRequest.ip foi removido no Next 15 — o jeito recomendado é ler o
  // cabeçalho que a Vercel já preenche. Sem ele (dev local), todo mundo cai
  // no mesmo balde do limitador, o que não é um problema fora de produção.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
}

export async function POST(request: NextRequest) {
  const { uf, sq } = await request.json();
  if (!uf || !sq) {
    return NextResponse.json({ error: "Parâmetros uf e sq são obrigatórios" }, { status: 400 });
  }

  // Só registra se for uma candidatura real — evita poluir o placar do
  // Redis com chaves inventadas por quem for chamar a rota diretamente.
  const candidato = await getCandidato(uf, sq);
  if (!candidato) {
    return NextResponse.json({ error: "Candidata/o não encontrada/o" }, { status: 404 });
  }

  const aceito = await registrarSelecao(uf, sq, ipDoCliente(request));
  if (!aceito) {
    return NextResponse.json({ error: "Muitas requisições, tente novamente em instantes" }, { status: 429 });
  }

  return NextResponse.json({ ok: true });
}
