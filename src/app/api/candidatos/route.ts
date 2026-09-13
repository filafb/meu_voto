import { NextRequest, NextResponse } from "next/server";
import { searchCandidatos } from "@/lib/candidatos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const q = searchParams.get("q") ?? "";

  if (!uf) {
    return NextResponse.json({ error: "Parâmetro uf é obrigatório" }, { status: 400 });
  }

  const candidatos = await searchCandidatos(uf, q);
  return NextResponse.json({ candidatos });
}
