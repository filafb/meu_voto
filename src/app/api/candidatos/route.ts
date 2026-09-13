import { NextRequest, NextResponse } from "next/server";
import { searchCandidatos, type Cargo } from "@/lib/candidatos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uf = searchParams.get("uf");
  const cargo = searchParams.get("cargo") as Cargo | null;
  const q = searchParams.get("q") ?? "";

  if (!uf || (cargo !== "federal" && cargo !== "estadual")) {
    return NextResponse.json({ error: "Parâmetros uf e cargo são obrigatórios" }, { status: 400 });
  }

  const candidatos = await searchCandidatos(uf, cargo, q);
  return NextResponse.json({ candidatos });
}
