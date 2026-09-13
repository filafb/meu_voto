import { NextRequest, NextResponse } from "next/server";
import { getCandidato, getFederacaoMembros } from "@/lib/candidatos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const sq = searchParams.get("sq");

  if (!uf || !sq) {
    return NextResponse.json({ error: "Parâmetros uf e sq são obrigatórios" }, { status: 400 });
  }

  const candidato = await getCandidato(uf, sq);
  if (!candidato) {
    return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
  }

  if (!candidato.federacaoNr) {
    return NextResponse.json({ candidato, federacao: null, membros: [] });
  }

  const membros = await getFederacaoMembros(uf, candidato.cargo, candidato.federacaoNr);
  return NextResponse.json({
    candidato,
    federacao: {
      nr: candidato.federacaoNr,
      sigla: candidato.federacaoSigla,
      nome: candidato.federacaoNome,
      composicao: candidato.federacaoComposicao,
    },
    membros,
  });
}
