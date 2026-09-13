import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Cargo = "federal" | "estadual";

export type Candidato = {
  sq: string;
  numero: string;
  nome: string;
  nomeUrna: string;
  partidoSigla: string;
  partidoNumero: string;
  partidoNome: string;
  cargo: Cargo;
  uf: string;
  federacaoNr: number | null;
  federacaoSigla: string | null;
  federacaoNome: string | null;
  federacaoComposicao: string | null;
};

const DATA_DIR = join(process.cwd(), "public", "data");

const ufCache = new Map<string, Promise<Candidato[]>>();

async function loadUf(uf: string): Promise<Candidato[]> {
  const key = uf.toUpperCase();
  if (!ufCache.has(key)) {
    ufCache.set(
      key,
      readFile(join(DATA_DIR, `candidatos-${key}.json`), "utf-8")
        .then((raw) => JSON.parse(raw) as Candidato[])
        .catch(() => [])
    );
  }
  return ufCache.get(key)!;
}

let ufListCache: Promise<string[]> | null = null;

export async function listUfs(): Promise<string[]> {
  if (!ufListCache) {
    ufListCache = readFile(join(DATA_DIR, "ufs.json"), "utf-8").then(
      (raw) => JSON.parse(raw) as string[]
    );
  }
  return ufListCache;
}

export async function searchCandidatos(uf: string, query: string): Promise<Candidato[]> {
  const all = await loadUf(uf);
  const trimmed = query.trim();
  if (!trimmed) return [];

  const isNumero = /^\d+$/.test(trimmed);
  if (isNumero) {
    return all.filter((c) => c.numero.startsWith(trimmed)).slice(0, 30);
  }

  const q = normalize(trimmed);
  return all
    .filter((c) => normalize(c.nomeUrna).includes(q) || normalize(c.nome).includes(q))
    .slice(0, 30);
}

export async function getCandidato(uf: string, sq: string): Promise<Candidato | undefined> {
  const all = await loadUf(uf);
  return all.find((c) => c.sq === sq);
}

export async function getFederacaoMembros(
  uf: string,
  cargo: Cargo,
  federacaoNr: number
): Promise<Candidato[]> {
  const all = await loadUf(uf);
  return all
    .filter((c) => c.cargo === cargo && c.federacaoNr === federacaoNr)
    .sort((a, b) => a.partidoSigla.localeCompare(b.partidoSigla) || a.nomeUrna.localeCompare(b.nomeUrna));
}

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(s: string): string {
  return s.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}
