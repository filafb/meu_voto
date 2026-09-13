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
  genero: string | null;
  corRaca: string | null;
  grauInstrucao: string | null;
  estadoCivil: string | null;
  ocupacao: string | null;
  ufNascimento: string | null;
  municipioNascimento: string | null;
  idade: number | null;
  patrimonio: number | null;
  votos2022: number | null;
};

export type DeputadoAtual = {
  sq: string;
  numero: string;
  nome: string;
  nomeUrna: string;
  partidoSigla: string;
  partidoNome: string;
  cargo: Cargo;
  uf: string;
  votos2022: number | null;
};

const DATA_DIR = join(process.cwd(), "public", "data");

const ufCache = new Map<string, Promise<Candidato[]>>();
const atuaisCache = new Map<string, Promise<DeputadoAtual[]>>();

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
    return all.filter((c) => c.numero.startsWith(trimmed));
  }

  const q = normalize(trimmed);
  return all.filter((c) => normalize(c.nomeUrna).includes(q) || normalize(c.nome).includes(q));
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

export async function getPartidoMembros(
  uf: string,
  cargo: Cargo,
  partidoSigla: string
): Promise<Candidato[]> {
  const all = await loadUf(uf);
  return all
    .filter((c) => c.cargo === cargo && c.partidoSigla === partidoSigla)
    .sort((a, b) => a.nomeUrna.localeCompare(b.nomeUrna));
}

async function loadAtuaisUf(uf: string): Promise<DeputadoAtual[]> {
  const key = uf.toUpperCase();
  if (!atuaisCache.has(key)) {
    atuaisCache.set(
      key,
      readFile(join(DATA_DIR, `atuais-${key}.json`), "utf-8")
        .then((raw) => JSON.parse(raw) as DeputadoAtual[])
        .catch(() => [])
    );
  }
  return atuaisCache.get(key)!;
}

/** Deputadas/os eleitas/os em 2022 (ainda em mandato) por um conjunto de
 * siglas de partido, no mesmo cargo e estado — independe de a pessoa ser
 * candidata em 2026. */
export async function getAtuaisPorPartidos(
  uf: string,
  cargo: Cargo,
  siglas: string[]
): Promise<DeputadoAtual[]> {
  const todos = await loadAtuaisUf(uf);
  const siglasSet = new Set(siglas);
  return todos.filter((d) => d.cargo === cargo && siglasSet.has(d.partidoSigla));
}

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(s: string): string {
  return s.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}
