import { NextRequest, NextResponse } from "next/server";
import { getAtuaisPorPartidos, getCandidato, getFederacaoMembros, getPartidoMembros } from "@/lib/candidatos";
import { ordenarPorRelevancia } from "@/lib/popularidade";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const sq = searchParams.get("sq");

  if (!uf || !sq) {
    return NextResponse.json({ error: "Parâmetros uf e sq são obrigatórios" }, { status: 400 });
  }

  const candidato = await getCandidato(uf, sq);
  if (!candidato) {
    return NextResponse.json({ error: "Candidata/o não encontrada/o" }, { status: 404 });
  }

  if (candidato.federacaoNr) {
    const siglas = (candidato.federacaoComposicao ?? "")
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    const [membros, atuais] = await Promise.all([
      ordenarPorRelevancia(uf, await getFederacaoMembros(uf, candidato.cargo, candidato.federacaoNr)),
      getAtuaisPorPartidos(uf, candidato.cargo, siglas),
    ]);
    return NextResponse.json({
      candidato,
      grupo: {
        tipo: "federacao",
        nome: candidato.federacaoNome,
        sigla: candidato.federacaoSigla,
        composicao: candidato.federacaoComposicao,
      },
      membros,
      atuais,
    });
  }

  const [membros, atuais] = await Promise.all([
    ordenarPorRelevancia(uf, await getPartidoMembros(uf, candidato.cargo, candidato.partidoSigla)),
    getAtuaisPorPartidos(uf, candidato.cargo, [candidato.partidoSigla]),
  ]);
  return NextResponse.json({
    candidato,
    grupo: {
      tipo: "partido",
      nome: candidato.partidoNome,
      sigla: candidato.partidoSigla,
      composicao: null,
    },
    membros,
    atuais,
  });
}
